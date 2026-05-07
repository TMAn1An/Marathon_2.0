<?php

namespace App\Services;

use App\Models\Event;
use App\Models\Participant;
use Illuminate\Support\Facades\DB;

class SlotService
{
    /**
     * Active slots = confirmed participants + non-expired reservations.
     */
    public function usedSlots(Event $event, ?string $category = null): int
    {
        $now = now();

        $query = Participant::query()
            ->where('event_id', $event->id)
            ->where(function ($q) use ($now) {
                $q->where('status', Participant::STATUS_CONFIRMED)
                    ->orWhere(function ($q2) use ($now) {
                        $q2->whereIn('status', [
                            Participant::STATUS_RESERVED,
                            Participant::STATUS_PENDING_PAYMENT,
                        ])->where('slot_reserved_until', '>=', $now);
                    });
            });

        if ($category) {
            $query->where('category', $category);
        }

        return (int) $query->count();
    }

    public function publicCapacity(Event $event): int
    {
        return max(0, $event->total_slots - $event->guest_slot_limit);
    }

    public function publicUsed(Event $event): int
    {
        $now = now();

        return (int) Participant::query()
            ->where('event_id', $event->id)
            ->whereIn('category', Participant::PUBLIC_CATEGORIES)
            ->where(function ($q) use ($now) {
                $q->where('status', Participant::STATUS_CONFIRMED)
                    ->orWhere(function ($q2) use ($now) {
                        $q2->whereIn('status', [
                            Participant::STATUS_RESERVED,
                            Participant::STATUS_PENDING_PAYMENT,
                        ])->where('slot_reserved_until', '>=', $now);
                    });
            })
            ->count();
    }

    public function isPublicFull(Event $event): bool
    {
        return $this->publicUsed($event) >= $this->publicCapacity($event);
    }

    public function releaseExpiredReservations(?Event $event = null): int
    {
        return DB::transaction(function () use ($event) {
            $query = Participant::query()
                ->whereIn('status', [
                    Participant::STATUS_RESERVED,
                    Participant::STATUS_PENDING_PAYMENT,
                ])
                ->whereNotNull('slot_reserved_until')
                ->where('slot_reserved_until', '<', now());

            if ($event) {
                $query->where('event_id', $event->id);
            }

            return $query->update([
                'status' => Participant::STATUS_CANCELLED,
            ]);
        });
    }

    /**
     * Public-safe summary — never exposes raw counts directly.
     * Returns segment percentages for the analytics donut chart.
     */
    public function publicAnalytics(Event $event): array
    {
        $this->releaseExpiredReservations($event);

        $studentUsed = $this->usedSlots($event, Participant::CATEGORY_STUDENT);
        $facultyUsed = $this->usedSlots($event, Participant::CATEGORY_FACULTY);
        $guestReserved = $event->guest_slot_limit;

        $total = max(1, $event->total_slots);

        return [
            'segments' => [
                [
                    'label' => 'Students',
                    'percent' => round(($studentUsed / $total) * 100, 1),
                    'tone' => 'student',
                ],
                [
                    'label' => 'Faculty',
                    'percent' => round(($facultyUsed / $total) * 100, 1),
                    'tone' => 'faculty',
                ],
                [
                    'label' => 'Guests',
                    'percent' => round(($guestReserved / $total) * 100, 1),
                    'tone' => 'guest',
                ],
            ],
            'note' => 'A percentage of slots are exclusively reserved for special guests.',
        ];
    }

    /**
     * Admin-only summary with raw numbers.
     */
    public function adminSummary(Event $event): array
    {
        $this->releaseExpiredReservations($event);

        return [
            'event_id' => $event->id,
            'total_slots' => $event->total_slots,
            'guest_reserved' => $event->guest_slot_limit,
            'public_capacity' => $this->publicCapacity($event),
            'public_used' => $this->publicUsed($event),
            'student_used' => $this->usedSlots($event, Participant::CATEGORY_STUDENT),
            'faculty_used' => $this->usedSlots($event, Participant::CATEGORY_FACULTY),
            'guest_used' => $this->usedSlots($event, Participant::CATEGORY_GUEST),
        ];
    }
}
