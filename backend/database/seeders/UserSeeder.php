<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            ['nom' => 'Admin', 'prenom' => 'Italia', 'email' => 'admin@example.com', 'role' => UserRole::Admin],
            ['nom' => 'Cook', 'prenom' => 'One', 'email' => 'cook1@example.com', 'role' => UserRole::Cook],
            ['nom' => 'Cook', 'prenom' => 'Two', 'email' => 'cook2@example.com', 'role' => UserRole::Cook],
            ['nom' => 'Driver', 'prenom' => 'One', 'email' => 'driver1@example.com', 'role' => UserRole::Delivery],
            ['nom' => 'Driver', 'prenom' => 'Two', 'email' => 'driver2@example.com', 'role' => UserRole::Delivery],
            ['nom' => 'Waiter', 'prenom' => 'One', 'email' => 'waiter1@example.com', 'role' => UserRole::Server],
            ['nom' => 'Waiter', 'prenom' => 'Two', 'email' => 'waiter2@example.com', 'role' => UserRole::Server],
            ['nom' => 'Client', 'prenom' => 'One', 'email' => 'client1@example.com', 'role' => UserRole::Client],
            ['nom' => 'Client', 'prenom' => 'Two', 'email' => 'client2@example.com', 'role' => UserRole::Client],
            ['nom' => 'Client', 'prenom' => 'Three', 'email' => 'client3@example.com', 'role' => UserRole::Client],
            ['nom' => 'Client', 'prenom' => 'Four', 'email' => 'client4@example.com', 'role' => UserRole::Client],
            ['nom' => 'Client', 'prenom' => 'Five', 'email' => 'client5@example.com', 'role' => UserRole::Client],
        ];

        foreach ($users as $entry) {
            User::updateOrCreate(
                ['email' => $entry['email']],
                [
                    'nom' => $entry['nom'],
                    'prenom' => $entry['prenom'],
                    'telephone' => '+212600000000',
                    'password' => 'password',
                    'role' => $entry['role'],
                    'is_active' => true,
                ]
            );
        }
    }
}
