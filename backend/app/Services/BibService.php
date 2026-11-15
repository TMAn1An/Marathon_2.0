<?php

namespace App\Services;

use App\Models\Participant;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;

class BibService
{
    private const MAX_ATTEMPTS = 5;

    /**
     * Assigns the next sequential BIB number (RUN0001, RUN0002, …) to a
     * participant. Idempotent: an existing BIB is returned unchanged.
     * The unique index is the final arbiter; a concurrent collision is
     * retried with a fresh candidate.
     */
    public function assign(Participant $participant): string
    {
        if ($participant->bib_number) {
            return $participant->bib_number;
        }

        for ($attempt = 1; ; $attempt++) {
            try {
                return DB::transaction(fn () => $this->assignOnce($participant));
            } catch (UniqueConstraintViolationException $e) {
                if ($attempt >= self::MAX_ATTEMPTS) {
                    throw $e;
                }
            }
        }
    }

    protected function assignOnce(Participant $participant): string
    {
        /** @var Participant $locked */
        $locked = Participant::query()->whereKey($participant->getKey())->lockForUpdate()->firstOrFail();

        if ($locked->bib_number) {
            $participant->bib_number = $locked->bib_number;

            return $locked->bib_number;
        }

        $prefix = (string) config('marathon.bib.prefix');
        $pad = (int) config('marathon.bib.pad_length');

        $next = Participant::query()->whereNotNull('bib_number')->count() + 1;
        do {
            $candidate = $prefix.str_pad((string) $next, $pad, '0', STR_PAD_LEFT);
            $taken = Participant::query()->where('bib_number', $candidate)->exists();
            $next++;
        } while ($taken);

        $locked->bib_number = $candidate;
        $locked->save();
        $participant->bib_number = $candidate;

        return $candidate;
    }
}
