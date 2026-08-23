/**
 * Etiquetas humanas para enums / slugs del backend.
 * Las claves se comparan en MAYÚSCULAS (GASTRONOMIA, banner_home, etc.).
 */
export const ENUM_LABELS = {
  // Categorías de comercio
  ALL: 'Todos',
  VIDA_NOCTURNA: 'Vida Nocturna',
  GASTRONOMIA: 'Gastronomía',
  SALAS_Y_TEATRO: 'Salas y Teatro',
  TURISMO: 'Turismo',
  COMPRAS: 'Compras',
  SERVICIOS: 'Servicios',
  DEPORTES: 'Deportes',
  CULTURA: 'Cultura',
  EDUCACION: 'Educación',
  SALUD: 'Salud',
  BELLEZA: 'Belleza',
  TECNOLOGIA: 'Tecnología',
  HOTELES: 'Hoteles',
  RESTAURANTES: 'Restaurantes',
  BARES: 'Bares',
  CAFETERIAS: 'Cafeterías',
  TIENDAS: 'Tiendas',
  ENTRETENIMIENTO: 'Entretenimiento',

  // Roles
  USER: 'Usuario',
  OWNER: 'Propietario',
  ADMIN: 'Administrador',
  GUEST: 'Invitado',
  USUARIO: 'Usuario',

  CREATE: 'Alta',
  UPDATE: 'Edición',
  DELETE: 'Baja',
  VALIDATE: 'Validación',
  REJECT: 'Rechazo',
  LOGIN: 'Inicio de sesión',

  // Estados comercio / evento / artículo / envíos
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  PENDING: 'Pendiente',
  REJECTED: 'Rechazado',
  FLAGGED: 'Marcado',
  APPROVED: 'Aprobado',
  SCHEDULED: 'Programado',
  CANCELLED: 'Cancelado',
  FINISHED: 'Finalizado',
  DRAFT: 'Borrador',
  PUBLISHED: 'Publicado',
  RESPONDED: 'Respondido',
  ARCHIVED: 'Archivado',
  VALIDATED: 'Validado',

  // Pagos
  PAGO_PENDIENTE: 'Pago pendiente',

  // Tipos de solicitud
  CONTACT: 'Consulta',
  CONSULTA: 'Consulta',
  AD_PROPOSAL: 'Publicidad',
  MAGAZINE_PROPOSAL: 'Revista',
  PLAN_UPGRADE: 'Pago / Plan',
  EVENT_REQUEST: 'Solicitud de evento',
  OTHER: 'Otro',
  OTRO: 'Otro',

  // Publicidades
  COMMERCE: 'Comercio',
  EXTERNAL: 'Externo',
  SPONSOR: 'Sponsor',
  BANNER_HOME: 'Banner Home',
  BANNER_EVENTS: 'Banner Eventos',
  SIDEBAR: 'Barra lateral',
  CARD: 'Tarjeta',

  // Recursos / auditoría
  EVENT: 'Evento',
  ARTICLE: 'Artículo',
  ADVERTISEMENT: 'Publicidad',
  SUBMISSION: 'Solicitud',
  COMMENT: 'Comentario',

  // Feedback de comercios
  SERVICIO: 'Atención y servicio',
  AMBIENTE: 'Ambiente',
  CALIDAD: 'Calidad',
  PRECIO: 'Precio',

  // Prioridad
  LOW: 'Baja',
  NORMAL: 'Normal',
  HIGH: 'Alta',
  URGENT: 'Urgente',

  // Asesorías
  SENT: 'Nueva',
  READ: 'Leída',
  IMPLEMENTED: 'Implementada',
};

const WORD_ACCENTS = {
  gastronomia: 'Gastronomía',
  educacion: 'Educación',
  cafeterias: 'Cafeterías',
  tecnologia: 'Tecnología',
};

function titleCaseToken(word) {
  const lower = word.toLowerCase();
  if (WORD_ACCENTS[lower]) return WORD_ACCENTS[lower];
  if (!word) return '';
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function looksLikeEnum(value) {
  return /^[A-Z0-9]+(_[A-Z0-9]+)+$/.test(value) || /^[A-Z]{3,}$/.test(value);
}

/**
 * Convierte un enum, slug o { name, slug } en texto para mostrar.
 */
export function formatEnumLabel(value, fallback = '') {
  if (value == null || value === '') return fallback;

  if (typeof value === 'object') {
    return formatEnumLabel(value.name || value.slug || value.label || value.type, fallback);
  }

  const raw = String(value).trim();
  const upper = raw.toUpperCase().replace(/[\s-]+/g, '_');

  if (ENUM_LABELS[upper]) return ENUM_LABELS[upper];
  if (ENUM_LABELS[raw]) return ENUM_LABELS[raw];

  if (looksLikeEnum(raw) || raw.includes('_')) {
    return raw.split(/[_-]/).filter(Boolean).map(titleCaseToken).join(' ');
  }

  return raw;
}

export function formatCategoryLabel(value) {
  return formatEnumLabel(value, 'Sin categoría');
}

export function formatStatusLabel(value) {
  return formatEnumLabel(value, 'Sin estado');
}

export function formatRoleLabel(value) {
  return formatEnumLabel(value, 'Usuario');
}

const PAYMENT_METHOD_LABELS = {
  NORMAL: 'Pago estándar',
  OFFER: 'Oferta / solicitud',
  COUPON: 'Cupón',
  ADMIN_ADJUSTMENT: 'Ajuste administrativo',
};

/** Métodos de cobro de PlanHistory (mapa propio: NORMAL ≠ prioridad). */
export function formatPaymentMethodLabel(value, fallback = 'Otro método') {
  if (value == null || value === '') return fallback;
  const upper = String(value).trim().toUpperCase().replace(/[\s-]+/g, '_');
  return PAYMENT_METHOD_LABELS[upper] || formatEnumLabel(value, fallback);
}

const PLAN_LEVEL_LABELS = {
  1: 'Free',
  2: 'Plata',
  3: 'Oro',
  4: 'Platino',
};

/** Nivel de plan de comercio (1–4). Usa name si se pasa string no numérico. */
export function formatPlanLevelLabel(levelOrName, fallback = 'Sin plan') {
  if (levelOrName == null || levelOrName === '') return fallback;
  const n = Number(levelOrName);
  if (Number.isFinite(n) && PLAN_LEVEL_LABELS[n]) return PLAN_LEVEL_LABELS[n];
  const raw = String(levelOrName).trim();
  const upper = raw.toUpperCase().normalize('NFD').replace(/\p{M}/gu, '');
  const aliases = {
    FREE: 'Free',
    ECO: 'Free',
    BASIC: 'Free',
    BASICO: 'Free',
    GRATUITO: 'Free',
    PLATA: 'Plata',
    PLUS: 'Plata',
    BOOST: 'Plata',
    ORO: 'Oro',
    PREMIUM: 'Oro',
    GOLD: 'Oro',
    PLATINO: 'Platino',
    ELITE: 'Platino',
    DIAMOND: 'Platino',
  };
  if (aliases[upper]) return aliases[upper];
  return raw || fallback;
}
