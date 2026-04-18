<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Support\Facades\DB;

class CurrencyConversionService
{
    public function convertHistoricalEurToMad(float $rate = 10.8961): array
    {
        return DB::transaction(function () use ($rate) {
            $affectedOrderIds = [];
            $productCount = 0;
            $orderItemCount = 0;
            $orderCount = 0;
            $paymentCount = 0;
            $settingsCount = 0;

            Product::query()
                ->where('price', '<=', 30)
                ->chunkById(100, function ($products) use ($rate, &$productCount) {
                    foreach ($products as $product) {
                        $product->price = $this->convertAmount((float) $product->price, $rate);
                        $product->save();
                        $productCount++;
                    }
                });

            OrderItem::query()
                ->where('unit_price', '<=', 30)
                ->chunkById(100, function ($items) use ($rate, &$orderItemCount, &$affectedOrderIds) {
                    foreach ($items as $item) {
                        $item->unit_price = $this->convertAmount((float) $item->unit_price, $rate);
                        $item->total_price = $this->convertAmount((float) $item->total_price, $rate);
                        $item->save();

                        $affectedOrderIds[$item->order_id] = true;
                        $orderItemCount++;
                    }
                });

            Payment::query()
                ->where('currency', 'eur')
                ->chunkById(100, function ($payments) use ($rate, &$paymentCount, &$affectedOrderIds) {
                    foreach ($payments as $payment) {
                        $payment->amount = $this->convertAmount((float) $payment->amount, $rate);
                        $payment->currency = 'mad';
                        $payment->save();

                        $affectedOrderIds[$payment->order_id] = true;
                        $paymentCount++;
                    }
                });

            $orderIds = array_keys($affectedOrderIds);

            if ($orderIds !== []) {
                Order::query()
                    ->whereIn('id', $orderIds)
                    ->with('items:id,order_id,total_price')
                    ->chunkById(100, function ($orders) use ($rate, &$orderCount) {
                        foreach ($orders as $order) {
                            $subtotal = (float) $order->items->sum('total_price');
                            $deliveryFee = (float) $order->delivery_fee;

                            if ($deliveryFee > 0 && $deliveryFee <= 10) {
                                $deliveryFee = $this->convertAmount($deliveryFee, $rate);
                            }

                            $order->subtotal = $subtotal;
                            $order->delivery_fee = $deliveryFee;
                            $order->total = $this->convertAmount($subtotal + $deliveryFee, 1);
                            $order->save();
                            $orderCount++;
                        }
                    });
            }

            $deliveryFeeSetting = Setting::query()->where('key', 'delivery_fee')->first();
            if ($deliveryFeeSetting && (float) $deliveryFeeSetting->value <= 10) {
                $deliveryFeeSetting->value = '50.00';
                $deliveryFeeSetting->save();
                $settingsCount++;
            }

            $currencyCodeSetting = Setting::query()->firstOrNew(['key' => 'currency_code']);
            if ($currencyCodeSetting->value !== 'mad') {
                $currencyCodeSetting->value = 'mad';
                $currencyCodeSetting->group = $currencyCodeSetting->group ?: 'commerce';
                $currencyCodeSetting->save();
                $settingsCount++;
            }

            $rateSetting = Setting::query()->firstOrNew(['key' => 'currency_conversion_eur_mad_rate']);
            $convertedRate = number_format($rate, 4, '.', '');
            if ($rateSetting->value !== $convertedRate) {
                $rateSetting->value = $convertedRate;
                $rateSetting->group = $rateSetting->group ?: 'commerce';
                $rateSetting->save();
                $settingsCount++;
            }

            return [
                'rate' => number_format($rate, 4, '.', ''),
                'products' => $productCount,
                'order_items' => $orderItemCount,
                'orders' => $orderCount,
                'payments' => $paymentCount,
                'settings' => $settingsCount,
            ];
        });
    }

    private function convertAmount(float $amount, float $rate): float
    {
        return round($amount * $rate, 2);
    }
}
