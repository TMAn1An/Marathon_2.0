<?php

namespace App\Services;

use App\Models\Event;
use Carbon\Carbon;

class EventStateService
{
    /**
     * Auto-transition events:
     *  - `upcoming` -> `live` the minute `event_start_date` is reached
     *  - `live`     -> `past` 24 hours after `event_start_date`
     *
     * Skipped when `manual_override` is true (admin pinned the status).
     *
     * Returns the number of events transitioned.
     */
    public function autoTransitionEvents(): int
    {
        $count = 0;
        $now = Carbon::now();

        // upcoming -> live
        Event::query()
            ->where('manual_override', false)
            ->where('status', Event::STATUS_UPCOMING)
            ->where('event_start_date', '<=', $now)
            ->orderBy('id')
            ->each(function (Event $event) use (&$count) {
                $event->status = Event::STATUS_LIVE;
                $event->save();
                $count++;
            });

        // live -> past (24h after event_start_date)
        Event::query()
            ->where('manual_override', false)
            ->where('status', Event::STATUS_LIVE)
            ->whereNotNull('event_start_date')
            ->where('event_start_date', '<', $now->copy()->subHours(24))
            ->orderBy('id')
            ->each(function (Event $event) use (&$count) {
                $event->status = Event::STATUS_PAST;
                $event->save();
                $count++;
            });

        return $count;
    }

    public function setStatus(Event $event, string $status, bool $manualOverride = true): Event
    {
        if (! in_array($status, [Event::STATUS_UPCOMING, Event::STATUS_LIVE, Event::STATUS_PAST], true)) {
            throw new \InvalidArgumentException("Invalid event status: {$status}");
        }

        $event->status = $status;
        $event->manual_override = $manualOverride;
        $event->save();

        return $event;
    }

    public function disableManualOverride(Event $event): Event
    {
        $event->manual_override = false;
        $event->save();

        $now = Carbon::now();

        // Re-evaluate immediately based on the event_start_date
        if ($event->event_start_date && $event->event_start_date->copy()->addHours(24)->isPast()) {
            $event->status = Event::STATUS_PAST;
            $event->save();
        } elseif ($event->event_start_date && $event->event_start_date->lessThanOrEqualTo($now)) {
            $event->status = Event::STATUS_LIVE;
            $event->save();
        } else {
            $event->status = Event::STATUS_UPCOMING;
            $event->save();
        }

        return $event;
    }
}
