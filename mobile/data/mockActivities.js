export const MOCK_ACTIVITIES = [
  {
    id: '1',
    type: 'ride',
    title: 'Corrida para Aeroporto',
    subtitle: 'Centro de Nampula → Aeroporto (APL)',
    date: '27 Jun 2024',
    time: '14:32',
    status: 'completed',
    statusLabel: 'Concluída',
    amount: '23 MT',
    paymentMethod: 'M-Pesa',
  },
  {
    id: '2',
    type: 'delivery',
    title: 'Delivery de Supermercado',
    subtitle: 'Shoprite Nampula → Av. Eduardo Mondlane',
    date: '23 Jun 2024',
    time: '10:15',
    status: 'completed',
    statusLabel: 'Concluída',
    amount: '180 MT',
    paymentMethod: 'Dinheiro',
    pickupName: 'Shoprite Nampula',
    destinationName: 'Av. Eduardo Mondlane, n.º 120',
    itemCategory: 'Mercado / compras',
    itemDescription: '2 sacos — produtos de limpeza e mercearia seca',
    distanceKm: '4,8 km',
    durationMin: '22 min',
    courierName: 'Mário Salimo',
    deliveryReference: 'Portão lateral do prédio',
  },
  {
    id: '3',
    type: 'ticket',
    title: 'Bilhete para Maputo',
    subtitle: 'Nampula → Maputo · TP 102',
    date: '07 Jun 2024',
    time: '09:00',
    status: 'completed',
    statusLabel: 'Concluída',
    amount: '1 450 MT',
    paymentMethod: 'e-Mola',
  },
  {
    id: '4',
    type: 'ride',
    title: 'Corrida para Hospital',
    subtitle: 'Mutuenha → Hospital Central',
    date: '02 Jun 2024',
    time: '18:40',
    status: 'cancelled',
    statusLabel: 'Cancelada',
    amount: null,
    paymentMethod: null,
  },
  {
    id: '5',
    type: 'ride',
    title: 'Corrida — trabalho',
    subtitle: 'Namutequeli → Zona comercial',
    date: '28 Mai 2024',
    time: '07:55',
    status: 'completed',
    statusLabel: 'Concluída',
    amount: '45 MT',
    paymentMethod: 'M-Pesa',
  },
  {
    id: '6',
    type: 'delivery',
    title: 'Delivery de documentos',
    subtitle: 'Tribunal Provincial → Cartório Central',
    date: '15 Mai 2024',
    time: '11:20',
    status: 'completed',
    statusLabel: 'Concluída',
    amount: '95 MT',
    paymentMethod: 'M-Pesa',
    itemCategory: 'Documentos / leve',
    itemDescription: 'Envelope A4 selado — urgente',
    distanceKm: '2,1 km',
    durationMin: '12 min',
    courierName: 'Carlos Tembe',
  },
];

export function typeMeta(type) {
  switch (type) {
    case 'ride':
      return { icon: 'car-outline', color: '#006AFF', bg: '#EAF4FF', label: 'Corrida' };
    case 'delivery':
      return { icon: 'bicycle-outline', color: '#48CAE4', bg: '#E8FAFC', label: 'Delivery' };
    case 'ticket':
      return { icon: 'ticket-outline', color: '#0A2547', bg: '#E8EEF5', label: 'Bilhete' };
    default:
      return { icon: 'ellipse-outline', color: '#51627B', bg: '#F4F6F9', label: 'Atividade' };
  }
}

export function statusStyle(status) {
  switch (status) {
    case 'completed':
      return { bg: '#E6F7EF', color: '#1B7A4C', border: '#B8E5CC' };
    case 'cancelled':
      return { bg: '#F3F4F6', color: '#5C6470', border: '#DDE1E6' };
    case 'active':
      return { bg: '#E8FAFC', color: '#0A6B82', border: '#B8E8F0' };
    default:
      return { bg: '#F8FAFD', color: '#51627B', border: '#E3EAF4' };
  }
}

export function getActivityById(id) {
  return MOCK_ACTIVITIES.find((a) => a.id === String(id));
}

export function splitRouteSubtitle(subtitle) {
  const parts = subtitle.split(/\s*→\s*/);
  if (parts.length >= 2) {
    return { origin: parts[0].trim(), rest: parts.slice(1).join(' → ').trim() };
  }
  return { origin: null, rest: subtitle };
}

/** Recolha / entrega explícitos ou fallback a partir do subtítulo (delivery). */
export function deliveryRouteParts(activity) {
  if (activity.type !== 'delivery') return null;
  if (activity.pickupName && activity.destinationName) {
    return { pickup: activity.pickupName, destination: activity.destinationName };
  }
  const { origin, rest } = splitRouteSubtitle(activity.subtitle);
  if (origin) return { pickup: origin, destination: rest };
  return { pickup: null, destination: activity.subtitle };
}
