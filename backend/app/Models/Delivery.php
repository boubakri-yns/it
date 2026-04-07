<?php

namespace App\Models;

use App\Enums\DeliveryStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Delivery extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'delivery_user_id',
        'status',
        'started_at',
        'arrived_at',
        'delivered_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'status' => DeliveryStatus::class,
            'started_at' => 'datetime',
            'arrived_at' => 'datetime',
            'delivered_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function deliveryUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'delivery_user_id');
    }
}
