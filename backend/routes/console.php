<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Auto-transition events to "past" status every 10 minutes once their date has
// passed (admin manual_override is respected).
Schedule::command('marathon:auto-transition-events')
    ->everyTenMinutes()
    ->withoutOverlapping();
