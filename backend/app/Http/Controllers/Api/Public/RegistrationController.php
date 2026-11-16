<?php

namespace App\Http\Controllers\Api\Public;

use App\Exceptions\RegistrationException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\RegisterParticipantRequest;
use App\Models\Participant;
use App\Services\PaymentService;
use App\Services\RegistrationService;
use App\Services\SlotService;
use Illuminate\Http\JsonResponse;

class RegistrationController extends Controller
{
    public function __construct(
        protected RegistrationService $registration,
        protected PaymentService $payments,
        protected SlotService $slots,
    ) {}

    /**
     * GET /api/registration/{token}
     * Lets a runner resume checkout from the link in an email (e.g. after a
     * payment was rejected). The token is the only credential.
     */
    public function show(string $token): JsonResponse
    {
        $participant = Participant::where('public_token', $token)->firstOrFail();
        $this->slots->releaseExpiredReservations();
        $participant->refresh();

        return response()->json([
            'data' => [
                'participant' => $participant->publicSummary(),
                'fee' => $this->payments->calculateFee($participant),
                'hold_expires_at' => $participant->slot_reserved_until?->toIso8601String(),
                'can_pay' => $participant->reservationActive(),
            ],
        ]);
    }

    /**
     * POST /api/registration
     * Reserves a slot for a new participant and returns the participant
     * record + fee. Frontend then calls the payment initiation endpoint.
     */
    public function store(RegisterParticipantRequest $request): JsonResponse
    {
        try {
            $participant = $this->registration->reserveSlot($request->validated());
        } catch (RegistrationException $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'slots' => $this->slots->summary(),
            ], $e->getStatusCode());
        }

        return response()->json([
            'message' => 'Slot reserved. Please complete payment within '
                .config('marathon.slots.hold_minutes').' minutes.',
            'data' => [
                'participant' => $participant->publicSummary(),
                'fee' => $this->payments->calculateFee($participant),
                'hold_expires_at' => $participant->slot_reserved_until?->toIso8601String(),
            ],
            'slots' => $this->slots->summary(),
        ], 201);
    }
}
