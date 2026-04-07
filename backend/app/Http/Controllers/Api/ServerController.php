<?php

namespace App\Http\Controllers\Api;

use App\Enums\ReservationStatus;
use App\Enums\TableStatus;
use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Models\Order;
use App\Models\Reservation;
use App\Models\RestaurantTable;
use App\Services\ActivityLogService;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServerController extends Controller
{
    public function __construct(
        private readonly OrderService $orderService,
        private readonly ActivityLogService $activityLogService
    ) {
    }

    public function todayReservations(): JsonResponse
    {
        return response()->json(
            Reservation::query()
                ->whereDate('reservation_date', '>=', today())
                ->whereIn('status', [
                    ReservationStatus::Pending,
                    ReservationStatus::Confirmed,
                    ReservationStatus::Arrived,
                ])
                ->with('table')
                ->orderBy('reservation_date')
                ->orderBy('reservation_time')
                ->get()
        );
    }

    public function tables(): JsonResponse
    {
        return response()->json(RestaurantTable::query()->orderBy('numero')->get());
    }

    public function readyOrders(): JsonResponse
    {
        return response()->json(
            Order::query()
                ->where('order_type', 'sur_place')
                ->where('order_status', OrderStatus::Ready)
                ->with(['items.product', 'table'])
                ->latest()
                ->get()
        );
    }

    public function onsiteOrders(): JsonResponse
    {
        return response()->json(
            Order::query()
                ->where('order_type', 'sur_place')
                ->with(['items.product', 'table'])
                ->latest()
                ->get()
        );
    }

    public function arrive(Request $request, Reservation $reservation): JsonResponse
    {
        $reservation->update(['status' => ReservationStatus::Arrived]);
        $reservation->table()->update(['statut' => TableStatus::Occupee]);
        $this->activityLogService->log($request->user()->id, 'reservation', $reservation->id, 'arrived', 'Client arrivé');

        return response()->json($reservation->fresh('table'));
    }

    public function occupy(Request $request, RestaurantTable $table): JsonResponse
    {
        $table->update(['statut' => TableStatus::Occupee]);
        $this->activityLogService->log($request->user()->id, 'table', $table->id, 'occupied', 'Table occupée');

        return response()->json($table);
    }

    public function free(Request $request, RestaurantTable $table): JsonResponse
    {
        $table->update(['statut' => TableStatus::Libre]);
        $this->activityLogService->log($request->user()->id, 'table', $table->id, 'freed', 'Table libérée');

        return response()->json($table);
    }

    public function createOrder(StoreOrderRequest $request): JsonResponse
    {
        $order = $this->orderService->create([...$request->validated(), 'payment_confirmed' => true], $request->user()?->id);

        return response()->json($order, 201);
    }

    public function serve(Request $request, Order $order): JsonResponse
    {
        abort_unless($order->order_type === 'sur_place', 422);

        $order->update(['order_status' => OrderStatus::Served]);
        $this->activityLogService->log($request->user()->id, 'order', $order->id, 'served', 'Commande servie en salle');

        return response()->json($order->fresh(['items.product', 'table']));
    }
}
