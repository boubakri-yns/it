<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RestaurantTable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminTableController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(RestaurantTable::query()->orderBy('numero')->paginate(10));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'numero' => ['required', 'string', 'max:50', 'unique:restaurant_tables,numero'],
            'capacite' => ['required', 'integer', 'min:1'],
            'statut' => ['required', 'string'],
            'is_active' => ['required', 'boolean'],
        ]);

        return response()->json(RestaurantTable::create($data), 201);
    }

    public function show(RestaurantTable $table): JsonResponse
    {
        return response()->json($table);
    }

    public function update(Request $request, RestaurantTable $table): JsonResponse
    {
        $data = $request->validate([
            'numero' => ['sometimes', 'string', 'max:50'],
            'capacite' => ['sometimes', 'integer', 'min:1'],
            'statut' => ['sometimes', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ]);
        $table->update($data);

        return response()->json($table);
    }

    public function destroy(RestaurantTable $table): JsonResponse
    {
        $table->delete();

        return response()->json(status: 204);
    }
}
