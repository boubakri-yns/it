<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Client = 'client';
    case Cook = 'cook';
    case Delivery = 'delivery';
    case Server = 'server';
}
