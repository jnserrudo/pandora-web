// src/services/AdvertisementService.js
// Servicio para gestión de publicidades (ABM)
import axios from 'axios';
import { API_URL } from './config';

/**
 * Obtiene todas las publicidades (con filtros opcionales)
 * @param {Object} filters - Filtros (category, position, isActive)
 * @returns {Promise<Array>} Lista de publicidades
 */
export const getAdvertisements = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.position) params.append('position', filters.position);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive);

    const url = `${API_URL}/advertisements${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching advertisements:', error);
    return [];
  }
};

/**
 * Obtiene una publicidad por ID
 * @param {number|string} id - ID de la publicidad
 * @returns {Promise<Object>} Publicidad
 */
export const getAdvertisementById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/advertisements/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching advertisement ${id}:`, error);
    throw error;
  }
};

/**
 * Crea una nueva publicidad (solo administradores)
 * @param {Object} data - Datos de la publicidad
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Publicidad creada
 */
export const createAdvertisement = async (data, token) => {
  try {
    const response = await axios.post(`${API_URL}/advertisements`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating advertisement:', error);
    throw new Error(error.response?.data?.message || 'Error al crear la publicidad');
  }
};

/**
 * Actualiza una publicidad existente (solo administradores)
 * @param {number|string} id - ID de la publicidad
 * @param {Object} data - Datos actualizados
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Publicidad actualizada
 */
export const updateAdvertisement = async (id, data, token) => {
  try {
    const response = await axios.put(`${API_URL}/advertisements/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating advertisement ${id}:`, error);
    throw new Error(error.response?.data?.message || 'Error al actualizar la publicidad');
  }
};

/**
 * Elimina una publicidad (solo administradores)
 * @param {number|string} id - ID de la publicidad
 * @param {string} token - Token de autenticación
 * @returns {Promise<void>}
 */
export const deleteAdvertisement = async (id, token) => {
  try {
    await axios.delete(`${API_URL}/advertisements/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    console.error(`Error deleting advertisement ${id}:`, error);
    throw new Error(error.response?.data?.message || 'Error al eliminar la publicidad');
  }
};

/**
 * Registra un click o impresión de publicidad (tracking)
 * @param {number|string} id - ID de la publicidad
 * @param {string} type - Tipo ('impression' | 'click')
 * @returns {Promise<void>}
 */
export const trackAdvertisement = async (id, type = 'impression') => {
  try {
    await axios.post(`${API_URL}/advertisements/${id}/track`, { type });
  } catch (error) {
    console.error(`Error tracking advertisement ${id}:`, error);
    // No lanzamos error, el tracking no debe interrumpir la UX
  }
};

// ========== DATOS DE PRUEBA (Mock Data) ==========
// Se usarán mientras no exista el backend

const getMockAdvertisements = (filters = {}) => {
  const mockData = [
    {
      id: 1,
      title: 'Promoción Especial - Restaurant El Jardín',
      description: '20% de descuento en cenas románticas',
      imageUrl: 'https://via.placeholder.com/800x400/8a2be2/ffffff?text=Promo+Restaurant',
      link: '/commerce/1',
      category: 'commerce', // Publicidad de comercio interno
      position: 'banner_home',
      isActive: true,
      startDate: '2026-01-01',
      endDate: '2026-02-28',
    },
    {
      id: 2,
      title: 'Gobierno Municipal - Cultura Para Todos',
      description: 'Conocé las actividades municipales',
      imageUrl: 'https://via.placeholder.com/800x400/c738dd/ffffff?text=Gobierno+Municipal',
      link: 'https://ejemplo-gobierno.com',
      category: 'external', // Publicidad externa
      position: 'sidebar',
      isActive: true,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
    },
    {
      id: 3,
      title: 'Sponsor: Pandora Música Fest',
      description: 'Auspiciado por Pandora - El evento del año',
      imageUrl: 'https://via.placeholder.com/800x400/ff00c8/ffffff?text=Music+Fest',
      link: '/events',
      category: 'sponsor', // Auspicio
      position: 'banner_events',
      isActive: true,
      startDate: '2026-01-08',
      endDate: '2026-03-31',
    },
  ];

  // Aplicar filtros
  let filtered = mockData;
  
  if (filters.category) {
    filtered = filtered.filter(ad => ad.category === filters.category);
  }
  
  if (filters.position) {
    filtered = filtered.filter(ad => ad.position === filters.position);
  }
  
  if (filters.isActive !== undefined) {
    filtered = filtered.filter(ad => ad.isActive === filters.isActive);
  }

  return filtered;
};
