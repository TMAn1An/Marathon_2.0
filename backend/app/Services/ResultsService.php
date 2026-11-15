<?php

namespace App\Services;

use App\Models\Participant;
use Illuminate\Support\Collection;

class ResultsService
{
    /** Finishers ordered by time, with overall and per-category rank. */
    public function leaderboard(?string $category = null): Collection
    {
        $rows = Participant::query()
            ->where('status', Participant::STATUS_CONFIRMED)
            ->whereNotNull('finish_time_seconds')
            ->orderBy('finish_time_seconds')
            ->orderBy('id')
            ->get(['id', 'bib_number', 'full_name', 'category', 'finish_time_seconds']);

        $perCategory = [];
        $ranked = $rows->values()->map(function (Participant $p, int $i) use (&$perCategory) {
            $perCategory[$p->category] = ($perCategory[$p->category] ?? 0) + 1;

            return [
                'rank' => $i + 1,
                'category_rank' => $perCategory[$p->category],
                'bib_number' => $p->bib_number,
                'full_name' => $p->full_name,
                'category' => $p->category,
                'finish_time' => $p->finish_time,
            ];
        });

        return $category ? $ranked->where('category', $category)->values() : $ranked;
    }

    public function rankOf(Participant $participant): ?int
    {
        return $this->leaderboard()->firstWhere('bib_number', $participant->bib_number)['rank'] ?? null;
    }

    /**
     * Applies [['bib' => 'IUB0007', 'time' => '0:52:14'], …].
     * Returns ['updated' => n, 'errors' => [row => message]].
     */
    public function import(array $rows): array
    {
        $updated = 0;
        $errors = [];

        foreach ($rows as $i => $row) {
            $line = $i + 1;
            $bib = strtoupper(trim((string) ($row['bib'] ?? '')));
            $seconds = Participant::parseFinishTime($row['time'] ?? null);

            if ($bib === '' || $seconds === null) {
                $errors[$line] = 'Needs a BIB and a time in H:MM:SS format.';

                continue;
            }

            $participant = Participant::query()
                ->where('bib_number', $bib)
                ->where('status', Participant::STATUS_CONFIRMED)
                ->first();

            if (! $participant) {
                $errors[$line] = "No confirmed runner with BIB {$bib}.";

                continue;
            }

            $participant->update(['finish_time_seconds' => $seconds]);
            $updated++;
        }

        return ['updated' => $updated, 'errors' => $errors];
    }
}
