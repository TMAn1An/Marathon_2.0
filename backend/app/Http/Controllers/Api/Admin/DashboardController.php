<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Participant;
use App\Models\Payment;
use App\Models\Post;
use App\Services\SlotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(protected SlotService $slots) {}

    public function stats(Request $request): JsonResponse
    {
        $event = null;
        if ($request->filled('event_id')) {
            $event = Event::query()->find($request->integer('event_id'));
        } else {
            $event = Event::query()
                ->orderByRaw("CASE status WHEN 'live' THEN 1 WHEN 'upcoming' THEN 2 ELSE 3 END")
                ->orderBy('event_start_date')
                ->first();
        }

        $events = Event::query()->orderBy('event_start_date', 'desc')->get(['id', 'title', 'slug', 'status', 'event_start_date', 'registration_start_date']);

        $participantStats = $event ? $this->participantStats($event) : null;
        $paymentStats = $event ? $this->paymentStats($event) : null;
        $slotStats = $event ? $this->slots->adminSummary($event) : null;

        return response()->json([
            'data' => [
                'events' => $events,
                'active_event' => $event,
                'slots' => $slotStats,
                'participants' => $participantStats,
                'payments' => $paymentStats,
                'posts' => [
                    'total' => Post::count(),
                    'published' => Post::where('is_published', true)->count(),
                ],
            ],
        ]);
    }

    protected function participantStats(Event $event): array
    {
        $confirmed = Participant::where('event_id', $event->id)
            ->where('status', Participant::STATUS_CONFIRMED)->count();
        $pending = Participant::where('event_id', $event->id)
            ->whereIn('status', [Participant::STATUS_RESERVED, Participant::STATUS_PENDING_PAYMENT])->count();
        $cancelled = Participant::where('event_id', $event->id)
            ->where('status', Participant::STATUS_CANCELLED)->count();

        $byCategory = Participant::query()
            ->where('event_id', $event->id)
            ->where('status', Participant::STATUS_CONFIRMED)
            ->selectRaw('category, COUNT(*) as total')
            ->groupBy('category')
            ->pluck('total', 'category');

        return [
            'confirmed' => $confirmed,
            'pending' => $pending,
            'cancelled' => $cancelled,
            'by_category' => [
                'student' => (int) ($byCategory['student'] ?? 0),
                'faculty' => (int) ($byCategory['faculty'] ?? 0),
                'guest' => (int) ($byCategory['guest'] ?? 0),
            ],
        ];
    }

    protected function paymentStats(Event $event): array
    {
        $payments = Payment::query()
            ->whereHas('participant', fn ($q) => $q->where('event_id', $event->id))
            ->selectRaw('status, COUNT(*) as total, COALESCE(SUM(amount), 0) as amount')
            ->groupBy('status')
            ->get()
            ->keyBy('status');

        return [
            'completed_count' => (int) ($payments['completed']->total ?? 0),
            'completed_amount' => (float) ($payments['completed']->amount ?? 0),
            'pending_count' => (int) ($payments['pending']->total ?? 0),
            'failed_count' => (int) ($payments['failed']->total ?? 0),
        ];
    }
}
