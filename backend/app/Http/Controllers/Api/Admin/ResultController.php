<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Participant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ResultController extends Controller
{
    public function update(Participant $participant, Request $request): JsonResponse
    {
        $this->authorize('recordResults', $participant);

        $data = $request->validate([
            'chip_time' => ['nullable', 'string', 'max:16'],
            'overall_place' => ['nullable', 'integer', 'min:1'],
            'gender_place' => ['nullable', 'integer', 'min:1'],
        ]);

        $participant->fill($data)->save();

        return response()->json(['data' => $participant->fresh()]);
    }
}
