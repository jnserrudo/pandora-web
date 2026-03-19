import React from 'react';
import './HeroSection.css';
import { 
  Star, 
  MapPin, 
  Calendar, 
  Sparkles, 
  Smartphone,
  ShieldCheck
} from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="hero-section-container">
      <div className="hero-text">
        <h1>
          La noche salteña, en tu <span className="highlight">bolsillo</span>.
        </h1>
        <p className="subtitle">
          Descubrí, explorá y viví lo mejor de Salta. Pandora es tu guía definitiva para eventos, gastronomía y cultura.
        </p>
      </div>
      
      <div className="hero-image-abstract">
        <div className="abstract-container">
          {/* Elemento 1: Tarjeta Principal de Exploración (Vista previa de local) */}
          <div className="floating-ui-card main-card">
            <div className="card-header-premium">
              <ShieldCheck size={16} className="verified-icon" />
              <div className="header-line-premium"></div>
            </div>
            <div className="card-visual-skeleton">
              <Sparkles size={40} className="skeleton-icon" />
            </div>
            <div className="card-details-premium">
              <div className="detail-row">
                <MapPin size={12} />
                <div className="skeleton-title-premium"></div>
              </div>
              <div className="skeleton-text-premium"></div>
            </div>
          </div>

          {/* Elemento 2: Mini Card de Evento */}
          <div className="floating-ui-card event-mini-card">
            <div className="event-icon-premium">
              <Calendar size={18} />
            </div>
            <div className="event-info-premium">
              <div className="event-line-premium"></div>
              <div className="event-status-premium">PRÓXIMAMENTE</div>
            </div>
          </div>

          {/* Elemento 3: Smartphone Badge (Sustituye al '!') */}
          <div className="floating-ui-badge">
            <div className="badge-pulse"></div>
            <div className="badge-content">
              <Smartphone size={24} />
            </div>
          </div>

          {/* Elemento Decorativo: Estrella Brillante */}
          <div className="decorative-star star-1">
             <Star size={20} fill="currentColor" />
          </div>

          {/* Orbes de luz de fondo */}
          <div className="hero-glow-orb orb-primary"></div>
          <div className="hero-glow-orb orb-secondary"></div>
        </div>
      </div>
    </section>
  );
};


export default HeroSection;