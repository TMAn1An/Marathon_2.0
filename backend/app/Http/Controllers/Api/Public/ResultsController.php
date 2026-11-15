<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Services\ResultsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ResultsController extends Controller
{
    public function __construct(protected ResultsService $results) {}

    /** GET /api/results?category=student|faculty */
    public function index(Request $request): JsonResponse
    {
        $category = in_array($request->query('category'), ['student', 'faculty'], true)
            ? $request->query('category')
            : null;

        return response()->json([
            'data' => $this->results->leaderboard($category),
            'external_url' => config('marathon.event.result_url'),
        ]);
    }
}
