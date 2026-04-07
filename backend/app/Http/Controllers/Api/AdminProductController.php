<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminProductController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Product::query()->with('category')->latest()->paginate(10));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string'],
            'description' => ['required', 'string'],
            'price' => ['required', 'numeric'],
            'image' => ['nullable', 'string'],
            'is_available' => ['required', 'boolean'],
            'is_featured' => ['required', 'boolean'],
            'preparation_time' => ['required', 'integer'],
        ]);
        $data['slug'] = Str::slug($data['name']);

        return response()->json(Product::create($data), 201);
    }

    public function show(Product $product): JsonResponse
    {
        return response()->json($product->load('category'));
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate([
            'category_id' => ['sometimes', 'exists:categories,id'],
            'name' => ['sometimes', 'string'],
            'description' => ['sometimes', 'string'],
            'price' => ['sometimes', 'numeric'],
            'image' => ['nullable', 'string'],
            'is_available' => ['sometimes', 'boolean'],
            'is_featured' => ['sometimes', 'boolean'],
            'preparation_time' => ['sometimes', 'integer'],
        ]);
        if (isset($data['name'])) {
            $data['slug'] = Str::slug($data['name']);
        }
        $product->update($data);

        return response()->json($product);
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return response()->json(status: 204);
    }
}
