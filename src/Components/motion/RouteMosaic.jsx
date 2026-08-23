import { useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';

const TILES = 12;
const EXIT_MS = 420;

/**
 * Route transition: cover BEFORE paint, then reveal the new page.
 * Prevents the "page shows → then transition" double-load feel.
 */
export default function RouteMosaic() {
  const { pathname } = useLocation();
  const reduced = usePrefersReducedMotion();
  const isFirstNav = useRef(true);
  const [phase, setPhase] = useState('idle'); // idle | cover | exit
  const [key, setKey] = useState(0);

  useLayoutEffect(() => {
    if (reduced) {
      setPhase('idle');
      return undefined;
    }

    // First paint of the app: no wipe
    if (isFirstNav.current) {
      isFirstNav.current = false;
      return undefined;
    }

    setKey((k) => k + 1);
    setPhase('cover');

    let exitTimer;
    let doneTimer;
    // One frame of solid cover, then open tiles
    exitTimer = window.setTimeout(() => setPhase('exit'), 48);
    doneTimer = window.setTimeout(() => setPhase('idle'), 48 + EXIT_MS);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [pathname, reduced]);

  if (reduced || phase === 'idle') return null;

  return (
    <div
      className={`route-mosaic route-mosaic--${phase}`}
      aria-hidden="true"
      key={key}
    >
      {Array.from({ length: TILES }, (_, i) => (
        <span
          key={i}
          className="route-mosaic__tile"
          style={{ '--i': i }}
        />
      ))}
    </div>
  );
}
