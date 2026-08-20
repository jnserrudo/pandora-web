// src/Components/Advertisement/AdvertisementCard.jsx
import React, { useEffect } from 'react';
import { trackAdvertisement } from '../../services/AdvertisementService';
import { getAbsoluteImageUrl } from '../../services/api';
import { Store, Megaphone, Star, ArrowRight } from 'lucide-react';
import { formatEnumLabel } from '../../utils/enumLabels.js';
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
          src={getAbsoluteImageUrl(advertisement.imageUrl)} 
          alt={advertisement.title}
          className="ad-card-image"
        />
        <div className="ad-card-image-overlay"></div>
        
        {/* Floating badge */}
        <div className="ad-card-badge">
          {['commerce', 'COMMERCE'].includes(advertisement.category) && <><Store size={14} style={{ display: 'inline-block', marginRight: '4px' }} /> Comercio</>}
          {['external', 'EXTERNAL'].includes(advertisement.category) && <><Megaphone size={14} style={{ display: 'inline-block', marginRight: '4px' }} /> Externo</>}
          {['sponsor', 'SPONSOR'].includes(advertisement.category) && <><Star size={14} fill="#FFD700" style={{ display: 'inline-block', marginRight: '4px' }} /> Sponsor</>}
          {!advertisement.category || !['commerce', 'COMMERCE', 'external', 'EXTERNAL', 'sponsor', 'SPONSOR'].includes(advertisement.category)
            ? formatEnumLabel(advertisement.category)
            : null}
        </div>
      </div>

      <div className="ad-card-content">
        <h4 className="ad-card-title">{advertisement.title}</h4>
        <p className="ad-card-description">{advertisement.description}</p>
        
        <div className="ad-card-footer">
          <span className="ad-card-cta">Conocer más</span>
          <div className="ad-card-arrow" aria-hidden="true"><ArrowRight size={16} /></div>
        </div>
      </div>

      {/* Glow effect */}
      <div className="ad-card-glow"></div>
    </div>
  );
};

export default AdvertisementCard;
