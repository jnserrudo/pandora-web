import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const scrollUp = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      const root = document.getElementById('root');
      if (root) root.scrollTop = 0;

      const appWrapper = document.querySelector('.app-wrapper');
      if (appWrapper) appWrapper.scrollTop = 0;
    };

    // Ejecutar inmediatamente
    scrollUp();
    
    // Asegurar el scroll después de que React pinte el DOM (ej: al desmontar spinners)
    const t1 = setTimeout(scrollUp, 50);
    const t2 = setTimeout(scrollUp, 150);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pathname]);

  return null;
};

export default ScrollToTop;
