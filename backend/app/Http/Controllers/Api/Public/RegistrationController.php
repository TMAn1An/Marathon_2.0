<?php

namespace App\Http\Controllers\Api\Public;

use App\Exceptions\RegistrationException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\RegisterParticipantRequest;
use App\Models\Event;
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

    public function store(Event $event, RegisterParticipantRequest $request): JsonResponse
    {
        try {
            $participant = $this->registration->reservePublicSlot($event, $request->validated());
        } catch (RegistrationException $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'analytics' => $this->slots->publicAnalytics($event),
            ], $e->getStatusCode());
        }

        return response()->json([
            'message' => 'Slot reserved. Complete payment within '
                .$event->hold_minutes.' minutes.',
            'data' => [
                'participant' => [
                    'id' => $participant->id,
                    'full_name' => $participant->full_name,
                    'category' => $participant->category,
                    'status' => $participant->status,
                    'event_id' => $participant->event_id,
                ],
                'fee' => $this->payments->calculateFee($participant),
                'hold_expires_at' => $participant->slot_reserved_until?->toIso8601String(),
                'event' => [
                    'slug' => $event->slug,
                    'title' => $event->title,
                ],
            ],
        ], 201);
    }
}
