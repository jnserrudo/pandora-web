// src/Components/ScrollToTopButton/ScrollToTopButton.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSmoothScroll } from '../motion/SmoothScrollProvider';
import './ScrollToTopButton.css';

const HIDDEN_PATHS = ['/login', '/register'];

const ScrollToTopButton = ({ showAfter = 300 }) => {
  const location = useLocation();
  const smooth = useSmoothScroll();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > showAfter);
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [showAfter]);

  const scrollToTop = () => {
    if (smooth?.scrollTo) {
      smooth.scrollTo(0, { duration: 1.1 });
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
