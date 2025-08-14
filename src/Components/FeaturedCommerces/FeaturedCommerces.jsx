import React, { useState, useEffect } from 'react';
import { getCommerces } from '../../services/api';
import './FeaturedCommerces.css';

const FeaturedCommerces = () => {
  const [commerces, setCommerces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommerces = async () => {
      setLoading(true);
      const data = await getCommerces();
      // Mostramos solo los primeros 3 como destacados
      setCommerces(data.slice(0, 3));
      setLoading(false);
    };
    fetchCommerces();
  }, []);

  if (loading) {
    return <div className="loader">Cargando comercios...</div>;
  }

  return (
    <section className="featured-container">
      {commerces.map((commerce) => (
        <div key={commerce.id} className="commerce-card">
          <img src={commerce.galleryImages[0]} alt={commerce.name} />
          <div className="commerce-info">
            <h4>{commerce.name}</h4>
            <p>{commerce.category.replace('_', ' ')}</p>
          </div>
        </div>
      ))}
    </section>
  );
};

export default FeaturedCommerces;