<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sponsor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SponsorController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => Sponsor::query()->orderBy('display_order')->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validatePayload($request);
        $sponsor = Sponsor::create($data);

        return response()->json(['data' => $sponsor], 201);
    }

    public function update(Request $request, Sponsor $sponsor): JsonResponse
    {
        $data = $this->validatePayload($request, $sponsor->id);
        $sponsor->update($data);

        return response()->json(['data' => $sponsor]);
    }

    public function destroy(Sponsor $sponsor): JsonResponse
    {
        $sponsor->delete();

        return response()->json(['message' => 'Sponsor removed.']);
    }

    protected function validatePayload(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'logo_url' => ['nullable', 'string', 'max:255'],
            'website' => ['nullable', 'url', 'max:255'],
            'tier' => ['required', Rule::in(['platinum', 'gold', 'silver', 'bronze', 'partner'])],
            'description' => ['nullable', 'string', 'max:1000'],
            'display_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);
    }
}
