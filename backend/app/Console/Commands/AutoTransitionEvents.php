<?php

namespace App\Console\Commands;

use App\Services\EventStateService;
use Illuminate\Console\Command;

class AutoTransitionEvents extends Command
{
    protected $signature = 'marathon:auto-transition-events';

    protected $description = 'Mark events as past once their event_date has passed (unless manually overridden).';

    public function handle(EventStateService $service): int
    {
        $count = $service->autoTransitionPastEvents();
        $this->info("Transitioned {$count} event(s) to past.");

        return self::SUCCESS;
    }
}
