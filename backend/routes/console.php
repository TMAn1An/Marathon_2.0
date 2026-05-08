<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Auto-transition events every minute:
//  - upcoming → live when event_start_date is reached
//  - live → past 24h later
// (admin manual_override is respected.)
Schedule::command('marathon:auto-transition-events')
    ->everyMinute()
    ->withoutOverlapping();
