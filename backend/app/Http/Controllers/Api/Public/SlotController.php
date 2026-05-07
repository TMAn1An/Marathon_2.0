<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Services\SlotService;
use Illuminate\Http\JsonResponse;

class SlotController extends Controller
{
    public function __construct(protected SlotService $slots) {}

    /**
     * GET /api/events/{slug}/slots
     * Returns the public-safe analytics payload (percentage segments only).
     * Raw counts are NOT exposed publicly per spec 9.2.
     */
    public function show(Event $event): JsonResponse
    {
        return response()->json([
            'data' => $this->slots->publicAnalytics($event),
        ]);
    }
}
