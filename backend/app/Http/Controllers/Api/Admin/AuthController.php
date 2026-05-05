<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\AdminLoginRequest;
use App\Models\Admin;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(AdminLoginRequest $request): JsonResponse
    {
        $data = $request->validated();
        $admin = Admin::where('email', $data['email'])->first();

        if (! $admin || ! $admin->is_active || ! Hash::check($data['password'], $admin->password)) {
            return response()->json([
                'message' => 'Invalid credentials.',
            ], 401);
        }

        $admin->update(['last_login_at' => now()]);
        $token = $admin->createToken('admin-dashboard')->plainTextToken;

        return response()->json([
            'data' => [
                'admin' => $admin->makeHidden(['password', 'remember_token']),
                'token' => $token,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user('admin')?->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $request->user('admin')?->makeHidden(['password', 'remember_token']),
        ]);
    }
}
