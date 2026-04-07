// src/services/api.js
import axios from "axios";
import { API_URL } from "./config";
export { API_URL };

console.log("API_URL Resolved:", API_URL);

// Utilidad para asegurar que las URLs de imágenes sean absolutas
export const getAbsoluteImageUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  if (url.startsWith('http')) return url;
  const baseUrl = API_URL.replace('/api', '');
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

// --- CONFIGURACIÓN DE AXIOS Y MANEJO GLOBAL DE ERRORES ---

// Interceptor para manejar errores de autenticación a nivel global
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const isLoginPage = window.location.pathname === '/login';

    if (status === 401 && !isLoginPage && !originalRequest._retry) {
      originalRequest._retry = true;
      const storedRefreshToken = localStorage.getItem('refreshToken');

      if (storedRefreshToken) {
        try {
          console.warn("Sesión expirada. Intentando refrescar token...");
          const response = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken: storedRefreshToken
          });
          
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          
          // Guardar nuevos tokens
          localStorage.setItem('token', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          // Actualizar cabecera del request original y reintentar
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
          return axios(originalRequest);
        } catch (refreshError) {
          console.error("No se pudo refrescar el token:", refreshError);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login?expired=true';
          // Devolvemos una promesa que nunca se resuelve para evitar que los 
          // componentes UI procesen respuestas fallidas mientras la app redirige.
          return new Promise(() => {});
        }
      } else {
        localStorage.removeItem('token');
        window.location.href = '/login?expired=true';
        return new Promise(() => {});
      }
    } 
    
    if (status === 403) {
      console.warn("Permisos insuficientes (403).");
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/?auth_error=forbidden';
        return new Promise(() => {});
      }
    }

    return Promise.reject(error);
  }
);

// --- FUNCIONES PARA COMERCIOS ---

// Obtiene comercios (opcionalmente filtrados por categoría o nivel de plan)
export const getCommerces = async (filters = {}) => {
  try {
    const safeFilters = filters || {};
    const { category, planLevel } = typeof safeFilters === 'object' ? safeFilters : { category: safeFilters };
    
    let url = `${API_URL}/commerces?`;
    if (category) url += `category=${category}&`;
    if (planLevel) url += `planLevel=${planLevel}&`;
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching commerces:", error);
    throw error;
  }
};

// Obtiene TODOS los comercios (para admins)
export const getAllCommerces = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/commerces`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching all commerces:", error);
    throw error;
  }
};

// --- NUEVA FUNCIÓN ---
// Obtiene un comercio específico por su ID
export const getCommerceById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/commerces/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching commerce with id ${id}:`, error);
    throw error; // Lanza el error para que la página de detalle lo maneje
  }
};

// Obtiene todas las categorías disponibles
export const getCategories = async () => {
  try {
    const response = await axios.get(`${API_URL}/categories`);
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

// --- FUNCIONES PARA EVENTOS (NUEVAS) ---

// Obtiene todos los eventos (con token opcional para admin — ve todos los estados)
export const getEvents = async (token = null) => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.get(`${API_URL}/events`, { headers });
    return response.data;
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
};

// Obtiene un evento específico por su ID
export const getEventById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/events/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching event with id ${id}:`, error);
    throw error;
  }
};

// --- FUNCIONES PARA ARTÍCULOS ---

// --- FUNCIONES PARA ARTÍCULOS ---

// Obtiene artículos (ahora con soporte de paginación)
export const getArticles = async (page = 1, limit = 10, sortBy = 'recent') => {
  try {
    const url = `${API_URL}/articles?page=${page}&limit=${limit}&sortBy=${sortBy}`;
    const response = await axios.get(url);
    // El backend ahora devuelve { articles: [], meta: {} }
    // Si devuelve un array directo (backend viejo), lo manejamos
    if (Array.isArray(response.data)) {
      return { articles: response.data, meta: { total: response.data.length } };
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching articles:", error);
    return { articles: [], meta: { total: 0 } };
  }
};

// Obtiene un artículo específico por su slug
export const getArticleBySlug = async (slug) => {
  try {
    const url = `${API_URL}/articles/${slug}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching article with slug ${slug}:`, error);
    throw error;
  }
};

// --- FUNCIÓN DE BÚSQUEDA ---

export const searchGlobal = async (query) => {
  try {
    const url = `${API_URL}/search?q=${query}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error during search:", error);
    // Retornamos estructura vacía para evitar errores en el frontend
    return { commerces: [], events: [], articles: [] };
  }
};

