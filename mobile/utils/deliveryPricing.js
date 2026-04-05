/**
 * Regras mock para taxa de delivery no cliente.
 * Em produção, o mesmo critério deve ser replicado ou substituído pela API Laravel.
 */

export const DELIVERY_CATEGORIES = [
  { id: 'documents', label: 'Documentos / leve' },
  { id: 'electronics', label: 'Electrónicos (telemóvel, PC, etc.)' },
  { id: 'fashion', label: 'Roupa, calçado e acessórios' },
  { id: 'food', label: 'Comida' },
  { id: 'market', label: 'Mercado / compras' },
  { id: 'other', label: 'Outro' },
];

export const DELIVERY_WEIGHT_TIERS = [
  { id: 'light', label: 'Até 5 kg' },
  { id: 'medium', label: '5 a 15 kg' },
  { id: 'heavy', label: 'Mais de 15 kg' },
];

export const DELIVERY_SIZE_TIERS = [
  { id: 'small', label: 'Pequeno' },
  { id: 'medium', label: 'Médio' },
  { id: 'large', label: 'Grande' },
];

/** Multiplicadores sobre a base (distância + tempo). Electrónicos: manuseio cuidadoso; moda: volume típico de sacos. */
const CATEGORY_FACTOR = {
  documents: 1,
  electronics: 1.2,
  fashion: 1.1,
  food: 1.12,
  market: 1.22,
  other: 1.08,
};

const WEIGHT_FACTOR = {
  light: 1,
  medium: 1.28,
  heavy: 1.6,
};

const SIZE_FACTOR = {
  small: 1,
  medium: 1.12,
  large: 1.25,
};

export function estimateDeliveryFee({ distanceKm, durationMin, categoryId, weightTier, sizeTier }) {
  const d = Number(distanceKm) > 0 ? Number(distanceKm) : 2;
  const t = Number(durationMin) > 0 ? Number(durationMin) : 5;
  const base = 8 + d * 4 + t * 0.8;
  const c = CATEGORY_FACTOR[categoryId] ?? 1;
  const w = WEIGHT_FACTOR[weightTier] ?? 1;
  const s = SIZE_FACTOR[sizeTier] ?? 1;
  return Math.round(base * c * w * s);
}

export function labelForDeliveryCategory(id) {
  return DELIVERY_CATEGORIES.find((x) => x.id === id)?.label ?? id;
}

export function labelForWeightTier(id) {
  return DELIVERY_WEIGHT_TIERS.find((x) => x.id === id)?.label ?? id;
}

export function labelForSizeTier(id) {
  return DELIVERY_SIZE_TIERS.find((x) => x.id === id)?.label ?? id;
}
