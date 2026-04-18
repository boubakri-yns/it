export const roleSpaceMeta = {
  cook: {
    navLabel: 'Espace cuisine',
    basePath: '/cook',
  },
  delivery: {
    navLabel: 'Espace livraison',
    basePath: '/delivery',
  },
  server: {
    navLabel: 'Espace service',
    basePath: '/server',
  },
  admin: {
    navLabel: 'Espace admin',
    basePath: '/admin',
  },
};

const labelMap = {
  pending: 'En attente',
  paid: 'Payee',
  accepted: 'Acceptee',
  in_preparation: 'En preparation',
  ready: 'Prete',
  out_for_delivery: 'En livraison',
  arrived: 'Arrivee',
  delivered: 'Livree',
  served: 'Servie',
  cancelled: 'Annulee',
  en_attente_livreur: 'En attente livreur',
  prise_en_charge: 'Prise en charge',
  livraison_commencee: 'Livraison commencee',
  arrive_a_destination: 'Arrive a destination',
  libre: 'Libre',
  reservee: 'Reservee',
  occupee: 'Occupee',
  indisponible: 'Indisponible',
  confirmed: 'Confirmee',
  completed: 'Completee',
  sur_place: 'Sur place',
  a_emporter: 'A emporter',
  livraison: 'Livraison',
  stripe: 'Stripe',
};

export function formatLabel(value) {
  if (!value) return '-';
  return labelMap[value] || String(value).replaceAll('_', ' ');
}

export function formatMoney(value) {
  const amount = Number(value || 0);
  return `${amount.toFixed(2)} MAD`;
}

export function statusTone(value) {
  const success = ['delivered', 'livree', 'served', 'completed', 'paid', 'libre'];
  const danger = ['cancelled', 'indisponible'];
  const warm = ['ready', 'in_preparation', 'out_for_delivery', 'arrived', 'prise_en_charge', 'livraison_commencee', 'arrive_a_destination', 'reservee', 'occupee', 'pending', 'confirmed'];

  if (success.includes(value)) return 'success';
  if (danger.includes(value)) return 'danger';
  if (warm.includes(value)) return 'warm';
  return 'neutral';
}

export function formatDateTime(value) {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
