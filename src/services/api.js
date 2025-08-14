// src/services/api.js
import axios from 'axios';
import { API_URL } from './config'; // <-- Importamos la URL correcta


// Función para obtener los comercios
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
    // Devolvemos un array vacío en caso de error para no romper la UI
    return [];
  }
};



// --- NUEVA FUNCIÓN DE BÚSQUEDA ---
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
  


  export const registerUser = async (name, username, email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, { name, username, email, password });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al registrarse.');
    }
  };
  
  export const loginUser = async (identifier, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { identifier, password });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al iniciar sesión.');
    }
  };
  
  export const getMyProfile = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener el perfil.');
    }
  };
// Aquí añadiremos más funciones en el futuro (getEvents, getArticles, etc.)