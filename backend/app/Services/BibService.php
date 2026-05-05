<?php

namespace App\Services;

use App\Models\Participant;
use Illuminate\Support\Facades\DB;

class BibService
{
    /**
     * Generates and assigns a unique BIB number to a participant.
     * Idempotent: if the participant already has a BIB number it is returned
     * unchanged. Uses a single transaction with a row-level lock on the
     * participant row to avoid concurrent collisions.
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

            $prefix = (string) config('marathon.bib.prefix');
            $pad = (int) config('marathon.bib.pad_length');

            $maxId = (int) Participant::query()
                ->whereNotNull('bib_number')
                ->max('id');

            $next = max($maxId, $locked->id);
            do {
                $candidate = $prefix . str_pad((string) $next, $pad, '0', STR_PAD_LEFT);
                $exists = Participant::query()
                    ->where('bib_number', $candidate)
                    ->where('id', '<>', $locked->id)
                    ->exists();
                $next++;
            } while ($exists);

            $locked->bib_number = $candidate;
            $locked->save();

            $participant->bib_number = $candidate;

            return $candidate;
        });
    }
}
