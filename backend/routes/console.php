<?php

use App\Services\CurrencyConversionService;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

Artisan::command('inspire', function () {
    $this->comment('Italia is ready.');
});

Artisan::command('currency:convert-eur-to-mad {--rate=10.8961}', function (CurrencyConversionService $service) {
    $rate = (float) $this->option('rate');
    $result = $service->convertHistoricalEurToMad($rate);

    $this->info("Conversion EUR -> MAD terminee avec le taux {$result['rate']}.");
    $this->line("Produits convertis: {$result['products']}");
    $this->line("Lignes de commande converties: {$result['order_items']}");
    $this->line("Commandes recalculées: {$result['orders']}");
    $this->line("Paiements convertis: {$result['payments']}");
    $this->line("Parametres mis a jour: {$result['settings']}");
})->purpose('Convertit les anciennes donnees EUR en MAD.');

Artisan::command('app:reset-data-keep-users', function () {
    DB::transaction(function () {
        DB::table('personal_access_tokens')->delete();
        DB::table('activity_logs')->delete();
        DB::table('notifications')->delete();
        DB::table('addresses')->delete();
        DB::table('payments')->delete();
        DB::table('deliveries')->delete();
        DB::table('order_items')->delete();
        DB::table('orders')->delete();
        DB::table('reservations')->delete();

        DB::table('restaurant_tables')->update([
            'statut' => 'libre',
            'updated_at' => now(),
        ]);
    });

    $this->info('Les donnees ont ete reinitialisees. Les comptes utilisateurs ont ete conserves.');
    $this->line('Supprime: commandes, reservations, paiements, livraisons, adresses, notifications, logs et tokens.');
    $this->line('Reinitialise: statut des tables a libre.');
})->purpose('Vide les donnees metier tout en gardant les comptes utilisateurs.');
