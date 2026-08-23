// src/Components/CategoryCircles/CategoryCircles.jsx
import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHomeCategories } from '../../services/api';
import './CategoryCircles.css';

/** Presentación visual por slug (imágenes / títulos partidos). */
const PRESENTATION = {
  VIDA_NOCTURNA: {
    title: 'Vida',
    subtitle: 'Nocturna',
    image:
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=2671&auto=format&fit=crop',
  },
  GASTRONOMIA: {
    title: 'Gastronomía',
    subtitle: '',
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2670&auto=format&fit=crop',
  },
  SALAS_Y_TEATRO: {
    title: 'Salas y',
    subtitle: 'Teatro',
    image:
      'https://images.unsplash.com/photo-1507676184212-d0339efdc80c?q=80&w=2544&auto=format&fit=crop',
  },
};

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1074&auto=format&fit=crop';

const FALLBACK_CATEGORIES = [
  { id: 'vida-nocturna', slug: 'VIDA_NOCTURNA', name: 'Vida Nocturna' },
  { id: 'gastronomia', slug: 'GASTRONOMIA', name: 'Gastronomía' },
  { id: 'salas-teatro', slug: 'SALAS_Y_TEATRO', name: 'Salas y Teatro' },
].map((c) => ({
  ...c,
  dbValue: c.slug,
  ...PRESENTATION[c.slug],
}));

function toCircleItem(cat) {
  const slug = String(cat.slug || '').toUpperCase();
  const presentation = PRESENTATION[slug] || {
    title: cat.name || slug,
    subtitle: '',
    image: FALLBACK_IMAGE,
  };
  return {
    id: cat.id,
    dbValue: slug || cat.slug,
    title: presentation.title,
    subtitle: presentation.subtitle,
    image: presentation.image,
  };
}

const CategoryCircles = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const isPausedRef = useRef(false);
  const touchStartX = useRef(0);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getHomeCategories();
        if (cancelled || !Array.isArray(data) || data.length === 0) return;
        setCategories(data.map(toCircleItem));
      } catch {
        // Keep hardcoded fallback if API fails (ej. schema viejo sin columnas)
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const scrollStep = useCallback(() => {
    if (!containerRef.current || isPausedRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    if (scrollLeft + clientWidth >= scrollWidth - 10) {
      containerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      containerRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(scrollStep, 3000);
    return () => clearInterval(timer);
  }, [scrollStep]);

  const handleCategoryClick = (category) => {
    navigate(`/commerces?category=${category}`);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    isPausedRef.current = true;
  };

  const handleTouchEnd = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40 && containerRef.current) {
      containerRef.current.scrollBy({ left: diff > 0 ? 280 : -280, behavior: 'smooth' });
    }
    setTimeout(() => {
      isPausedRef.current = false;
    }, 2000);
  };

  if (categories.length === 0) return null;

  return (
    <section className="category-circles-section">
      <h2 className="category-circles-title">
        Todo en un solo <span>lugar</span>
      </h2>

      <div
        className="circles-container"
        ref={containerRef}
        onMouseEnter={() => {
          isPausedRef.current = true;
        }}
        onMouseLeave={() => {
          isPausedRef.current = false;
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {categories.map((cat, index) => (
          <div
            key={cat.id}
            className="category-circle-wrapper"
            onClick={() => handleCategoryClick(cat.dbValue)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleCategoryClick(cat.dbValue);
            }}
            role="button"
            tabIndex={0}
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            <div className="category-circle">
              <div className="circle-bg" style={{ backgroundImage: `url(${cat.image})` }} />
              <div className="circle-overlay" />

              <div className="circle-content">
                <h3 className="circle-title">
                  {cat.title}
                  {cat.subtitle && <span className="d-block">{cat.subtitle}</span>}
                </h3>
                <span className="circle-cta">Ver más</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategoryCircles;
