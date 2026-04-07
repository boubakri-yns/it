<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(User::query()->latest()->paginate(10));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nom' => ['required', 'string'],
            'prenom' => ['required', 'string'],
            'email' => ['required', 'email', 'unique:users,email'],
            'telephone' => ['nullable', 'string'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', 'string'],
            'is_active' => ['required', 'boolean'],
        ]);

        return response()->json(User::create($data), 201);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json($user);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'nom' => ['sometimes', 'string'],
            'prenom' => ['sometimes', 'string'],
            'telephone' => ['nullable', 'string'],
            'role' => ['sometimes', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ]);
        $user->update($data);

        return response()->json($user);
    }

    public function destroy(User $user): JsonResponse
    {
        $user->delete();

        return response()->json(status: 204);
    }
}