// --- FUNCIONES DE SUBMISSIONS (UNIFICADO) ---

export const createSubmission = async (formData, token) => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    // Si formData es una instancia de FormData (para adjuntos), axios lo maneja
    const response = await axios.post(`${API_URL}/submissions`, formData, {
      headers: { 
        ...headers,
        'Content-Type': formData instanceof FormData ? 'multipart/form-data' : 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al enviar la solicitud.");
  }
};

export const getMySubmissions = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/submissions/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error("Tu sesión ha expirado. Por favor re-inicia sesión para ver tus solicitudes.");
    }
    throw new Error(error.response?.data?.message || "Error al obtener tus solicitudes.");
  }
};

export const getAdminSubmissions = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/submissions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error("Tu sesión administrativa ha expirado. Por favor re-inicia sesión.");
    }
    throw new Error(error.response?.data?.message || "Error al obtener el buzón administrativo.");
  }
};

export const replyToSubmission = async (id, responseData, token) => {
  try {
    const response = await axios.patch(`${API_URL}/submissions/${id}/reply`, responseData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error("Sesión expirada. Por favor re-inicia sesión para responder.");
    }
    throw new Error(error.response?.data?.message || "Error al responder la solicitud.");
  }
};

// --- FUNCIONES DE PLANES Y PRECIOS ---

export const getPlans = async (token) => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.get(`${API_URL}/plans`, { headers });
    return response.data;
  } catch (error) {
    console.error("Error fetching plans:", error);
    return [];
  }
};

export const updatePlan = async (id, data, token) => {
  try {
    const response = await axios.put(`${API_URL}/plans/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error("Tu sesión ha expirado. Por favor, vuelve a iniciar sesión para realizar cambios.");
    }
    throw new Error(error.response?.data?.message || "Error al actualizar el plan.");
  }
};

export const applyCoupon = async (code, token) => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.post(`${API_URL}/coupons/validate`, { code }, { headers });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error("Tu sesión ha expirado o no tienes permisos. Por favor re-inicia sesión.");
    }
    throw new Error(error.response?.data?.message || "Cupón inválido o expirado.");
  }
};

export const getCoupons = async (token, all = true) => {
  try {
    const url = all ? `${API_URL}/coupons?all=true` : `${API_URL}/coupons`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error("Tu sesión ha expirado. Por favor, vuelve a iniciar sesión para ver los cupones.");
    }
    throw new Error(error.response?.data?.message || "Error al obtener cupones.");
  }
};

export const createCoupon = async (data, token) => {
  try {
    const response = await axios.post(`${API_URL}/coupons`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error("Tu sesión ha expirado. Por favor re-inicia sesión para crear cupones.");
    }
    throw new Error(error.response?.data?.message || "Error al crear cupón.");
  }
};

export const updateCoupon = async (id, data, token) => {
  try {
    const response = await axios.patch(`${API_URL}/coupons/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error("Tu sesión ha expirado. Por favor re-inicia sesión para modificar cupones.");
    }
    throw new Error(error.response?.data?.message || "Error al actualizar cupón.");
  }
};

