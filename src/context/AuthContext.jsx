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
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));
  const [user, setUser] = useState(null); // Para guardar los datos del perfil
  const [loading, setLoading] = useState(true); // Para el estado de carga inicial

  const fetchUserProfile = async () => {
    if (token) {
      try {
        const profile = await api.getMyProfile(token);
        setUser(profile);
      } catch (error) {
        console.error("Token inválido o expirado.", error);
        // No cerramos sesión inmediatamente aquí, dejamos que el interceptor de API lo maneje
      }
    }
    setLoading(false);
  };

  // useEffect para cargar el perfil del usuario si hay un token al iniciar la app
  useEffect(() => {
    fetchUserProfile();
  }, [token]);

  const refreshProfile = async () => {
    await fetchUserProfile();
  };

  const login = async (identifier, password) => {
    const response = await api.loginUser(identifier, password);
    localStorage.setItem('token', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    setToken(response.accessToken);
    setRefreshToken(response.refreshToken);
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  // Añadimos la función de registro
  const register = async (name, username, email, password) => {
    await api.registerUser(name, username, email, password);
  };

  // Helper para verificar si el usuario es administrador
  const isAdmin = () => {
    return user?.role === 'ADMIN' || user?.role === 'admin';
  };

  const value = {
    isAuthenticated: !!token,
    user,
    token,
    loading,
    login,
    logout,
    register,
    isAdmin, // Exportamos la función helper
    refreshProfile, // Exportamos refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};