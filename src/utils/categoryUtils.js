/**
 * Utilidades para transformación y manejo de categorías
 * Convierte nombres de categoría con guiones bajos a formato legible para usuarios
 */

import { ENUM_LABELS, formatEnumLabel, formatCategoryLabel } from './enumLabels';

export { ENUM_LABELS, formatEnumLabel, formatCategoryLabel };

/**
 * Transforma un nombre de categoría de formato SNAKE_CASE a Title Case
 * @param {string} category - Nombre de categoría (ej: "VIDA_NOCTURNA")
 * @returns {string} Nombre formateado (ej: "Vida Nocturna")
 */
export const formatCategoryName = (category) => formatCategoryLabel(category);

/**
 * Mapeo de categorías conocidas para mantener consistencia
 */
export const CATEGORY_DISPLAY_NAMES = ENUM_LABELS;

/**
 * Obtiene el nombre de display para una categoría
 */
export const getCategoryDisplayName = (category) => formatCategoryLabel(category);

/**
 * Formatea una categoría que puede venir como objeto o string
 */
export const formatCategoryFromObject = (category) => formatCategoryLabel(category);

/**
 * Aplica formato a múltiples categorías en un array
 */
export const formatCategoriesArray = (categories) => {
  if (!Array.isArray(categories)) {
    return [];
  }
  return categories.map((cat) => formatCategoryFromObject(cat));
};

/**
 * Verifica si una categoría es válida (no nula/undefined)
 */
export const isValidCategory = (category) => {
  return category && typeof category === 'string' && category.trim().length > 0;
};

/**
 * Normaliza una categoría para comparaciones (uppercase sin espacios)
 */
export const normalizeCategory = (category) => {
  if (!category || typeof category !== 'string') {
    return '';
  }
  return category.toUpperCase().replace(/\s+/g, '_');
};

/**
 * Compara dos categorías ignorando formato
 */
export const categoriesMatch = (cat1, cat2) => {
  return normalizeCategory(cat1) === normalizeCategory(cat2);
};