export const deleteCoupon = async (id, token) => {
  try {
    const response = await axios.delete(`${API_URL}/coupons/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error("Tu sesión ha expirado. Por favor re-inicia sesión para eliminar cupones.");
    }
    throw new Error(error.response?.data?.message || "Error al eliminar cupón.");
  }
};

export const getPaymentHistory = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/plans/history`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al obtener historial de pagos.");
  }
};

export const getAdminStats = async (token) => {
  try {
    if (!token) {
      throw new Error('No autenticado');
    }
    const response = await axios.get(`${API_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    const status = error?.response?.status;
    const apiMessage = error?.response?.data?.message;
    const fallbackMessage = error?.message || 'Error desconocido';

    console.error('Error fetching admin stats:', {
      status,
      data: error?.response?.data,
      message: fallbackMessage
    });

    if (status === 401) {
      throw new Error('Tu sesión ha expirado. Por favor re-inicia sesión.');
    }
    if (status === 403) {
      throw new Error('No tenés permisos para ver las estadísticas de admin.');
    }
    if (status >= 500) {
      throw new Error(apiMessage || 'El servidor falló al generar las estadísticas (error 500).');
    }

    throw new Error(apiMessage || 'Error al obtener estadísticas de administración.');
  }
};

// --- FUNCIONES DE AUTENTICACIÓN Y PERFIL ---

export const registerUser = async (name, username, email, password, dni = null) => {
  try {
    const payload = { name, username, email, password };
    if (dni && dni.trim()) payload.dni = dni.trim();
    const response = await axios.post(`${API_URL}/auth/register`, payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al registrarse.");
  }
};

/**
 * Reenvía el código OTP a un usuario no verificado
 * Útil cuando falla el envío inicial del email
 */
export const resendOTP = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/auth/resend-otp`, { email });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 
      "Error al reenviar el código de verificación."
    );
  }
};

export const updateUserProfile = async (data, token) => {
  try {
    const response = await axios.patch(`${API_URL}/users/me`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al actualizar el perfil.");
  }
};

export const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await axios.post(`${API_URL}/auth/refresh-token`, {
      refreshToken,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al refrescar token.");
  }
};

export const loginUser = async (identifier, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      identifier,
      password,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Error al iniciar sesión."
    );
  }
};

export const getMyProfile = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Error al obtener el perfil."
    );
  }
};

// --- ANEXO: GESTIÓN (ABM) ---
// Estas funciones requieren Token de Autenticación

// 1. Gestión de Comercios (OWNER)

export const getMyCommerces = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/commerces/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al obtener mis comercios.");
  }
};

