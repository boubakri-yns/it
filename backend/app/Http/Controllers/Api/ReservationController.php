<?php

namespace App\Http\Controllers\Api;

use App\Enums\ReservationStatus;
use App\Enums\TableStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReservationRequest;
use App\Models\Reservation;
use App\Models\RestaurantTable;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ReservationController extends Controller
{
    public function __construct(private readonly ActivityLogService $activityLogService)
    {
    }

    public function store(StoreReservationRequest $request): JsonResponse
    {
        $authenticatedUser = Auth::guard('sanctum')->user() ?? $request->user();
        $table = RestaurantTable::query()->findOrFail($request->integer('table_id'));

        abort_if(
            in_array($table->statut, [TableStatus::Occupee, TableStatus::Indisponible], true),
            422,
            'Cette table n est pas disponible.'
        );

        $hasConflict = Reservation::query()
            ->where('table_id', $table->id)
            ->whereDate('reservation_date', $request->date('reservation_date'))
            ->where('reservation_time', $request->string('reservation_time'))
            ->whereIn('status', [
                ReservationStatus::Pending,
                ReservationStatus::Confirmed,
                ReservationStatus::Arrived,
            ])
            ->exists();

        abort_if($hasConflict, 422, 'Cette table est deja reservee pour ce creneau.');

        $reservation = DB::transaction(function () use ($request, $authenticatedUser) {
            return Reservation::create([
                ...$request->validated(),
                'user_id' => $authenticatedUser?->id,
                'status' => ReservationStatus::Pending,
            ])->load('table');
        });

        $this->activityLogService->log(
            $authenticatedUser?->id,
            'reservation',
            $reservation->id,
            'created',
            'Reservation creee'
        );

        return response()->json($reservation, 201);
    }

    public function myReservations(Request $request): JsonResponse
    {
        return response()->json(
            Reservation::query()
                ->where('user_id', $request->user()->id)
                ->with('table')
                ->orderByDesc('reservation_date')
                ->orderByDesc('reservation_time')
                ->orderByDesc('id')
                ->get()
        );
    }
}
