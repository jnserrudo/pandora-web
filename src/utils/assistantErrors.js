const FALLBACK = 'El asistente no está disponible ahora. Intentá de nuevo en un rato.';

export function assistantFriendlyError(err) {
  const raw = String(err?.response?.data?.message || err?.message || '').trim();
  if (/demasiadas consultas/i.test(raw)) return raw;
  if (
    raw
    && raw.length <= 160
    && !/[{[]|"error"|model_not_found|invalid_request|llama-|gpt-oss|status code|does not exist/i.test(raw)
  ) {
    return raw;
  }
  return FALLBACK;
}
