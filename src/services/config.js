// src/config.js

// Vite expone las variables de entorno en el objeto `import.meta.env`.
// `import.meta.env.DEV` es un booleano que es `true` en desarrollo y `false` en producción.
const isDev = import.meta.env.DEV;

// Leemos las URLs desde el archivo .env
const API_URL_DEV = import.meta.env.VITE_API_URL_DEV;
const API_URL_PROD = import.meta.env.VITE_API_URL_PROD;

// Exportamos la URL correcta basándonos en el entorno actual
export const API_URL = isDev ? API_URL_DEV : API_URL_PROD;

console.log(`Entorno de desarrollo: ${isDev}`);
console.log(`Usando API URL: ${API_URL}`);