<?php

namespace App\Enums;

enum DeliveryStatus: string
{
    case EnAttenteLivreur = 'en_attente_livreur';
    case PriseEnCharge = 'prise_en_charge';
    case LivraisonCommencee = 'livraison_commencee';
    case ArriveADestination = 'arrive_a_destination';
    case Livree = 'livree';
}
