<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;

class AdminOperationsController extends Controller
{
    public function reservations(): JsonResponse
    {
        return response()->json(Reservation::query()->with('table', 'user')->latest()->paginate(20));
    }

    public function orders(): JsonResponse
    {
        return response()->json(Order::query()->with(['items.product', 'delivery', 'payment', 'table'])->latest()->paginate(20));
    }

    public function payments(): JsonResponse
    {
        return response()->json(Payment::query()->with('order')->latest()->paginate(20));
    }

    public function deliveries(): JsonResponse
    {
        return response()->json(Delivery::query()->with(['order', 'deliveryUser'])->latest()->paginate(20));
    }
}
