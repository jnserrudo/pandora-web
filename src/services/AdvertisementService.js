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
    console.log('Response:', response);
    if (response.data.length === 0) {
      return getMockAdvertisements(filters);
    }
    return response.data;
  } catch (error) {
    console.warn('Error fetching advertisements (using mock data):', error);
    const mockData = getMockAdvertisements(filters);
    console.log('Mock data:', mockData);
    return mockData;
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
 * Desactiva una publicidad (Borrado Lógico)
 * @param {number|string} id - ID de la publicidad
 * @param {boolean} isActive - Nuevo estado
 * @param {string} token - Token de autenticación
 */
export const toggleAdvertisementStatus = async (id, isActive, token) => {
  try {
    const response = await axios.put(`${API_URL}/advertisements/${id}`, { isActive }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Error toggling advertisement ${id}:`, error);
    throw new Error(error.response?.data?.message || 'Error al actualizar la publicidad');
  }
};

/**
 * Registra un click o impresión de publicidad (tracking)
 * @param {number|string} id - ID de la publicidad
 * @param {string} type - Tipo ('impression' | 'click')
 * @returns {Promise<void>}
 */
export const trackAdvertisement = async (id, type = 'impression') => {
  // Evitar seguimiento para IDs de prueba (Mocks)
  if (id <= 10) {
    console.log(`[Mock Tracking] Advertisement ${id} - ${type}`);
    return;
  }

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
      description: '20% de descuento en cenas románticas. Disfruta de una velada inolvidable con la mejor gastronomía local.',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop',
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
      description: 'Conocé las actividades municipales gratuitas para este fin de semana en tu barrio.',
      imageUrl: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=1000&auto=format&fit=crop',
      link: 'https://www.cultura.gob.ar',
      category: 'external', // Publicidad externa
      position: 'banner_home', // También puede aparecer en home
      isActive: true,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
    },
    {
      id: 3,
      title: 'Sponsor: Pandora Música Fest',
      description: 'Auspiciado por Pandora - El evento del año. ¡Conseguí tus entradas anticipadas hoy!',
      imageUrl: 'https://images.unsplash.com/photo-1459749411177-d4a428c389f5?q=80&w=1000&auto=format&fit=crop',
      link: '/events',
      category: 'sponsor', // Auspicio
      position: 'banner_home',
      isActive: true,
      startDate: '2026-01-08',
      endDate: '2026-03-31',
    },
    {
      id: 4,
      title: 'Clínica de Guitarra - Facundo Saravia',
      description: 'Este Sábado en el Centro Cultural. Entrada libre y gratuita.',
      imageUrl: 'https://images.unsplash.com/photo-1510915361408-d5a270f249fe?q=80&w=1000&auto=format&fit=crop',
      link: '/event/4',
      category: 'commerce',
      position: 'banner_home',
      isActive: true,
      startDate: '2026-01-20',
      endDate: '2026-02-10',
    },
    {
      id: 5,
      title: 'Nueva Colección Otoño-Invierno',
      description: 'Moda Urbana - Visitá nuestro showroom y renová tu estilo.',
      imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000&auto=format&fit=crop',
      link: '/commerce/5',
      category: 'sponsor',
      position: 'banner_home',
      isActive: true,
      startDate: '2026-02-01',
      endDate: '2026-05-01',
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
