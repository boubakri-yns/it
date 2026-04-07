<?php

namespace App\Http\Controllers\Api;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Models\Order;
use App\Models\Payment;
use App\Services\ActivityLogService;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderService $orderService,
        private readonly ActivityLogService $activityLogService
    ) {
    }

    public function store(StoreOrderRequest $request): JsonResponse
    {
        $order = $this->orderService->create($request->validated(), $request->user()?->id);

        if ($request->filled('stripe_payment_intent_id')) {
            Payment::create([
                'order_id' => $order->id,
                'stripe_payment_intent_id' => (string) $request->input('stripe_payment_intent_id'),
                'amount' => $order->total,
                'currency' => 'eur',
                'status' => $order->payment_status,
                'method' => 'stripe',
                'paid_at' => $request->boolean('payment_confirmed') ? now() : null,
            ]);
        }

        return response()->json($order->load(['items.product', 'payment', 'delivery']), 201);
    }

    public function myOrders(Request $request): JsonResponse
    {
        return response()->json(
            Order::query()
                ->where('user_id', $request->user()->id)
                ->with(['items.product', 'delivery', 'payment'])
                ->latest()
                ->get()
        );
    }

    public function showMyOrder(Request $request, Order $order): JsonResponse
    {
        abort_unless($order->user_id === $request->user()->id, 403);

        return response()->json($order->load(['items.product', 'delivery', 'payment']));
    }

    public function confirmReception(Request $request, Order $order): JsonResponse
    {
        abort_unless($order->user_id === $request->user()->id, 403);

        $order->update(['order_status' => OrderStatus::Delivered]);
        $this->activityLogService->log($request->user()->id, 'order', $order->id, 'confirmed_reception', 'Réception confirmée');

        return response()->json($order);
    }
}
