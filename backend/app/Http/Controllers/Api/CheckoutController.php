<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreatePaymentIntentRequest;
use App\Services\StripeService;
use Illuminate\Http\JsonResponse;

class CheckoutController extends Controller
{
    public function __construct(private readonly StripeService $stripeService)
    {
    }

    public function createPaymentIntent(CreatePaymentIntentRequest $request): JsonResponse
    {
        return response()->json(
            $this->stripeService->createPaymentIntent(
                (int) round($request->input('amount') * 100),
                strtolower((string) $request->input('currency', 'mad')),
            )
        );
    }
}
