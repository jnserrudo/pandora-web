import { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import Lenis from 'lenis';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';

const SmoothScrollContext = createContext(null);

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}

export default function SmoothScrollProvider({ children }) {
  const lenisRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) {
      document.documentElement.classList.remove('lenis');
      return undefined;
    }

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.1,
      allowNestedScroll: true,
      prevent: (node) =>
        Boolean(
          node?.closest?.('[data-lenis-prevent]') ||
          node?.closest?.('.assistant-panel') ||
          node?.closest?.('.assistant-log')
        ),
    });
    lenisRef.current = lenis;
    document.documentElement.classList.add('lenis');

    let frame;
    const raf = (time) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      lenisRef.current = null;
      document.documentElement.classList.remove('lenis');
    };
  }, [reduced]);

  const api = useMemo(
    () => ({
      scrollTo: (target, options) => {
        const lenis = lenisRef.current;
        if (lenis) {
          lenis.scrollTo(target, options);
          return;
        }
        if (typeof target === 'number') {
          window.scrollTo({ top: target, behavior: options?.immediate ? 'auto' : 'smooth' });
        } else if (typeof target === 'string') {
          const el = document.querySelector(target);
          el?.scrollIntoView({ behavior: options?.immediate ? 'auto' : 'smooth' });
        }
      },
      get lenis() {
        return lenisRef.current;
      },
    }),
    []
  );

  return (
    <SmoothScrollContext.Provider value={api}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
