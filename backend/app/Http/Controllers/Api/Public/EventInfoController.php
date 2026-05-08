<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Sponsor;
use App\Models\Volunteer;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class EventInfoController extends Controller
{
    public function platform(): JsonResponse
    {
        return response()->json([
            'data' => [
                'platform' => config('marathon.platform'),
                'fees_default' => [
                    'student' => (int) config('marathon.event_defaults.student_fee_bdt'),
                    'faculty' => (int) config('marathon.event_defaults.faculty_fee_bdt'),
                ],
                'global_unlock_at' => $this->globalUnlockAt()?->toIso8601String(),
            ],
        ]);
    }

    public function index(): JsonResponse
    {
        $events = Event::query()
            ->where('is_visible', true)
            ->orderBy('event_start_date')
            ->get();

        $grouped = [
            'live' => [],
            'upcoming' => [],
            'past' => [],
        ];

        foreach ($events as $event) {
            $grouped[$event->status][] = $this->summary($event);
        }

        return response()->json([
            'data' => $grouped,
        ]);
    }

    public function show(Event $event): JsonResponse
    {
        if (! $event->is_visible) {
            abort(404);
        }

        return response()->json([
            'data' => array_merge($this->summary($event), [
                'description' => $event->description,
            ]),
        ]);
    }

    public function registrationStatus(Event $event): JsonResponse
    {
        $globalUnlock = $this->globalUnlockAt();
        $eventUnlock = $event->registrationOpensAt();
        $unlockAt = $eventUnlock;
        if ($globalUnlock && $globalUnlock->greaterThan($eventUnlock)) {
            $unlockAt = $globalUnlock;
        }

        $isLocked = ! ($event->isLive() || ($event->isUpcoming() && now()->gte($unlockAt)));
        if ($event->isPast()) {
            $isLocked = true;
        }

        return response()->json([
            'data' => [
                'is_locked' => $isLocked,
                'unlocks_at' => $unlockAt?->toIso8601String(),
                'event_status' => $event->status,
                'manual_override' => $event->manual_override,
            ],
        ]);
    }

    public function sponsors(): JsonResponse
    {
        return response()->json([
            'data' => Sponsor::query()->active()->get(),
        ]);
    }

    public function volunteers(): JsonResponse
    {
        return response()->json([
            'data' => Volunteer::query()->active()->get(),
        ]);
    }

    protected function summary(Event $event): array
    {
        return [
            'id' => $event->id,
            'title' => $event->title,
            'slug' => $event->slug,
            'summary' => $event->summary,
            'location' => $event->location,
            'hero_image_url' => $event->hero_image_path
                ? asset('storage/'.$event->hero_image_path)
                : null,
            'event_start_date' => $event->event_start_date?->toIso8601String(),
            'registration_start_date' => $event->registration_start_date?->toIso8601String(),
            'status' => $event->status,
            'student_fee_bdt' => $event->student_fee_bdt,
            'faculty_fee_bdt' => $event->faculty_fee_bdt,
        ];
    }

    protected function globalUnlockAt(): ?Carbon
    {
        $raw = config('marathon.registration.global_unlock_at');
        if (! $raw) {
            return null;
        }

        return Carbon::parse($raw, config('marathon.registration.timezone'));
    }
}
