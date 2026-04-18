<?php

namespace App\Services;

use App\Enums\DeliveryStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Delivery;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderService
{
    public function __construct(private readonly ActivityLogService $activityLogService)
    {
    }

    public function create(array $payload, ?int $userId = null): Order
    {
        return DB::transaction(function () use ($payload, $userId) {
            $items = collect($payload['items'])->map(function (array $item) {
                $product = Product::query()->whereKey($item['product_id'])->firstOrFail();

                if (! $product->is_available) {
                    throw ValidationException::withMessages([
                        'items' => ["Le produit {$product->name} n'est pas disponible."],
                    ]);
                }

                $quantity = (int) $item['quantity'];

                return [
                    'product' => $product,
                    'quantity' => $quantity,
                    'unit_price' => (float) $product->price,
                    'total_price' => $quantity * (float) $product->price,
                ];
            });

            $subtotal = $items->sum('total_price');
            $deliveryFee = $payload['order_type'] === 'livraison'
                ? (float) (Setting::query()->where('key', 'delivery_fee')->value('value') ?? 50.00)
                : 0;

            if ($payload['order_type'] === 'livraison' && empty($payload['address'])) {
                throw ValidationException::withMessages([
                    'address' => ['Une adresse complète est requise pour une livraison.'],
                ]);
            }

            $paymentStatus = ! empty($payload['payment_confirmed'])
                ? PaymentStatus::Paid
                : PaymentStatus::Pending;

            $orderStatus = $paymentStatus === PaymentStatus::Paid
                ? OrderStatus::Paid
                : OrderStatus::Pending;

            $order = Order::create([
                'user_id' => $userId,
                'table_id' => $payload['table_id'] ?? null,
                'order_type' => $payload['order_type'],
                'nom' => $payload['nom'],
                'prenom' => $payload['prenom'],
                'email' => $payload['email'],
                'telephone' => $payload['telephone'],
                'address' => $payload['address'] ?? null,
                'city' => $payload['city'] ?? null,
                'latitude' => $payload['latitude'] ?? null,
                'longitude' => $payload['longitude'] ?? null,
                'notes' => $payload['notes'] ?? null,
                'subtotal' => $subtotal,
                'delivery_fee' => $deliveryFee,
                'total' => $subtotal + $deliveryFee,
                'payment_status' => $paymentStatus,
                'order_status' => $orderStatus,
            ]);

            foreach ($items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product']->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $item['total_price'],
                ]);
            }

            if ($order->order_type === 'livraison') {
                Delivery::create([
                    'order_id' => $order->id,
                    'status' => DeliveryStatus::EnAttenteLivreur,
                ]);
            }

            $this->activityLogService->log($userId, 'order', $order->id, 'created', 'Commande créée', [
                'order_type' => $order->order_type,
                'payment_status' => $order->payment_status->value,
            ]);

            return $order->load(['items.product', 'delivery', 'payment']);
        });
    }
}
