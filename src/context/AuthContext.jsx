// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import * as api from '../services/api';

// Creamos el contexto
const AuthContext = createContext(null);

// Hook personalizado para usar el contexto fácilmente en otros componentes
export const useAuth = () => useContext(AuthContext);

// El componente Provider que envolverá nuestra aplicación
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null); // Para guardar los datos del perfil
  const [loading, setLoading] = useState(true); // Para el estado de carga inicial

  // useEffect para cargar el perfil del usuario si hay un token al iniciar la app
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (token) {
        try {
          const profile = await api.getMyProfile(token); // Necesitaremos este método en api.js
          setUser(profile);
        } catch (error) {
          console.error("Token inválido o expirado. Cerrando sesión.", error);
          logout(); // Si el token es inválido, limpiamos todo
        }
      }
      setLoading(false);
    };
    fetchUserProfile();
  }, [token]);

  const login = async (identifier, password) => {
    const response = await api.loginUser(identifier, password);
    localStorage.setItem('token', response.accessToken);
    setToken(response.accessToken); // Esto disparará el useEffect de arriba para cargar el perfil
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Añadimos la función de registro
  const register = async (name, username, email, password) => {
    await api.registerUser(name, username, email, password);
  };

  const value = {
    isAuthenticated: !!token,
    user,
    token,
    loading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};