// src/Components/Advertisement/AdvertisementBanner.jsx
import React, { useEffect } from 'react';
import { trackAdvertisement } from '../../services/AdvertisementService';
import './AdvertisementBanner.css';

const AdvertisementBanner = ({ advertisement, size = 'large' }) => {
  useEffect(() => {
    // Track impression when banner is displayed
    if (advertisement?.id) {
      trackAdvertisement(advertisement.id, 'impression');
    }
  }, [advertisement]);

  if (!advertisement) return null;

  const handleClick = () => {
    if (advertisement.id) {
      trackAdvertisement(advertisement.id, 'click');
    }
    
    // Navigate to link
    if (advertisement.link) {
      if (advertisement.link.startsWith('http')) {
        window.open(advertisement.link, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = advertisement.link;
      }
    }
  };

  const getCategoryBadge = () => {
    const badges = {
      commerce: { text: 'Comercio Pandora', color: 'var(--color-primary)' },
      external: { text: 'Publicidad', color: 'var(--color-secondary)' },
      sponsor: { text: 'Auspicia Pandora', color: 'var(--color-accent)' },
    };
    return badges[advertisement.category] || badges.external;
  };

  const badge = getCategoryBadge();

  return (
    <div 
      className={`advertisement-banner ${size} ${advertisement.category}-ad`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && handleClick()}
    >
      <div className="ad-banner-image-wrapper">
        <img 
          src={advertisement.imageUrl} 
          alt={advertisement.title}
          className="ad-banner-image"
        />
        <div className="ad-banner-overlay"></div>
      </div>
      
      <div className="ad-banner-content">
        <div className="ad-category-badge" style={{ backgroundColor: badge.color }}>
          {badge.text}
        </div>
        <h3 className="ad-banner-title">{advertisement.title}</h3>
        <p className="ad-banner-description">{advertisement.description}</p>
        <div className="ad-banner-cta">
          <span className="ad-cta-text">Ver más</span>
          <svg 
            className="ad-cta-arrow" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
      </div>

      {/* Decorative animated corner */}
      <div className="ad-corner-decoration"></div>
    </div>
  );
};

export default AdvertisementBanner;
