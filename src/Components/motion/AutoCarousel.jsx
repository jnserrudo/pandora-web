import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';

/**
 * Horizontal auto-scrolling carousel with drag + arrows.
 * Children should be the slide nodes.
 */
export default function AutoCarousel({
  children,
  className = '',
  intervalMs = 4500,
  scrollRatio = 0.55,
  showArrows = true,
  pauseOnHover = true,
}) {
  const trackRef = useRef(null);
  const pausedRef = useRef(false);
  const dragRef = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false });
  const reduced = usePrefersReducedMotion();
  const [canScroll, setCanScroll] = useState(false);

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScroll(el.scrollWidth > el.clientWidth + 8);
  }, []);

  useEffect(() => {
    measure();
    const el = trackRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure, children]);

  const scrollByDir = useCallback(
    (direction) => {
      const el = trackRef.current;
      if (!el) return;
      const amount = el.clientWidth * scrollRatio;
      let next = direction === 'left' ? el.scrollLeft - amount : el.scrollLeft + amount;
      if (direction === 'right' && el.scrollLeft + el.clientWidth >= el.scrollWidth - 12) {
        next = 0;
      }
      if (direction === 'left' && el.scrollLeft <= 12) {
        next = el.scrollWidth;
      }
      el.scrollTo({ left: next, behavior: 'smooth' });
    },
    [scrollRatio]
  );

  useEffect(() => {
    if (reduced || !canScroll) return undefined;
    const id = setInterval(() => {
      if (!pausedRef.current) scrollByDir('right');
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, reduced, canScroll, scrollByDir]);

  const onPointerDown = (e) => {
    const el = trackRef.current;
    if (!el) return;
    dragRef.current = {
      active: true,
      startX: e.clientX,
      scrollLeft: el.scrollLeft,
      moved: false,
    };
    el.setPointerCapture?.(e.pointerId);
    pausedRef.current = true;
  };

  const onPointerMove = (e) => {
    const el = trackRef.current;
    const d = dragRef.current;
    if (!el || !d.active) return;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > 6) d.moved = true;
    el.scrollLeft = d.scrollLeft - dx;
  };

  const endDrag = (e) => {
    const d = dragRef.current;
    if (!d.active) return;
    d.active = false;
    if (e?.pointerId != null) {
      try {
        trackRef.current?.releasePointerCapture?.(e.pointerId);
      } catch {
        /* ignore */
      }
    }
    // Keep paused briefly after drag so click doesn't fight
    setTimeout(() => {
      if (!pauseOnHover) pausedRef.current = false;
    }, 400);
  };

  const onClickCapture = (e) => {
    if (dragRef.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      dragRef.current.moved = false;
    }
  };

  return (
    <div
      className={`auto-carousel ${className}`.trim()}
      onMouseEnter={() => {
        if (pauseOnHover) pausedRef.current = true;
      }}
      onMouseLeave={() => {
        if (pauseOnHover) pausedRef.current = false;
      }}
      onTouchStart={() => {
        pausedRef.current = true;
      }}
      onTouchEnd={() => {
        setTimeout(() => {
          pausedRef.current = false;
        }, 600);
      }}
    >
      {showArrows && canScroll && (
        <button
          type="button"
          className="auto-carousel__nav prev"
          aria-label="Anterior"
          onClick={() => scrollByDir('left')}
        >
          <ChevronLeft size={22} />
        </button>
      )}

      <div
        className="auto-carousel__track"
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
      >
        {children}
      </div>

      {showArrows && canScroll && (
        <button
          type="button"
          className="auto-carousel__nav next"
          aria-label="Siguiente"
          onClick={() => scrollByDir('right')}
        >
          <ChevronRight size={22} />
        </button>
      )}
    </div>
  );
}

AutoCarousel.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  intervalMs: PropTypes.number,
  scrollRatio: PropTypes.number,
  showArrows: PropTypes.bool,
  pauseOnHover: PropTypes.bool,
};
