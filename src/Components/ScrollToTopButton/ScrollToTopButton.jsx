// src/Components/ScrollToTopButton/ScrollToTopButton.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './ScrollToTopButton.css';

const HIDDEN_PATHS = ['/login', '/register'];

const ScrollToTopButton = ({ showAfter = 300 }) => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > showAfter) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, [showAfter]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (HIDDEN_PATHS.includes(location.pathname)) return null;

  const isAdmin = location.pathname.startsWith('/admin');
  const label = isAdmin ? 'Arriba' : 'Inicio';

  return (
    <button
      className={`scroll-to-top-btn ${isVisible ? 'visible' : ''}`}
      onClick={scrollToTop}
      aria-label={isAdmin ? 'Volver arriba' : 'Volver al inicio'}
      title={isAdmin ? 'Volver arriba' : 'Volver al inicio'}
    >
      <svg
        className="scroll-icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 15l-6-6-6 6" />
      </svg>
      <span className="scroll-text">{label}</span>
    </button>
  );
};

export default ScrollToTopButton;
