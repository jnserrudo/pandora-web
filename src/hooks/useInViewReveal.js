import { useEffect, useRef, useState } from 'react';
import usePrefersReducedMotion from './usePrefersReducedMotion';

/**
 * Reveal on scroll. Above-the-fold content appears instantly (no second fade).
 * Only elements entering from below animate.
 */
export default function useInViewReveal({
  threshold = 0.12,
  rootMargin = '0px 0px -8% 0px',
  once = true,
  delay = 0,
} = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [instant, setInstant] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) {
      setVisible(true);
      setInstant(true);
      return undefined;
    }

    const el = ref.current;
    if (!el) return undefined;

    let timer;
    const show = (withAnim) => {
      if (!withAnim) {
        setInstant(true);
        setVisible(true);
        return;
      }
      if (delay > 0) {
        timer = setTimeout(() => setVisible(true), delay);
      } else {
        setVisible(true);
      }
    };

    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    // Already on screen at mount → show immediately (route transition handles the wipe)
    if (rect.top < vh * 0.98 && rect.bottom > 0) {
      show(false);
      if (once) return () => clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          show(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setVisible(false);
          setInstant(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [threshold, rootMargin, once, delay, reduced]);

  return {
    ref,
    visible,
    className: `reveal ${visible ? 'is-visible' : ''} ${instant ? 'reveal--instant' : ''}`.trim(),
  };
}
