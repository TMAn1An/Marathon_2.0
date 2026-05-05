<?php

namespace App\Services;

use App\Models\Participant;
use Illuminate\Support\Facades\DB;

class SlotService
{
    /**
     * Returns the total slots configured for the event.
     */
    public function totalSlots(): int
    {
        return (int) config('marathon.slots.total');
    }

    /**
     * Number of slots that are currently consumed: confirmed registrations
     * plus active (non-expired) reservations awaiting payment.
     */
    public function usedSlots(): int
    {
        $now = now();

        return (int) Participant::query()
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

    public function availableSlots(): int
    {
        return max(0, $this->totalSlots() - $this->usedSlots());
    }

    public function isFull(): bool
    {
        return $this->availableSlots() <= 0;
    }

    /**
     * Releases reservations whose hold has expired and that are not yet
     * confirmed. Safe to call frequently; idempotent.
     */
    public function releaseExpiredReservations(): int
    {
        return DB::transaction(function () {
            return Participant::query()
                ->whereIn('status', [
                    Participant::STATUS_RESERVED,
                    Participant::STATUS_PENDING_PAYMENT,
                ])
                ->whereNotNull('slot_reserved_until')
                ->where('slot_reserved_until', '<', now())
                ->update([
                    'status' => Participant::STATUS_CANCELLED,
                ]);
        });
    }

    public function summary(): array
    {
        $this->releaseExpiredReservations();
        $total = $this->totalSlots();
        $used = $this->usedSlots();

        return [
            'total' => $total,
            'used' => $used,
            'available' => max(0, $total - $used),
            'is_full' => $used >= $total,
        ];
    }
}
