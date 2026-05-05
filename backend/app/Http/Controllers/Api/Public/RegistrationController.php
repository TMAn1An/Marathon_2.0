<?php

namespace App\Http\Controllers\Api\Public;

use App\Exceptions\RegistrationException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\RegisterParticipantRequest;
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
                . config('marathon.slots.hold_minutes') . ' minutes.',
            'data' => [
                'participant' => $participant,
                'fee' => $this->payments->calculateFee($participant),
                'hold_expires_at' => $participant->slot_reserved_until?->toIso8601String(),
            ],
            'slots' => $this->slots->summary(),
        ], 201);
    }
}
