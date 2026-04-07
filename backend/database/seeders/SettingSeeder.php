<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['key' => 'delivery_fee', 'value' => '4.50', 'group' => 'commerce'],
            ['key' => 'hours_weekdays', 'value' => '12:00 - 23:00', 'group' => 'restaurant'],
            ['key' => 'hours_weekend', 'value' => '12:00 - 00:00', 'group' => 'restaurant'],
            ['key' => 'restaurant_name', 'value' => 'Italia Restaurant', 'group' => 'general'],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(['key' => $setting['key']], $setting);
        }
    }
}
