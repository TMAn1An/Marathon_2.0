<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\EventRequest;
use App\Models\Event;
use App\Services\EventStateService;
use App\Services\SlotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class EventController extends Controller
{
    public function __construct(
        protected EventStateService $stateService,
        protected SlotService $slotService,
    ) {}

    public function index(): JsonResponse
    {
        $this->authorize('viewAny', Event::class);

        $events = Event::query()
            ->orderByRaw("CASE status WHEN 'live' THEN 1 WHEN 'upcoming' THEN 2 ELSE 3 END")
            ->orderBy('event_date')
            ->get()
            ->map(fn (Event $e) => $this->summary($e));

        return response()->json(['data' => $events]);
    }

    public function show(Event $event): JsonResponse
    {
        $this->authorize('view', $event);

        return response()->json([
            'data' => array_merge($this->summary($event), [
                'description' => $event->description,
                'analytics' => $this->slotService->adminSummary($event),
            ]),
        ]);
    }

    public function store(EventRequest $request): JsonResponse
    {
        $this->authorize('create', Event::class);

        $data = $request->validated();
        $data['slug'] = $this->uniqueSlug($data['slug'] ?? $data['title']);
        $data['hero_image_path'] = $this->storeHeroImage($request);

        $event = Event::create(array_filter($data, fn ($v) => $v !== null));

        return response()->json(['data' => $this->summary($event)], 201);
    }

    public function update(EventRequest $request, Event $event): JsonResponse
    {
        $this->authorize('update', $event);

        $data = $request->validated();
        if (! empty($data['slug']) && $data['slug'] !== $event->slug) {
            $data['slug'] = $this->uniqueSlug($data['slug'], $event->id);
        }
        if ($img = $this->storeHeroImage($request)) {
            $data['hero_image_path'] = $img;
        }

        $event->fill($data)->save();

        return response()->json(['data' => $this->summary($event->fresh())]);
    }

    public function destroy(Event $event): JsonResponse
    {
        $this->authorize('delete', $event);

        $event->delete();

        return response()->json(['message' => 'Event removed.']);
    }

    public function setStatus(Event $event, Request $request): JsonResponse
    {
        $this->authorize('update', $event);

        $validated = $request->validate([
            'status' => ['required', 'in:upcoming,live,past'],
            'manual_override' => ['nullable', 'boolean'],
        ]);

        $event = $this->stateService->setStatus(
            $event,
            $validated['status'],
            (bool) ($validated['manual_override'] ?? true),
        );

        return response()->json(['data' => $this->summary($event)]);
    }

    public function disableOverride(Event $event): JsonResponse
    {
        $this->authorize('update', $event);

        $event = $this->stateService->disableManualOverride($event);

        return response()->json(['data' => $this->summary($event)]);
    }

    protected function uniqueSlug(string $base, ?int $ignoreId = null): string
    {
        $slug = Str::slug($base);
        $i = 1;
        while (Event::query()
            ->where('slug', $slug)
            ->when($ignoreId, fn ($q) => $q->where('id', '<>', $ignoreId))
            ->exists()
        ) {
            $slug = Str::slug($base).'-'.$i;
            $i++;
        }

        return $slug;
    }

    protected function storeHeroImage(EventRequest $request): ?string
    {
        if (! $request->hasFile('hero_image')) {
            return null;
        }

        return $request->file('hero_image')->store('events/hero', 'public');
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
            'event_date' => $event->event_date?->toIso8601String(),
            'registration_unlock_at' => $event->registration_unlock_at?->toIso8601String(),
            'total_slots' => $event->total_slots,
            'guest_slot_limit' => $event->guest_slot_limit,
            'hold_minutes' => $event->hold_minutes,
            'student_fee_bdt' => $event->student_fee_bdt,
            'faculty_fee_bdt' => $event->faculty_fee_bdt,
            'status' => $event->status,
            'manual_override' => $event->manual_override,
            'is_visible' => $event->is_visible,
        ];
    }
}
