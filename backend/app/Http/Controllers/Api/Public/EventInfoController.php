<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Sponsor;
use App\Models\Volunteer;
use Illuminate\Http\JsonResponse;

class EventInfoController extends Controller
{
    /**
     * GET /api/event
     * Aggregated public endpoint for the Home / Info pages.
     */
    public function show(): JsonResponse
    {
        return response()->json([
            'data' => [
                'event' => config('marathon.event'),
                'fees' => config('marathon.fees'),
                'result_url' => config('marathon.event.result_url'),
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
}
