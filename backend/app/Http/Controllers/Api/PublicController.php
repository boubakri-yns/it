<?php

namespace App\Http\Controllers\Api;

use App\Enums\TableStatus;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\Reservation;
use App\Models\RestaurantTable;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Enums\ReservationStatus;

class PublicController extends Controller
{
    public function home(): JsonResponse
    {
        return response()->json([
            'hero' => [
                'title' => 'L’Italie à table, du four à la livraison.',
                'subtitle' => 'Cuisine italienne premium, réservation rapide et commande en ligne sécurisée.',
            ],
            'featured_products' => Product::query()->where('is_featured', true)->where('is_available', true)->take(6)->get(),
            'categories' => Category::query()->where('is_active', true)->withCount('products')->get(),
            'contact' => [
                'phone' => '+212 600 000 000',
                'email' => 'contact@italia.test',
                'address' => 'Via Roma, Casablanca',
            ],
            'hours' => [
                'weekdays' => Setting::query()->where('key', 'hours_weekdays')->value('value') ?? '12:00 - 23:00',
                'weekend' => Setting::query()->where('key', 'hours_weekend')->value('value') ?? '12:00 - 00:00',
            ],
        ]);
    }

    public function categories(): JsonResponse
    {
        return response()->json(Category::query()->where('is_active', true)->orderBy('name')->get());
    }

    public function products(): JsonResponse
    {
        return response()->json(
            Product::query()->with('category')->where('is_available', true)->orderBy('name')->paginate(12)
        );
    }

    public function showProduct(Product $product): JsonResponse
    {
        return response()->json($product->load(['category', 'images']));
    }

    public function availableTables(Request $request): JsonResponse
    {
        $query = RestaurantTable::query()
            ->where('is_active', true)
            ->where('statut', TableStatus::Libre);

        if ($request->filled('guest_count')) {
            $query->where('capacite', '>=', $request->integer('guest_count'));
        }

        if ($request->filled('reservation_date') && $request->filled('reservation_time')) {
            $reservedTableIds = Reservation::query()
                ->whereDate('reservation_date', $request->string('reservation_date'))
                ->where('reservation_time', $request->string('reservation_time'))
                ->whereIn('status', [
                    ReservationStatus::Confirmed,
                    ReservationStatus::Arrived,
                ])
                ->pluck('table_id');

            $query->whereNotIn('id', $reservedTableIds);
        }

        return response()->json($query->orderBy('numero')->get());
    }
}
