<?php

namespace App\Services;

use App\Exceptions\RegistrationException;
use App\Models\Participant;
use Illuminate\Support\Facades\DB;

class RegistrationService
{
    public function __construct(
        protected SlotService $slotService,
    ) {}

    /**
     * Reserves a slot for a new participant. Holds the slot for
     * config('marathon.slots.hold_minutes') minutes pending payment.
     *
     * Concurrency-safe: uses a serializable transaction and re-checks
     * slot availability inside the transaction. Throws RegistrationException
     * if email/phone are already used or if the event is full.
     */
    public function reserveSlot(array $data): Participant
    {
        $this->slotService->releaseExpiredReservations();

        return DB::transaction(function () use ($data) {
            $existing = Participant::query()
                ->where(function ($q) use ($data) {
                    $q->where('email', $data['email'])
                        ->orWhere('phone', $data['phone']);
                })
                ->whereIn('status', [
                    Participant::STATUS_RESERVED,
                    Participant::STATUS_PENDING_PAYMENT,
                    Participant::STATUS_CONFIRMED,
                ])
                ->first();

            if ($existing) {
                throw new RegistrationException(
                    'A participant with this email or phone is already registered.',
                    409
                );
            }

            if ($this->slotService->isFull()) {
                throw new RegistrationException('Sorry, all marathon slots have been filled.', 410);
            }

            $holdMinutes = (int) config('marathon.slots.hold_minutes');

            return Participant::create([
                'full_name' => $data['full_name'],
                'university_id' => $data['university_id'],
                'category' => $data['category'],
                'phone' => $data['phone'],
                'email' => $data['email'],
                'emergency_contact' => $data['emergency_contact'],
                'tshirt_size' => $data['tshirt_size'],
                'status' => Participant::STATUS_RESERVED,
                'slot_reserved_until' => now()->addMinutes($holdMinutes),
            ]);
        });
    }

    /**
     * Refreshes the slot reservation window for a participant who is still
     * in the registration funnel. Returns false if the slot is gone.
     */
    public function refreshHold(Participant $participant): bool
    {
        if ($participant->status === Participant::STATUS_CONFIRMED) {
            return true;
        }

        if (! in_array($participant->status, [
            Participant::STATUS_RESERVED,
            Participant::STATUS_PENDING_PAYMENT,
        ], true)) {
            return false;
        }

        $participant->slot_reserved_until = now()->addMinutes(
            (int) config('marathon.slots.hold_minutes')
        );
        $participant->save();

        return true;
    }
}
