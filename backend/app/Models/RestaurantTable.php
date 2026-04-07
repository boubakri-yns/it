<?php

namespace App\Models;

use App\Enums\TableStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RestaurantTable extends Model
{
    use HasFactory;

    protected $table = 'restaurant_tables';

    protected $fillable = ['numero', 'capacite', 'statut', 'is_active'];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'statut' => TableStatus::class,
        ];
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class, 'table_id');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'table_id');
    }
}
