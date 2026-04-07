<?php

namespace App\Http\Controllers\Api;

use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Category;
use App\Models\Delivery;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Reservation;
use App\Models\RestaurantTable;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        return response()->json([
            'users' => User::count(),
            'products' => Product::count(),
            'categories' => Category::count(),
            'orders' => Order::count(),
            'reservations' => Reservation::count(),
            'tables' => RestaurantTable::count(),
            'deliveries' => Delivery::count(),
            'revenue_paid' => Payment::query()->where('status', PaymentStatus::Paid)->sum('amount'),
            'latest_logs' => ActivityLog::query()->latest()->take(10)->get(),
        ]);
    }

    public function settings(): JsonResponse
    {
        return response()->json(Setting::query()->orderBy('group')->get());
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'settings' => ['required', 'array'],
            'settings.*.key' => ['required', 'string'],
            'settings.*.value' => ['nullable', 'string'],
            'settings.*.group' => ['nullable', 'string'],
        ]);

        foreach ($payload['settings'] as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                ['value' => $setting['value'] ?? null, 'group' => $setting['group'] ?? 'general']
            );
        }

        return response()->json(Setting::query()->orderBy('group')->get());
    }

    public function detailedStats(): JsonResponse
    {
        return response()->json([
            'orders_by_type' => Order::query()
                ->select('order_type', DB::raw('count(*) as total'))
                ->groupBy('order_type')
                ->pluck('total', 'order_type'),
            'orders_by_status' => Order::query()
                ->select('order_status', DB::raw('count(*) as total'))
                ->groupBy('order_status')
                ->pluck('total', 'order_status'),
            'deliveries_by_status' => Delivery::query()
                ->select('status', DB::raw('count(*) as total'))
                ->groupBy('status')
                ->pluck('total', 'status'),
            'payments_by_method' => Payment::query()
                ->select('method', DB::raw('count(*) as total'))
                ->groupBy('method')
                ->pluck('total', 'method'),
            'recent_orders' => Order::query()->with(['table', 'delivery'])->latest()->take(5)->get(),
            'latest_logs' => ActivityLog::query()->with('user')->latest()->take(15)->get(),
        ]);
    }

    public function logs(): JsonResponse
    {
        return response()->json(ActivityLog::query()->with('user')->latest()->paginate(20));
    }
}
