<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Volunteer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VolunteerController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => Volunteer::query()->orderBy('display_order')->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validatePayload($request);
        $volunteer = Volunteer::create($data);

        return response()->json(['data' => $volunteer], 201);
    }

    public function update(Request $request, Volunteer $volunteer): JsonResponse
    {
        $data = $this->validatePayload($request);
        $volunteer->update($data);

        return response()->json(['data' => $volunteer]);
    }

    public function destroy(Volunteer $volunteer): JsonResponse
    {
        $volunteer->delete();

        return response()->json(['message' => 'Volunteer removed.']);
    }

    protected function validatePayload(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'role' => ['required', 'string', 'max:100'],
            'photo_url' => ['nullable', 'string', 'max:255'],
            'bio' => ['nullable', 'string', 'max:1000'],
            'contact' => ['nullable', 'string', 'max:100'],
            'display_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);
    }
}
