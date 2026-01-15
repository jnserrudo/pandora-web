// src/hooks/useScrollAnimation.js
import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook para animaciones artísticas al hacer scroll
 * @param {Object} options - Opciones de configuración
 * @param {number} options.threshold - Porcentaje de visibilidad para activar (0-1)
 * @param {string} options.animationType - Tipo de animación ('fade-in', 'slide-up', 'slide-left', 'slide-right', 'zoom-in', 'rotate-in')
 * @param {number} options.delay - Retraso en ms antes de activar la animación
 * @returns {Object} - Ref para el elemento y estado de visibilidad
 */
const useScrollAnimation = (options = {}) => {
  const {
    threshold = 0.2,
    animationType = 'fade-in',
    delay = 0,
    once = true, // Si la animación solo debe ejecutarse una vez
  } = options;

  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Si ya animó y solo debe animar una vez, no hacer nada
    if (once && hasAnimated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => {
              setIsVisible(true);
              if (once) setHasAnimated(true);
            }, delay);
          } else {
            setIsVisible(true);
            if (once) setHasAnimated(true);
          }
        } else if (!once) {
          // Si no es "once", resetear cuando sale de la vista
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px', // Trigger un poco antes de llegar al viewport
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, delay, once, hasAnimated]);

  return {
    ref: elementRef,
    isVisible,
    className: `scroll-animate ${animationType} ${isVisible ? 'animated' : ''}`,
  };
};

export default useScrollAnimation;
