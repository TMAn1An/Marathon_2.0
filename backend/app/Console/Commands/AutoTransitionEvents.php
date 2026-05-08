<?php

namespace App\Console\Commands;

use App\Services\EventStateService;
use Illuminate\Console\Command;

class AutoTransitionEvents extends Command
{
    protected $signature = 'marathon:auto-transition-events';

    protected $description = 'Auto-transition events: upcoming → live when event_start_date hits, live → past 24h after (unless manual_override).';

    public function handle(EventStateService $service): int
    {
        $count = $service->autoTransitionEvents();
        $this->info("Transitioned {$count} event(s).");

        return self::SUCCESS;
    }
}
