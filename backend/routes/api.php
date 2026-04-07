<?php

use App\Enums\UserRole;
use App\Http\Controllers\Api\AdminCategoryController;
use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Api\AdminOperationsController;
use App\Http\Controllers\Api\AdminProductController;
use App\Http\Controllers\Api\AdminTableController;
use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\DeliveryController;
use App\Http\Controllers\Api\KitchenController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\PublicController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\ServerController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);
    });
});

Route::get('/public/home', [PublicController::class, 'home']);
Route::get('/categories', [PublicController::class, 'categories']);
Route::get('/products', [PublicController::class, 'products']);
Route::get('/products/{product}', [PublicController::class, 'showProduct']);
Route::get('/tables/available', [PublicController::class, 'availableTables']);
Route::post('/reservations', [ReservationController::class, 'store']);
Route::post('/checkout/create-payment-intent', [CheckoutController::class, 'createPaymentIntent']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/orders', [OrderController::class, 'store'])->middleware('role:'.UserRole::Client->value);
    Route::get('/my/orders', [OrderController::class, 'myOrders'])->middleware('role:'.UserRole::Client->value);
    Route::get('/my/orders/{order}', [OrderController::class, 'showMyOrder'])->middleware('role:'.UserRole::Client->value);
    Route::get('/my/reservations', [ReservationController::class, 'myReservations'])->middleware('role:'.UserRole::Client->value);
    Route::put('/my/profile', [ProfileController::class, 'update']);
    Route::post('/orders/{order}/confirm-reception', [OrderController::class, 'confirmReception'])->middleware('role:'.UserRole::Client->value);

    Route::prefix('kitchen')->middleware('role:'.UserRole::Cook->value)->group(function () {
        Route::get('/orders', [KitchenController::class, 'index']);
        Route::get('/history', [KitchenController::class, 'history']);
        Route::put('/orders/{order}/start', [KitchenController::class, 'start']);
        Route::put('/orders/{order}/ready', [KitchenController::class, 'ready']);
    });

    Route::prefix('deliveries')->middleware('role:'.UserRole::Delivery->value)->group(function () {
        Route::get('/available', [DeliveryController::class, 'available']);
        Route::get('/mine', [DeliveryController::class, 'mine']);
        Route::get('/active', [DeliveryController::class, 'active']);
        Route::get('/history', [DeliveryController::class, 'history']);
        Route::get('/{delivery}', [DeliveryController::class, 'show']);
        Route::put('/{delivery}/take', [DeliveryController::class, 'take']);
        Route::put('/{delivery}/start', [DeliveryController::class, 'start']);
        Route::put('/{delivery}/arrived', [DeliveryController::class, 'arrived']);
        Route::put('/{delivery}/complete', [DeliveryController::class, 'complete']);
    });

    Route::prefix('server')->middleware('role:'.UserRole::Server->value)->group(function () {
        Route::get('/reservations/today', [ServerController::class, 'todayReservations']);
        Route::get('/tables', [ServerController::class, 'tables']);
        Route::get('/orders/ready', [ServerController::class, 'readyOrders']);
        Route::get('/orders/onsite', [ServerController::class, 'onsiteOrders']);
        Route::put('/reservations/{reservation}/arrive', [ServerController::class, 'arrive']);
        Route::put('/tables/{table}/occupy', [ServerController::class, 'occupy']);
        Route::put('/tables/{table}/free', [ServerController::class, 'free']);
        Route::put('/orders/{order}/serve', [ServerController::class, 'serve']);
        Route::post('/orders', [ServerController::class, 'createOrder']);
    });

    Route::prefix('admin')->middleware('role:'.UserRole::Admin->value)->group(function () {
        Route::get('/dashboard/stats', [AdminDashboardController::class, 'stats']);
        Route::get('/dashboard/detailed-stats', [AdminDashboardController::class, 'detailedStats']);
        Route::get('/logs', [AdminDashboardController::class, 'logs']);
        Route::get('/settings', [AdminDashboardController::class, 'settings']);
        Route::put('/settings', [AdminDashboardController::class, 'updateSettings']);
        Route::apiResource('users', AdminUserController::class);
        Route::apiResource('categories', AdminCategoryController::class);
        Route::apiResource('products', AdminProductController::class);
        Route::apiResource('tables', AdminTableController::class);
        Route::get('/reservations', [AdminOperationsController::class, 'reservations']);
        Route::get('/orders', [AdminOperationsController::class, 'orders']);
        Route::get('/payments', [AdminOperationsController::class, 'payments']);
        Route::get('/deliveries', [AdminOperationsController::class, 'deliveries']);
    });
});
