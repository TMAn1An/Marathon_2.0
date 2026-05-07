<?php

namespace App\Services;

use App\Models\Event;
use App\Models\Participant;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class BibService
{
    /**
     * Format a BIB number for the given sequence within an event.
     *
     * BIB layout: PREFIX SEPARATOR ZERO-PADDED-NUMBER
     * Example: MIN_0001
     */
    public function format(int $sequence): string
    {
        $prefix = (string) config('marathon.bib.prefix');
        $sep = (string) config('marathon.bib.separator');
        $pad = (int) config('marathon.bib.pad_length');

        return $prefix.$sep.str_pad((string) $sequence, $pad, '0', STR_PAD_LEFT);
    }

    /**
     * Assign a BIB to a participant. Public participants get sequence numbers
     * starting at the event's `publicSlotStart()` (default 31). Guests
     * (admin-only category) take the reserved range 1..guest_slot_limit.
     *
     * Concurrency-safe: row-locks the participant inside a transaction and
     * scans for the next available sequence in the relevant range.
     */
    public function assign(Participant $participant): string
    {
        if ($participant->bib_number) {
            return $participant->bib_number;
        }

        return DB::transaction(function () use ($participant) {
            /** @var Participant $locked */
            $locked = Participant::query()
                ->whereKey($participant->getKey())
                ->lockForUpdate()
                ->first();

            if ($locked->bib_number) {
                return $locked->bib_number;
            }

            $event = Event::query()->findOrFail($locked->event_id);

            [$start, $end] = $locked->isGuest()
                ? [1, $event->guest_slot_limit]
                : [$event->publicSlotStart(), $event->total_slots];

            $sequence = $this->nextSequence($event->id, $start, $end);
            if ($sequence === null) {
                throw new RuntimeException(
                    sprintf('No BIB numbers available in range %d..%d for event %d', $start, $end, $event->id)
                );
            }

            $candidate = $this->format($sequence);

            $locked->bib_number = $candidate;
            $locked->save();

            $participant->bib_number = $candidate;

            return $candidate;
        });
    }

    /**
     * Find the lowest unused sequence number in [start, end] for an event.
     */
    protected function nextSequence(int $eventId, int $start, int $end): ?int
    {
        $taken = Participant::query()
            ->where('event_id', $eventId)
            ->whereNotNull('bib_number')
            ->pluck('bib_number')
            ->map(fn ($bib) => $this->extractSequence($bib))
            ->filter(fn ($n) => $n !== null && $n >= $start && $n <= $end)
            ->all();

        $taken = array_flip($taken);
        for ($i = $start; $i <= $end; $i++) {
            if (! isset($taken[$i])) {
                return $i;
            }
        }

        return null;
    }

    public function extractSequence(string $bibNumber): ?int
    {
        $sep = (string) config('marathon.bib.separator');
        $prefix = (string) config('marathon.bib.prefix');

        if (! str_starts_with($bibNumber, $prefix.$sep)) {
            return null;
        }

        $tail = substr($bibNumber, strlen($prefix.$sep));
        if ($tail === '' || ! ctype_digit($tail)) {
            return null;
        }

        return (int) $tail;
    }
}
