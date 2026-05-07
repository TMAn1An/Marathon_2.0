<?php

namespace App\Services;

use App\Models\Event;
use Carbon\Carbon;

class EventStateService
{
    /**
     * Auto-transition events whose `event_date` has passed to `past`,
     * unless `manual_override` is true (admin pinned the status).
     *
     * Returns the number of events transitioned.
     */
    public function autoTransitionPastEvents(): int
    {
        $count = 0;
        $now = Carbon::now();

        Event::query()
            ->where('manual_override', false)
            ->where('status', '!=', Event::STATUS_PAST)
            ->where('event_date', '<', $now)
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

        // Re-evaluate immediately based on the date
        if ($event->event_date->isPast()) {
            $event->status = Event::STATUS_PAST;
            $event->save();
        }

        return $event;
    }
}
