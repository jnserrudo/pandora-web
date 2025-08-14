import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const navigate = useNavigate();
  
  // 1. Estado para controlar la visibilidad del menú móvil
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false); // Cierra el menú al hacer logout
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="navbar-container">
      <nav className="navbar-content">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>Pandora</Link>

        {/* 2. Menú de escritorio (se oculta en móvil) */}
        <div className="desktop-menu">
          <div className="navbar-actions">
            {loading ? (
              <div className="loader-sm"></div>
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
        </div>

        {/* 3. Botón de Hamburguesa (solo visible en móvil) */}
        <button className="hamburger-button" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <div className={`hamburger-line ${isMenuOpen ? 'line-1-open' : ''}`}></div>
          <div className={`hamburger-line ${isMenuOpen ? 'line-2-open' : ''}`}></div>
          <div className={`hamburger-line ${isMenuOpen ? 'line-3-open' : ''}`}></div>
        </button>

        {/* 4. Menú desplegable móvil */}
        <div className={`mobile-menu ${isMenuOpen ? 'menu-open' : ''}`}>
          {loading ? (
              <div className="loader-sm"></div>
            ) : isAuthenticated ? (
              <>
                <span className="welcome-message-mobile">¡Hola, {user?.name}!</span>
                <button onClick={handleLogout} className="logout-button">Cerrar Sesión</button>
              </>
            ) : (
              <>
                <Link to="/login" className="login-button" onClick={closeMenu}>Ingresar</Link>
                <Link to="/register" className="register-button" onClick={closeMenu}>Registrarse</Link>
              </>
            )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;