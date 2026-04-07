<?php

use Illuminate\Support\ServiceProvider;

return [
    'name' => env('APP_NAME', 'Italia'),
    'env' => env('APP_ENV', 'production'),
    'debug' => (bool) env('APP_DEBUG', false),
    'url' => env('APP_URL', 'http://localhost'),
    'timezone' => 'UTC',
    'locale' => env('APP_LOCALE', 'fr'),
    'fallback_locale' => env('APP_FALLBACK_LOCALE', 'fr'),
    'faker_locale' => 'fr_FR',
    'key' => env('APP_KEY'),
    'cipher' => 'AES-256-CBC',
    'providers' => ServiceProvider::defaultProviders()->toArray(),
];
