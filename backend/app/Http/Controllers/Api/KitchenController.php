<?php

namespace App\Http\Controllers\Api;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KitchenController extends Controller
{
    public function __construct(private readonly ActivityLogService $activityLogService)
    {
    }

    public function index(): JsonResponse
    {
        return response()->json(
            Order::query()
                ->whereIn('order_status', [OrderStatus::Paid, OrderStatus::Accepted, OrderStatus::InPreparation])
                ->with('items.product')
                ->latest()
                ->get()
        );
    }

    public function start(Request $request, Order $order): JsonResponse
    {
        $order->update([
            'order_status' => OrderStatus::InPreparation,
            'assigned_cook_id' => $request->user()->id,
        ]);

        $this->activityLogService->log($request->user()->id, 'order', $order->id, 'kitchen_start', 'Préparation démarrée');

        return response()->json($order->fresh());
    }

    public function ready(Request $request, Order $order): JsonResponse
    {
        $order->update(['order_status' => OrderStatus::Ready]);

        $this->activityLogService->log($request->user()->id, 'order', $order->id, 'kitchen_ready', 'Commande prête');

        return response()->json($order->fresh());
    }

    public function history(Request $request): JsonResponse
    {
        return response()->json(
            Order::query()->where('assigned_cook_id', $request->user()->id)->latest()->get()
        );
    }
}
