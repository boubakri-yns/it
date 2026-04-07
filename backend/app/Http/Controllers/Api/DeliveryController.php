<?php

namespace App\Http\Controllers\Api;

use App\Enums\DeliveryStatus;
use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeliveryController extends Controller
{
    public function __construct(private readonly ActivityLogService $activityLogService)
    {
    }

    public function available(): JsonResponse
    {
        return response()->json(
            Delivery::query()->where('status', DeliveryStatus::EnAttenteLivreur)->with('order')->latest()->get()
        );
    }

    public function mine(Request $request): JsonResponse
    {
        return response()->json(
            Delivery::query()->where('delivery_user_id', $request->user()->id)->with('order')->latest()->get()
        );
    }

    public function active(Request $request): JsonResponse
    {
        return response()->json(
            Delivery::query()
                ->where('delivery_user_id', $request->user()->id)
                ->whereIn('status', [
                    DeliveryStatus::PriseEnCharge,
                    DeliveryStatus::LivraisonCommencee,
                    DeliveryStatus::ArriveADestination,
                ])
                ->with('order')
                ->latest()
                ->get()
        );
    }

    public function history(Request $request): JsonResponse
    {
        return response()->json(
            Delivery::query()
                ->where('delivery_user_id', $request->user()->id)
                ->where('status', DeliveryStatus::Livree)
                ->with('order')
                ->latest('delivered_at')
                ->get()
        );
    }

    public function show(Request $request, Delivery $delivery): JsonResponse
    {
        $this->assertOwner($request, $delivery);

        return response()->json($delivery->load('order'));
    }

    public function take(Request $request, Delivery $delivery): JsonResponse
    {
        $delivery->update([
            'delivery_user_id' => $request->user()->id,
            'status' => DeliveryStatus::PriseEnCharge,
        ]);
        $delivery->order()->update([
            'assigned_delivery_id' => $request->user()->id,
            'order_status' => OrderStatus::OutForDelivery,
        ]);

        $this->activityLogService->log($request->user()->id, 'delivery', $delivery->id, 'taken', 'Livraison acceptée');

        return response()->json($delivery->fresh('order'));
    }

    public function start(Request $request, Delivery $delivery): JsonResponse
    {
        $this->assertOwner($request, $delivery);
        $delivery->update(['status' => DeliveryStatus::LivraisonCommencee, 'started_at' => now()]);
        $this->activityLogService->log($request->user()->id, 'delivery', $delivery->id, 'start', 'Livraison démarrée');

        return response()->json($delivery->fresh('order'));
    }

    public function arrived(Request $request, Delivery $delivery): JsonResponse
    {
        $this->assertOwner($request, $delivery);
        $delivery->update(['status' => DeliveryStatus::ArriveADestination, 'arrived_at' => now()]);
        $delivery->order()->update(['order_status' => OrderStatus::Arrived]);
        $this->activityLogService->log($request->user()->id, 'delivery', $delivery->id, 'arrived', 'Livreur arrivé');

        return response()->json($delivery->fresh('order'));
    }

    public function complete(Request $request, Delivery $delivery): JsonResponse
    {
        $this->assertOwner($request, $delivery);
        $delivery->update(['status' => DeliveryStatus::Livree, 'delivered_at' => now()]);
        $delivery->order()->update(['order_status' => OrderStatus::Delivered]);
        $this->activityLogService->log($request->user()->id, 'delivery', $delivery->id, 'complete', 'Livraison terminée');

        return response()->json($delivery->fresh('order'));
    }

    private function assertOwner(Request $request, Delivery $delivery): void
    {
        abort_unless($delivery->delivery_user_id === $request->user()->id, 403);
    }
}
