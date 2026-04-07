<?php

namespace App\Enums;

enum ReservationStatus: string
{
    case Pending = 'pending';
    case Confirmed = 'confirmed';
    case Arrived = 'arrived';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
}
