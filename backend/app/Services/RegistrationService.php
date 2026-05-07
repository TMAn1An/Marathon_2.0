<?php

namespace App\Services;

use App\Exceptions\RegistrationException;
use App\Models\Event;
use App\Models\Participant;
use Illuminate\Support\Facades\DB;

class RegistrationService
{
    public function __construct(
        protected SlotService $slotService,
    ) {}

    /**
     * Reserve a slot for a public participant. Validates that registration is
     * open, that no active (pending/confirmed) registration exists for the
     * same email/phone in this event, and that the public slot pool isn't
     * exhausted. Atomic / serializable.
     *
     * @param  array<string,mixed>  $data
     */
    public function reservePublicSlot(Event $event, array $data): Participant
    {
        $this->assertEventOpenForPublic($event);
        $this->slotService->releaseExpiredReservations($event);

        return DB::transaction(function () use ($event, $data) {
            $this->assertCategoryIsPublic($data['category'] ?? null);
            $this->assertNoActiveDuplicate($event, $data['email'], $data['phone']);

            if ($this->slotService->isPublicFull($event)) {
                throw new RegistrationException(
                    'Sorry, all public slots for this event have been filled.',
                    410
                );
            }

            return Participant::create($this->payload($event, $data, Participant::STATUS_RESERVED));
        });
    }

    /**
     * Admin-side guest creation. Bypasses public registration lock and the
     * public slot pool — guests sit in a reserved BIB range (1..guest_limit).
     */
    public function createGuestParticipant(Event $event, array $data): Participant
    {
        return DB::transaction(function () use ($event, $data) {
            $this->assertNoActiveDuplicate($event, $data['email'], $data['phone']);

            $guestUsed = $this->slotService->usedSlots($event, Participant::CATEGORY_GUEST);
            if ($guestUsed >= $event->guest_slot_limit) {
                throw new RegistrationException(
                    'Guest reservation is full for this event.',
                    410
                );
            }

            return Participant::create($this->payload(
                $event,
                array_merge($data, ['category' => Participant::CATEGORY_GUEST]),
                Participant::STATUS_CONFIRMED,
                confirmed: true,
            ));
        });
    }

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

        $event = $participant->event ?? Event::query()->find($participant->event_id);
        $hold = $event?->hold_minutes ?? (int) config('marathon.event_defaults.hold_minutes');

        $participant->slot_reserved_until = now()->addMinutes($hold);
        $participant->save();

        return true;
    }

    protected function payload(Event $event, array $data, string $status, bool $confirmed = false): array
    {
        return [
            'event_id' => $event->id,
            'full_name' => $data['full_name'],
            'university_id' => $data['university_id'] ?? null,
            'category' => $data['category'],
            'gender' => $data['gender'] ?? null,
            'department' => $data['department'] ?? null,
            'phone' => $data['phone'],
            'email' => strtolower($data['email']),
            'emergency_contact' => $data['emergency_contact'] ?? null,
            'tshirt_size' => $data['tshirt_size'],
            'status' => $status,
            'slot_reserved_until' => $confirmed ? null : now()->addMinutes($event->hold_minutes),
            'confirmed_at' => $confirmed ? now() : null,
        ];
    }

    protected function assertCategoryIsPublic(?string $category): void
    {
        if (! in_array($category, Participant::PUBLIC_CATEGORIES, true)) {
            throw new RegistrationException(
                'Only student or faculty registrations are allowed from the public form.',
                422
            );
        }
    }

    protected function assertEventOpenForPublic(Event $event): void
    {
        if ($event->isPast()) {
            throw new RegistrationException(
                'This event has already concluded; registration is closed.',
                410
            );
        }

        if (! $event->registrationOpen()) {
            throw new RegistrationException(
                'Registration is not open yet for this event.',
                423
            );
        }
    }

    protected function assertNoActiveDuplicate(Event $event, string $email, string $phone): void
    {
        $email = strtolower($email);

        $existing = Participant::query()
            ->where('event_id', $event->id)
            ->where(function ($q) use ($email, $phone) {
                $q->where('email', $email)->orWhere('phone', $phone);
            })
            ->whereIn('status', [
                Participant::STATUS_RESERVED,
                Participant::STATUS_PENDING_PAYMENT,
                Participant::STATUS_CONFIRMED,
            ])
            ->first();

        if ($existing) {
            throw new RegistrationException(
                'A participant with this email or phone is already registered for this event.',
                409
            );
        }
    }
}
