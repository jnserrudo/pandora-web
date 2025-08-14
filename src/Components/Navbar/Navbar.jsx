// src/components/Navbar/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); // Opcional: redirige a la home después del logout
  };

  return (
    <header className="navbar-container">
      <nav className="navbar-content">
        <Link to="/" className="navbar-logo">Pandora</Link>
        <div className="navbar-actions">
          {loading ? (
            <div className="loader-sm"></div> /* Un pequeño spinner de carga */
          ) : isAuthenticated ? (
            <>
              <span className="welcome-message">¡Hola, {user?.name}!</span>
              <button onClick={handleLogout} className="logout-button">Cerrar Sesión</button>
            </>
          ) : (
            <>
              <Link to="/login" className="login-button">Ingresar</Link>
              <Link to="/register" className="register-button">Registrarse</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;