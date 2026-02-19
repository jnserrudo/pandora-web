import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedCommerces, getAbsoluteImageUrl } from '../../services/api';
import { Star, MapPin, ArrowRight } from 'lucide-react';
import './FeaturedCommerces.css';

const FeaturedCommerces = () => {
  const [commerces, setCommerces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await getFeaturedCommerces();
        setCommerces(data);
      } catch (error) {
        console.error("Error loading featured commerces", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  if (loading || commerces.length === 0) return null;

  return (
    <section className="featured-commerces-section">
      <div className="section-header-home">
        <h2 className="section-title">
          <span className="highlight-text">Destacados</span> de la Semana
        </h2>
        <Link to="/commerces" className="view-all-link">
          Ver todos <ArrowRight size={16} />
        </Link>
      </div>

      <div className="featured-grid">
        {commerces.map((commerce) => (
          <Link to={`/commerce/${commerce.id}`} key={commerce.id} className="featured-card-link">
            <div className={`featured-card plan-${commerce.planLevel}`}>
              <div className="card-image-container">
                <img 
                    src={commerce.coverImage ? getAbsoluteImageUrl(commerce.coverImage) : '/placeholder-commerce.jpg'} 
                    alt={commerce.name} 
                    className="card-image"
                />
                <div className="card-overlay">
                    <span className="category-tag">{commerce.category.replace('_', ' ')}</span>
                </div>
                {commerce.averageRating > 0 && (
                    <div className="rating-badge">
                        <Star size={12} fill="#ffd700" stroke="#ffd700" />
                        <span>{commerce.averageRating.toFixed(1)}</span>
                    </div>
                )}
              </div>
              
              <div className="card-content">
                <h3 className="commerce-name">{commerce.name}</h3>
                <p className="commerce-address">
                    <MapPin size={14} />
                    {commerce.address}
                </p>
                <div className="card-footer">
                    <span className="comments-count">
                        {commerce.totalComments || 0} opiniones
                    </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default FeaturedCommerces;
