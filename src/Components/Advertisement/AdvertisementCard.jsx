// src/Components/Advertisement/AdvertisementCard.jsx
import React, { useEffect } from 'react';
import { trackAdvertisement } from '../../services/AdvertisementService';
import './AdvertisementCard.css';

const AdvertisementCard = ({ advertisement }) => {
  useEffect(() => {
    if (advertisement?.id) {
      trackAdvertisement(advertisement.id, 'impression');
    }
  }, [advertisement]);

  if (!advertisement) return null;

  const handleClick = () => {
    if (advertisement.id) {
      trackAdvertisement(advertisement.id, 'click');
    }
    
    if (advertisement.link) {
      if (advertisement.link.startsWith('http')) {
        window.open(advertisement.link, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = advertisement.link;
      }
    }
  };

  return (
    <div 
      className={`advertisement-card ${advertisement.category}-card`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && handleClick()}
    >
      <div className="ad-card-image-container">
        <img 
          src={advertisement.imageUrl} 
          alt={advertisement.title}
          className="ad-card-image"
        />
        <div className="ad-card-image-overlay"></div>
        
        {/* Floating badge */}
        <div className="ad-card-badge">
          {advertisement.category === 'commerce' && '🏪 Comercio'}
          {advertisement.category === 'external' && '📢 Publicidad'}
          {advertisement.category === 'sponsor' && '⭐ Sponsor'}
        </div>
      </div>

      <div className="ad-card-content">
        <h4 className="ad-card-title">{advertisement.title}</h4>
        <p className="ad-card-description">{advertisement.description}</p>
        
        <div className="ad-card-footer">
          <span className="ad-card-cta">Conocer más</span>
          <div className="ad-card-arrow">→</div>
        </div>
      </div>

      {/* Glow effect */}
      <div className="ad-card-glow"></div>
    </div>
  );
};

export default AdvertisementCard;
