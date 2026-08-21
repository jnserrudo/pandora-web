/**
 * Reglas de contraseña alineadas con backend (auth.model.js).
 * Especiales permitidos: @ $ ! % * ? &
 */
export const PASSWORD_SPECIALS = '@$!%*?&';

export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const PASSWORD_RULES_HINT =
  'Mínimo 8 caracteres, con mayúscula, minúscula, número y un símbolo: @ $ ! % * ? &. El guion (-) u otros símbolos no valen. Ej: Nprueba20!';

export const getPasswordChecks = (password = '') => ({
  minLength: password.length >= 8,
  lower: /[a-z]/.test(password),
  upper: /[A-Z]/.test(password),
  number: /\d/.test(password),
  special: /[@$!%*?&]/.test(password),
  onlyAllowed: password.length === 0 || /^[A-Za-z\d@$!%*?&]*$/.test(password),
});

export const isPasswordValid = (password = '') => PASSWORD_REGEX.test(password);

export const formatPasswordError = (serverMessage = '') => {
  if (/contraseña/i.test(serverMessage) || /password/i.test(serverMessage)) {
    return `${serverMessage} ${PASSWORD_RULES_HINT}`;
  }
  if (/captcha/i.test(serverMessage)) {
    return `${serverMessage} Completá el captcha de nuevo antes de reintentar (el anterior ya no sirve).`;
  }
  return serverMessage;
};
