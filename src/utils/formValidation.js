/**
 * Helpers de validación de formularios ABM.
 * Mensajes en español: qué falta y qué corregir.
 */

/** Fecha/hora local legible: 27/08/2026 16:28 */
export function formatDateTimeEs(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Valor para input datetime-local (YYYY-MM-DDTHH:mm) en zona local */
export function toDatetimeLocalValue(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * checks: [{ ok: boolean, message: string }]
 * Devuelve todos los mensajes de lo que falta / está mal.
 */
export function collectFormIssues(checks) {
  return (checks || []).filter((c) => !c.ok && c.message).map((c) => c.message);
}

/** Un solo string para toast (una línea o viñetas cortas). */
export function formatIssuesToast(issues, { max = 4 } = {}) {
  const list = (issues || []).filter(Boolean);
  if (list.length === 0) return '';
  if (list.length === 1) return list[0];
  const shown = list.slice(0, max);
  const more = list.length > max ? ` (+${list.length - max} más)` : '';
  return `Falta completar:\n• ${shown.join('\n• ')}${more}`;
}

/**
 * Mensaje nativo del input (HTML5) en español.
 * Usar en onInvalid / onChange.
 */
export function setSpanishFieldValidity(event, {
  requiredMessage = 'Este campo es obligatorio.',
  rangeUnderflowMessage,
  rangeOverflowMessage,
} = {}) {
  const el = event?.target;
  if (!el || typeof el.setCustomValidity !== 'function') return;

  el.setCustomValidity('');
  if (el.validity.valueMissing) {
    el.setCustomValidity(requiredMessage);
  } else if (el.validity.rangeUnderflow && rangeUnderflowMessage) {
    el.setCustomValidity(rangeUnderflowMessage);
  } else if (el.validity.rangeOverflow && rangeOverflowMessage) {
    el.setCustomValidity(rangeOverflowMessage);
  }
}

export function clearFieldValidity(event) {
  const el = event?.target;
  if (el && typeof el.setCustomValidity === 'function') {
    el.setCustomValidity('');
  }
}
