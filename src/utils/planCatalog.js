/**
 * Catálogo canónico de planes de COMERCIO (nivel 1–4).
 * Fuente de UI / fallbacks. La DB puede sobrescribir name, price, description, benefits.
 * No confundir con tiers de EVENTO (Básico / Plus / Premium).
 */

export const COMMERCE_PLAN_CATALOG = [
  {
    level: 1,
    name: 'Free',
    price: 0,
    description: 'Presencia básica en el mapa de Salta.',
    benefits: [
      '1 foto',
      '1 categoría',
      '1 sucursal',
      'Ficha pública con horarios y contacto',
    ],
    iconName: 'MousePointer2',
    color: 'var(--tier-basic)',
  },
  {
    level: 2,
    name: 'Plata',
    price: 15000,
    description: 'Más visibilidad y herramientas de gestión.',
    benefits: [
      'Hasta 10 fotos',
      'Hasta 3 categorías',
      'Hasta 3 sucursales',
      'Catálogo de productos',
      'Respuesta a comentarios',
      'Teléfono y link externo visibles',
    ],
    iconName: 'Zap',
    color: 'var(--tier-plus)',
  },
  {
    level: 3,
    name: 'Oro',
    price: 30000,
    description: 'Máxima exposición en la guía local.',
    benefits: [
      'Galería amplia',
      'FAQs en la ficha',
      'Destacado en listados (planLevel)',
      'Video y menú externo',
      'Todo lo de Plata',
    ],
    iconName: 'Award',
    color: 'var(--color-primary)',
    featured: true,
  },
  {
    level: 4,
    name: 'Platino',
    price: 50000,
    description: 'Socio Pandora con el techo del plan.',
    benefits: [
      'Todo lo de Oro',
      'Límites altos de galería y sucursales',
      'Prioridad en destacados',
      'Soporte preferencial',
    ],
    iconName: 'Crown',
    color: 'var(--tier-premium)',
  },
];

/** Une benefits de API (string) en lista de bullets. */
export function parsePlanBenefits(raw) {
  if (Array.isArray(raw)) {
    return raw.map((f) => String(f).trim()).filter(Boolean);
  }
  if (raw == null || raw === '') return [];
  const text = String(raw).trim();
  if (!text) return [];
  if (text.includes('\n')) {
    return text.split('\n').map((f) => f.trim()).filter(Boolean);
  }
  if (text.includes(';')) {
    return text.split(';').map((f) => f.trim()).filter(Boolean);
  }
  if (text.includes(',')) {
    return text.split(',').map((f) => f.trim()).filter(Boolean);
  }
  return [text];
}

export function benefitsToStorage(features) {
  if (Array.isArray(features)) return features.map((f) => String(f).trim()).filter(Boolean).join('\n');
  if (features == null) return '';
  return String(features);
}

export function getCatalogPlan(level) {
  return COMMERCE_PLAN_CATALOG.find((p) => p.level === Number(level)) || null;
}

/** Niveles que el dueño puede elegir al crear/comprar. Platino (4) queda “próximamente”. */
export const COMMERCE_PLAN_SELECTABLE_LEVELS = [1, 2, 3];

export function isCommercePlanSelectable(level) {
  return COMMERCE_PLAN_SELECTABLE_LEVELS.includes(Number(level));
}

export function getCommercePlanShortHint(level) {
  const plan = getCatalogPlan(level);
  return plan?.description || '';
}
