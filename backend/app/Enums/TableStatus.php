<?php

namespace App\Enums;

enum TableStatus: string
{
    case Libre = 'libre';
    case Reservee = 'reservee';
    case Occupee = 'occupee';
    case Indisponible = 'indisponible';
}