export const createCommerce = async (data, token) => {
  try {
    const response = await axios.post(`${API_URL}/commerces`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al crear comercio.");
  }
};

export const updateCommerce = async (id, data, token) => {
  try {
    const response = await axios.put(`${API_URL}/commerces/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al actualizar comercio.");
  }
};

// Validar comercio (Específico para Admin)
export const validateCommerce = async (id, validationData, token) => {
  try {
    const response = await axios.put(`${API_URL}/commerces/${id}/validate`, validationData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al validar comercio.");
  }
};

export const toggleCommerceStatus = async (id, isActive, token) => {
  try {
    const response = await axios.put(`${API_URL}/commerces/${id}/status`, { isActive }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al actualizar estado del comercio.");
  }
};

// 2. Gestión de Eventos (OWNER / ADMIN)

export const createEvent = async (data, token) => {
  try {
    const response = await axios.post(`${API_URL}/events`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al crear evento.");
  }
};

export const updateEvent = async (id, data, token) => {
  try {
    const response = await axios.put(`${API_URL}/events/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al actualizar evento.");
  }
};

export const approveEvent = async (id, token) => {
  try {
    const response = await axios.patch(`${API_URL}/events/${id}/approve`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al aprobar el evento.");
  }
};

export const rejectEvent = async (id, adminNote, token) => {
  try {
    const response = await axios.patch(`${API_URL}/events/${id}/reject`, { adminNote }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al rechazar el evento.");
  }
};

export const toggleEventStatus = async (id, isActive, token) => {
  try {
    const response = await axios.put(`${API_URL}/events/${id}/status`, { isActive }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al actualizar estado del evento.");
  }
};

export const validateEventPayment = async (id, paymentStatus, adminNote, token) => {
  try {
    const response = await axios.patch(`${API_URL}/events/${id}/validate-payment`, { paymentStatus, adminNote }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al validar el pago del evento.");
  }
};

export const getMyEvents = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/events/my-events`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al obtener tus eventos.");
  }
};

export const getMyAdvertisements = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/advertisements/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al obtener tus publicidades.");
  }
};

// ==================== ADMIN - GESTIÓN DE USUARIOS ====================

export const getAdminUsers = async (token, search = '') => {
  try {
    const url = search ? `${API_URL}/users?search=${encodeURIComponent(search)}` : `${API_URL}/users`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al obtener listado de usuarios.");
  }
};

export const getAdminUserById = async (userId, token) => {
  try {
    const response = await axios.get(`${API_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al obtener datos del usuario.");
  }
};

export const getAdminUserContent = async (userId, token) => {
  try {
    const response = await axios.get(`${API_URL}/users/${userId}/content`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al obtener contenido del usuario.");
  }
};

// 3. Subida de Archivos (General)

export const uploadImage = async (file, token) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    const headers = { 
      'Content-Type': 'multipart/form-data' 
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // El endpoint real es /api/upload/image (API_URL ya incluye /api)
    const response = await axios.post(`${API_URL}/upload/image`, formData, {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Error al subir imagen.");
  }
};

// 4. Panel Admin (ADMIN)

// 5. Favoritos (Usuario)

export const toggleFavorite = async (resourceId, resourceType, token) => {
  try {
    const response = await axios.post(`${API_URL}/favorites/toggle`, { resourceId, resourceType }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al actualizar favoritos.");
  }
};

export const getMyFavorites = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/favorites/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al obtener favoritos.");
  }
};

export const getAdminArticles = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/articles/manage/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error("Error al obtener artículos para admin.");
  }
};

export const createArticle = async (data, token) => {
  try {
    const response = await axios.post(`${API_URL}/articles`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al crear artículo.");
  }
};

export const updateArticle = async (id, data, token) => {
  try {
    const response = await axios.put(`${API_URL}/articles/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al actualizar artículo.");
  }
};

export const toggleArticleStatus = async (id, isActive, token) => {
  try {
    const response = await axios.put(`${API_URL}/articles/${id}/status`, { isActive }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al actualizar estado del artículo.");
  }
};

// ==================== COMMERCE FEEDBACK SYSTEM ====================

// --- COMENTARIOS ---

export const createCommerceComment = async (commerceId, commentData) => {
  try {
    const response = await axios.post(`${API_URL}/feedback/commerces/${commerceId}/comments`, commentData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al crear comentario.");
  }
};

export const getCommerceComments = async (commerceId, token) => {
  try {
    const response = await axios.get(`${API_URL}/feedback/commerces/${commerceId}/comments`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al obtener comentarios.");
  }
};

export const markCommentAsRead = async (commentId, token) => {
  try {
    const response = await axios.patch(`${API_URL}/feedback/comments/${commentId}/read`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al marcar comentario.");
  }
};

export const updateCommentNotes = async (commentId, data, token) => {
  try {
    const response = await axios.patch(`${API_URL}/feedback/comments/${commentId}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al actualizar comentario.");
  }
};

export const deleteCommerceComment = async (commentId, token) => {
  try {
    await axios.delete(`${API_URL}/feedback/comments/${commentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al eliminar comentario.");
  }
};

export const replyToCommerceComment = async (commentId, replyText, token) => {
  try {
    const response = await axios.patch(`${API_URL}/feedback/comments/${commentId}/reply`, 
      { commerceReply: replyText }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al responder el comentario.");
  }
};

// --- ASESORÍAS ---

export const createCommerceAdvisory = async (commerceId, advisoryData, token) => {
  try {
    const response = await axios.post(`${API_URL}/feedback/commerces/${commerceId}/advisories`, advisoryData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al crear asesoría.");
  }
};

export const getCommerceAdvisories = async (commerceId, token) => {
  try {
    const response = await axios.get(`${API_URL}/feedback/commerces/${commerceId}/advisories`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al obtener asesorías.");
  }
};

export const updateAdvisoryStatus = async (advisoryId, status, token) => {
  try {
    const response = await axios.patch(`${API_URL}/feedback/advisories/${advisoryId}/status`, { status }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al actualizar asesoría.");
  }
};

// --- MÉTRICAS ---

export const getCommerceMetrics = async (commerceId, token) => {
  try {
    const response = await axios.get(`${API_URL}/feedback/commerces/${commerceId}/metrics`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al obtener métricas.");
  }
};

// --- FEATURED COMMERCES ---

export const getFeaturedCommerces = async () => {
  try {
    const response = await axios.get(`${API_URL}/feedback/commerces/featured`);
    return response.data;
  } catch (error) {
    console.error("Error fetching featured commerces:", error);
    return [];
  }
};

export const setCommerceFeatured = async (commerceId, days, token) => {
  try {
    const response = await axios.post(`${API_URL}/feedback/commerces/${commerceId}/featured`, { days }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al destacar comercio.");
  }
};

// ==================== SEARCH ANALYTICS ====================

export const logSearch = async (term) => {
  try {
    const response = await axios.post(`${API_URL}/search-analytics/log`, { term });
    return response.data;
  } catch (error) {
    console.warn("Search logging failed", error);
    return null;
  }
};
export const getPublicStats = async () => {
    try {
        console.log("FETCHING STATS FROM:", `${API_URL.replace('/api', '')}/stats-public/stats`);
        const response = await axios.get(`${API_URL.replace('/api', '')}/stats-public/stats`);
        return response.data;
    } catch (error) {
        console.error("DEBUG: Error fetching public stats:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url
        });
        return { articles: 0, events: 0, commerces: 0, plans: 0 };
    }
};

// ==================== FUNCIONES FAQ ====================

export const getCommerceFAQs = async (commerceId) => {
  try {
    const response = await axios.get(`${API_URL}/commerces/${commerceId}/faqs`);
    return response.data;
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return [];
  }
};

export const createCommerceFAQ = async (commerceId, data, token) => {
  try {
    const response = await axios.post(`${API_URL}/commerces/${commerceId}/faqs`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al crear FAQ.");
  }
};

export const updateCommerceFAQ = async (commerceId, faqId, data, token) => {
  try {
    const response = await axios.put(`${API_URL}/commerces/${commerceId}/faqs/${faqId}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al actualizar FAQ.");
  }
};

export const deleteCommerceFAQ = async (commerceId, faqId, token) => {
  try {
    await axios.delete(`${API_URL}/commerces/${commerceId}/faqs/${faqId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al eliminar FAQ.");
  }
};

// ==================== FUNCIONES DE CATÁLOGO / PRODUCTOS ====================

export const getCommerceProducts = async (commerceId) => {
  try {
    const response = await axios.get(`${API_URL}/commerces/${commerceId}/products`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Commerce Products:", error);
    return [];
  }
};

export const createCommerceProduct = async (commerceId, data, token) => {
  try {
    const response = await axios.post(`${API_URL}/commerces/${commerceId}/products`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al crear producto.");
  }
};

export const deleteCommerceProduct = async (commerceId, productId, token) => {
  try {
    await axios.delete(`${API_URL}/commerces/${commerceId}/products/${productId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al eliminar producto.");
  }
};

// ==================== FUNCIONES DE AUDITORÍA ====================

export const getAuditLogs = async (token, page = 1, limit = 20) => {
  try {
    const response = await axios.get(`${API_URL}/audit?page=${page}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al obtener los logs de auditoría.");
  }
};

export const getAuditLogById = async (id, token) => {
  try {
    const response = await axios.get(`${API_URL}/audit/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al obtener el detalle del log.");
  }
};
