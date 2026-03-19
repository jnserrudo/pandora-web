// src/Components/FeaturedCommerces/FeaturedCommerces.jsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { getCommerces, toggleFavorite, getAbsoluteImageUrl } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import "./FeaturedCommerces.css";

const FeaturedCommerces = ({ planLevel = null, title = "", variant = "large" }) => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [commerces, setCommerces] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef(null);
  const autoPlayRef = useRef(null);
  const isPausedRef = useRef(false);

  useEffect(() => {
    const fetchCommerces = async () => {
      setLoading(true);
      try {
        // Ahora filtramos desde el servidor para mayor eficiencia
        const data = await getCommerces({ planLevel });
        if (Array.isArray(data)) {
           // Mantenemos un filtrado preventivo por si el server no lo soporta o para planes específicos
           if (planLevel) {
             setCommerces(data.filter(c => {
               const cLevel = Number(c.planLevel);
               const targetLevel = Number(planLevel);
               return cLevel === targetLevel;
             }));
           } else {
             setCommerces(data);
           }
        }
      } catch (error) {
        console.error("Error fetching commerces:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCommerces();
  }, [token, planLevel]);

  const handleFavorite = async (e, commerceId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) {
      showToast("Debes iniciar sesión para guardar favoritos.", 'info');
      return;
    }
    try {
      await toggleFavorite(commerceId, 'commerce', token);
      setCommerces(prev => prev.map(c => 
        (c.id === commerceId || c._id === commerceId) 
          ? { ...c, isFavorite: !c.isFavorite } 
          : c
      ));
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  const scroll = useCallback((direction) => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth, scrollWidth } = scrollContainerRef.current;
      const scrollAmount = variant === "large" ? clientWidth * 0.8 : clientWidth * 0.6;
      let scrollTo = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      // Volver al inicio si llega al final
      if (direction === 'right' && scrollLeft + clientWidth >= scrollWidth - 10) {
        scrollTo = 0;
      }
      scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  }, [variant]);

  useEffect(() => {
    autoPlayRef.current = setInterval(() => {
      if (!isPausedRef.current) scroll('right');
    }, 4000);
    return () => clearInterval(autoPlayRef.current);
  }, [scroll]);

  const getPlaceholderImage = (category) => {
    return "https://placehold.co/400x250/0d0218/ffffff/png?text=Pandora";
  };

  if (loading) return <LoadingSpinner message="Buscando los mejores lugares..." />;

  return (
    <section className={`featured-commerces-carousel-section ${variant}`}>
      {title && (
        <div className="section-header" style={{ marginBottom: '1.5rem', paddingLeft: '1rem' }}>
           <h2 className="section-title-premium">{title}</h2>
        </div>
      )}

      {commerces.length === 0 ? (
          <div className="featured-empty-diagnostic" style={{ 
              padding: '3rem 1rem', 
              textAlign: 'center', 
              color: 'rgba(255,255,255,0.4)',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '1rem',
              margin: '1rem auto',
              maxWidth: '800px',
              border: '1px solid rgba(255,255,255,0.05)'
          }}>
              <p>No hay locales disponibles actualmente</p>
              <small style={{ opacity: 0.5 }}>{planLevel ? `Plan: ${planLevel}` : 'Todos los planes'}</small>
          </div>
      ) : (
        <div
          className="carousel-wrapper"
          onMouseEnter={() => { isPausedRef.current = true; }}
          onMouseLeave={() => { isPausedRef.current = false; }}
        >
          <button className="carousel-nav-btn prev" onClick={() => scroll('left')}>
            <ChevronLeft size={24} />
          </button>
          
          <div className="commerces-scroll-container" ref={scrollContainerRef}>
            {commerces.map((commerce) => (
              <Link 
                key={commerce.id || commerce._id} 
                to={`/commerce/${commerce.id || commerce._id}`} 
                className="commerce-carousel-card-link"
              >
                <div className="commerce-carousel-card">
                  <img 
                    className="commerce-card-image"
                    src={getAbsoluteImageUrl(commerce.coverImage || (commerce.galleryImages?.[0] || commerce.image))} 
                    alt={commerce.name} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = getPlaceholderImage(commerce.category);
                    }}
                  />
                  
                  <button 
                    className={`favorite-btn-floating ${commerce.isFavorite ? 'active' : ''}`}
                    onClick={(e) => handleFavorite(e, commerce.id || commerce._id)}
                  >
                    <Heart size={18} fill={commerce.isFavorite ? "currentColor" : "none"} />
                  </button>

                  <div className="commerce-card-overlay">
                    <h3 className="commerce-card-name">{commerce.name}</h3>
                    <span className="commerce-card-category">{commerce.category}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <button className="carousel-nav-btn next" onClick={() => scroll('right')}>
            <ChevronRight size={24} />
          </button>
        </div>
      )}
    </section>
  );
};

export default FeaturedCommerces;
