<?php

namespace Tests\Feature;

use App\Enums\DeliveryStatus;
use App\Enums\OrderStatus;
use App\Enums\ReservationStatus;
use App\Enums\TableStatus;
use App\Enums\UserRole;
use App\Models\Delivery;
use App\Models\Order;
use App\Models\Reservation;
use App\Models\Product;
use App\Models\RestaurantTable;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RestaurantPlatformTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_login(): void
    {
        $this->postJson('/api/auth/login', [
            'email' => 'client1@example.com',
            'password' => 'password',
        ])->assertOk()->assertJsonStructure(['user', 'token']);
    }

    public function test_reservation_creation(): void
    {
        $table = RestaurantTable::query()->where('statut', 'libre')->firstOrFail();

        $this->postJson('/api/reservations', [
            'table_id' => $table->id,
            'nom' => 'Test',
            'prenom' => 'Client',
            'email' => 'booking@example.com',
            'telephone' => '+212600000001',
            'reservation_date' => today()->addDay()->toDateString(),
            'reservation_time' => '20:00',
            'guest_count' => 2,
        ])->assertCreated();

        $this->assertDatabaseHas('reservations', [
            'email' => 'booking@example.com',
            'status' => ReservationStatus::Confirmed->value,
        ]);
        $this->assertDatabaseHas('restaurant_tables', [
            'id' => $table->id,
            'statut' => TableStatus::Reservee->value,
        ]);
    }

    public function test_client_reservations_are_sorted_by_date_time_and_latest_id(): void
    {
        $client = User::query()->where('role', UserRole::Client)->firstOrFail();
        $firstTable = RestaurantTable::query()->orderBy('id')->firstOrFail();
        $secondTable = RestaurantTable::query()->orderBy('id')->skip(1)->firstOrFail();

        Reservation::create([
            'user_id' => $client->id,
            'table_id' => $firstTable->id,
            'nom' => 'Client',
            'prenom' => 'Test',
            'email' => $client->email,
            'telephone' => '+212600000001',
            'reservation_date' => today()->addDays(2)->toDateString(),
            'reservation_time' => '19:00',
            'guest_count' => 2,
            'status' => ReservationStatus::Confirmed,
        ]);

        $latestReservation = Reservation::create([
            'user_id' => $client->id,
            'table_id' => $secondTable->id,
            'nom' => 'Client',
            'prenom' => 'Test',
            'email' => $client->email,
            'telephone' => '+212600000001',
            'reservation_date' => today()->addDays(2)->toDateString(),
            'reservation_time' => '21:00',
            'guest_count' => 2,
            'status' => ReservationStatus::Confirmed,
        ]);

        Sanctum::actingAs($client);

        $this->getJson('/api/my/reservations')
            ->assertOk()
            ->assertJsonPath('0.id', $latestReservation->id)
            ->assertJsonPath('0.table.id', $secondTable->id);
    }

    public function test_server_reservations_include_upcoming_dates(): void
    {
        $server = User::query()->where('role', UserRole::Server)->firstOrFail();
        $table = RestaurantTable::query()->firstOrFail();

        $tomorrowReservation = Reservation::create([
            'table_id' => $table->id,
            'nom' => 'Serveur',
            'prenom' => 'Future',
            'email' => 'future@example.com',
            'telephone' => '+212600000009',
            'reservation_date' => today()->addDay()->toDateString(),
            'reservation_time' => '20:30',
            'guest_count' => 4,
            'status' => ReservationStatus::Confirmed,
        ]);

        Sanctum::actingAs($server);

        $this->getJson('/api/server/reservations/today')
            ->assertOk()
            ->assertJsonFragment(['id' => $tomorrowReservation->id]);
    }

    public function test_order_creation(): void
    {
        $client = User::query()->where('role', UserRole::Client)->firstOrFail();
        $product = Product::query()->firstOrFail();

        Sanctum::actingAs($client);

        $this->postJson('/api/orders', [
            'order_type' => 'livraison',
            'nom' => 'Test',
            'prenom' => 'Client',
            'email' => 'client1@example.com',
            'telephone' => '+212600000001',
            'address' => 'Rue Italie',
            'city' => 'Casablanca',
            'payment_confirmed' => true,
            'items' => [
                ['product_id' => $product->id, 'quantity' => 2],
            ],
        ])->assertCreated();

        $this->assertDatabaseCount('orders', 2);
    }

    public function test_kitchen_status_change(): void
    {
        $cook = User::query()->where('role', UserRole::Cook)->firstOrFail();
        $order = Order::query()->firstOrFail();

        Sanctum::actingAs($cook);

        $this->putJson("/api/kitchen/orders/{$order->id}/start")->assertOk();

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'order_status' => OrderStatus::InPreparation->value]);
    }

    public function test_kitchen_ready_and_server_serves_onsite_order(): void
    {
        $server = User::query()->where('role', UserRole::Server)->firstOrFail();
        $cook = User::query()->where('role', UserRole::Cook)->firstOrFail();
        $table = RestaurantTable::query()->firstOrFail();
        $product = Product::query()->firstOrFail();

        $order = Order::create([
            'table_id' => $table->id,
            'order_type' => 'sur_place',
            'nom' => 'Salle',
            'prenom' => 'Test',
            'email' => 'salle@example.com',
            'telephone' => '+212600000111',
            'subtotal' => $product->price,
            'delivery_fee' => 0,
            'total' => $product->price,
            'payment_status' => 'paid',
            'order_status' => OrderStatus::Paid,
        ]);

        Sanctum::actingAs($cook);
        $this->putJson("/api/kitchen/orders/{$order->id}/ready")->assertOk();

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'order_status' => OrderStatus::Ready->value]);

        Sanctum::actingAs($server);
        $this->getJson('/api/server/orders/ready')->assertOk()->assertJsonFragment(['id' => $order->id]);
        $this->putJson("/api/server/orders/{$order->id}/serve")->assertOk();

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'order_status' => OrderStatus::Served->value]);
    }

    public function test_delivery_status_change(): void
    {
        $driver = User::query()->where('role', UserRole::Delivery)->firstOrFail();
        $delivery = Delivery::query()->firstOrFail();

        $delivery->update(['delivery_user_id' => $driver->id]);

        Sanctum::actingAs($driver);

        $this->putJson("/api/deliveries/{$delivery->id}/start")->assertOk();

        $this->assertDatabaseHas('deliveries', ['id' => $delivery->id, 'status' => DeliveryStatus::LivraisonCommencee->value]);
    }

    public function test_table_occupy_and_free(): void
    {
        $server = User::query()->where('role', UserRole::Server)->firstOrFail();
        $table = RestaurantTable::query()->firstOrFail();

        Sanctum::actingAs($server);

        $this->putJson("/api/server/tables/{$table->id}/occupy")->assertOk();
        $this->putJson("/api/server/tables/{$table->id}/free")->assertOk();

        $this->assertDatabaseHas('restaurant_tables', ['id' => $table->id, 'statut' => 'libre']);
    }

    public function test_role_permissions(): void
    {
        $client = User::query()->where('role', UserRole::Client)->firstOrFail();

        Sanctum::actingAs($client);

        $this->getJson('/api/admin/dashboard/stats')->assertForbidden();
    }

    public function test_mocked_stripe_payment_intent(): void
    {
        $this->mock(\App\Services\StripeService::class, function ($mock) {
            $mock->shouldReceive('createPaymentIntent')->once()->andReturn([
                'id' => 'pi_test',
                'client_secret' => 'pi_test_secret',
            ]);
        });

        $this->postJson('/api/checkout/create-payment-intent', ['amount' => 25])
            ->assertOk()
            ->assertJson(['id' => 'pi_test']);
    }
}
