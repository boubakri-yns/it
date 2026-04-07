<?php

namespace Database\Seeders;

use App\Enums\TableStatus;
use App\Models\RestaurantTable;
use Illuminate\Database\Seeder;

class RestaurantTableSeeder extends Seeder
{
    public function run(): void
    {
        foreach (range(1, 10) as $index) {
            RestaurantTable::updateOrCreate(
                ['numero' => 'T'.$index],
                [
                    'capacite' => $index <= 4 ? 2 : ($index <= 8 ? 4 : 6),
                    'statut' => TableStatus::Libre,
                    'is_active' => true,
                ]
            );
        }
    }
}
