<?php

namespace App\Services;

use Stripe\PaymentIntent;
use Stripe\Stripe;

class StripeService
{
    public function createPaymentIntent(int $amountInCents, string $currency = 'eur', array $metadata = []): array
    {
        Stripe::setApiKey((string) config('services.stripe.secret'));

        $intent = PaymentIntent::create([
            'amount' => $amountInCents,
            'currency' => $currency,
            'metadata' => $metadata,
            'automatic_payment_methods' => ['enabled' => true],
        ]);

        return [
            'id' => $intent->id,
            'client_secret' => $intent->client_secret,
        ];
    }
}
