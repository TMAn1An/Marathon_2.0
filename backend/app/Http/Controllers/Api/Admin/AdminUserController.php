<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    public function index(): JsonResponse
    {
        $this->authorize('viewAny', Admin::class);

        return response()->json([
            'data' => Admin::query()
                ->orderBy('id')
                ->get(['id', 'name', 'email', 'role', 'is_active', 'last_login_at', 'created_at']),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Admin::class);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:191', 'unique:admins,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', Rule::in([Admin::ROLE_ADMIN, Admin::ROLE_SUPER_ADMIN])],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $data['password'] = Hash::make($data['password']);
        $admin = Admin::create($data);

        return response()->json([
            'data' => $admin->only(['id', 'name', 'email', 'role', 'is_active']),
        ], 201);
    }

    public function update(Admin $admin, Request $request): JsonResponse
    {
        $this->authorize('update', $admin);

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:120'],
            'email' => ['sometimes', 'email', 'max:191', Rule::unique('admins', 'email')->ignore($admin->id)],
            'password' => ['sometimes', 'string', 'min:8'],
            'role' => ['sometimes', Rule::in([Admin::ROLE_ADMIN, Admin::ROLE_SUPER_ADMIN])],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        if (! empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $admin->fill($data)->save();

        return response()->json([
            'data' => $admin->only(['id', 'name', 'email', 'role', 'is_active']),
        ]);
    }

    public function destroy(Admin $admin, Request $request): JsonResponse
    {
        $this->authorize('delete', $admin);

        if ($admin->id === $request->user()->id) {
            return response()->json([
                'message' => 'You cannot delete your own account.',
            ], 422);
        }

        $admin->delete();

        return response()->json(['message' => 'Admin removed.']);
    }
}
