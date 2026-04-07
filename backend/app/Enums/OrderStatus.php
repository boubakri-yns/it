<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Pending = 'pending';
    case Paid = 'paid';
    case Accepted = 'accepted';
    case InPreparation = 'in_preparation';
    case Ready = 'ready';
    case OutForDelivery = 'out_for_delivery';
    case Arrived = 'arrived';
    case Delivered = 'delivered';
    case Served = 'served';
    case Cancelled = 'cancelled';
}
