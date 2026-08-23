import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSmoothScroll } from '../motion/SmoothScrollProvider';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const smooth = useSmoothScroll();

  useEffect(() => {
    const scrollUp = () => {
      if (smooth?.scrollTo) {
        smooth.scrollTo(0, { immediate: true });
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      const root = document.getElementById('root');
      if (root) root.scrollTop = 0;

      const appWrapper = document.querySelector('.app-wrapper');
      if (appWrapper) appWrapper.scrollTop = 0;
    };

    scrollUp();
    const t1 = setTimeout(scrollUp, 50);
    const t2 = setTimeout(scrollUp, 150);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pathname, smooth]);

  return null;
};

export default ScrollToTop;
