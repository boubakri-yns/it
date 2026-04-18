<?php

namespace Database\Seeders;

use App\Enums\DeliveryStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\ReservationStatus;
use App\Enums\TableStatus;
use App\Models\Delivery;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Reservation;
use App\Models\RestaurantTable;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoFlowSeeder extends Seeder
{
    public function run(): void
    {
        $client = User::query()->where('email', 'client1@example.com')->firstOrFail();
        $driver = User::query()->where('email', 'driver1@example.com')->firstOrFail();
        $table = RestaurantTable::query()->where('numero', 'T1')->firstOrFail();
        $product = Product::query()->firstOrFail();

        Reservation::updateOrCreate(
            ['email' => 'client1@example.com', 'reservation_date' => today()->toDateString()],
            [
                'user_id' => $client->id,
                'table_id' => $table->id,
                'nom' => $client->nom,
                'prenom' => $client->prenom,
                'telephone' => $client->telephone,
                'reservation_time' => '20:00',
                'guest_count' => 2,
                'status' => ReservationStatus::Confirmed,
                'notes' => 'Anniversaire',
            ]
        );

        $table->update(['statut' => TableStatus::Reservee]);

        $order = Order::updateOrCreate(
            ['email' => 'client1@example.com', 'order_type' => 'livraison'],
            [
                'user_id' => $client->id,
                'nom' => $client->nom,
                'prenom' => $client->prenom,
                'telephone' => $client->telephone,
                'address' => '12 Via Roma',
                'city' => 'Casablanca',
                'latitude' => 33.5731000,
                'longitude' => -7.5898000,
                'notes' => 'Interphone 45',
                'subtotal' => $product->price * 2,
                'delivery_fee' => 50.00,
                'total' => ($product->price * 2) + 50.00,
                'payment_status' => PaymentStatus::Paid,
                'order_status' => OrderStatus::Ready,
                'assigned_delivery_id' => $driver->id,
            ]
        );

        OrderItem::updateOrCreate(
            ['order_id' => $order->id, 'product_id' => $product->id],
            [
                'quantity' => 2,
                'unit_price' => $product->price,
                'total_price' => $product->price * 2,
            ]
        );

        Delivery::updateOrCreate(
            ['order_id' => $order->id],
            [
                'delivery_user_id' => $driver->id,
                'status' => DeliveryStatus::PriseEnCharge,
            ]
        );

        Payment::updateOrCreate(
            ['order_id' => $order->id],
            [
                'stripe_payment_intent_id' => 'pi_demo_123',
                'amount' => $order->total,
                'currency' => 'mad',
                'status' => PaymentStatus::Paid,
                'method' => 'stripe',
                'paid_at' => now(),
            ]
        );
    }
}
