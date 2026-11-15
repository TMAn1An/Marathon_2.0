<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\ResultsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ResultsController extends Controller
{
    public function __construct(protected ResultsService $results) {}

    /** POST /api/admin/results/import  { rows: [{bib, time}] } */
    public function import(Request $request): JsonResponse
    {
        $data = $request->validate([
            'rows' => ['required', 'array', 'min:1', 'max:1000'],
            'rows.*.bib' => ['nullable', 'string', 'max:20'],
            'rows.*.time' => ['nullable', 'string', 'max:12'],
        ]);

        return response()->json(['data' => $this->results->import($data['rows'])]);
    }
}
