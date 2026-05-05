<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Services\SlotService;
use Illuminate\Http\JsonResponse;

class SlotController extends Controller
{
    public function __construct(protected SlotService $slots) {}

    /**
     * GET /api/slots
     * Public endpoint surfacing live slot count for the registration page.
     */
    public function show(): JsonResponse
    {
        return response()->json([
            'data' => $this->slots->summary(),
        ]);
    }
}
