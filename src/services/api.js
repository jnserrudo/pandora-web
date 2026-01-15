// src/services/api.js
import axios from "axios";
import { API_URL } from "./config";

// --- FUNCIONES PARA COMERCIOS ---

// Obtiene comercios (opcionalmente filtrados por categoría)
export const getCommerces = async (category) => {
  try {
    let url = `${API_URL}/commerces`;
    if (category) {
      url += `?category=${category}`;
    }
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching commerces:", error);
    return [];
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

// --- FUNCIONES PARA EVENTOS (NUEVAS) ---

// Obtiene todos los eventos publicados
export const getEvents = async () => {
  try {
    const response = await axios.get(`${API_URL}/events`);
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

// --- FUNCIONES DE CONTACTO ---

export const sendContactRequest = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/contact`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al enviar la solicitud de contacto.");
  }
};

// --- FUNCIONES DE AUTENTICACIÓN Y PERFIL ---

export const registerUser = async (name, username, email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      name,
      username,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al registrarse.");
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
