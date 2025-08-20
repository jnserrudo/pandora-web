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

// Obtiene todos los artículos publicados
export const getArticles = async () => {
  try {
    const url = `${API_URL}/articles`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching articles:", error);
    return [];
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
    return [];
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
