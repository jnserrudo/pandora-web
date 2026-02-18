// src/Components/pages/CommercesListPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getCommerces } from '../../services/api';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { MapPin } from 'lucide-react';
import './CommercesListPage.css';

const CommercesListPage = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [commerces, setCommerces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(categoryParam || 'ALL');

  // Mapeo de valores de BD a texto legible
  const categoryNames = {
    'ALL': 'Todos',
    'VIDA_NOCTURNA': 'Vida Nocturna',
    'GASTRONOMIA': 'Gastronomía',
    'SALAS_Y_TEATRO': 'Salas y Teatro'
  };

  useEffect(() => {
    const fetchCommerces = async () => {
      setLoading(true);
      try {
        const catFilter = activeCategory === 'ALL' ? '' : activeCategory;
        const data = await getCommerces(catFilter);
        setCommerces(data);
      } catch (error) {
        console.error("Error cargando comercios:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommerces();
  }, [activeCategory]);

  const handleImageError = (e) => {
    e.target.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=500&auto=format&fit=crop';
  };

  // Actualizar si cambia la URL
  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, [categoryParam]);

  return (
    <div className="commerces-page-wrapper">
      <Navbar />
      
      <div className="commerces-list-container">
        <header className="commerces-header">
          <h1>Nuestros Locales</h1>
          <p>Explorá las mejores opciones de Salta</p>
          
          <div className="category-filters">
            {Object.keys(categoryNames).map(catKey => (
              <button
                key={catKey}
                className={`filter-btn ${activeCategory === catKey ? 'active' : ''}`}
                onClick={() => setActiveCategory(catKey)}
              >
                {categoryNames[catKey]}
              </button>
            ))}
          </div>
        </header>

        {loading ? (
          <div className="loader-container">
             <LoadingSpinner message="Buscando los mejores lugares..." />
          </div>
        ) : (
          <div className="unified-commerces-grid">
            {commerces.length > 0 ? (
              commerces.map((commerce) => {
                return (
                <Link to={`/commerce/${commerce.id}`} key={commerce.id} className="commerce-card-link">
                    <div className="commerce-card">
                      <div className="card-image-wrapper">
                      <img 
                        src={commerce.galleryImages?.[0] || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=500&auto=format&fit=crop'} 
                        alt={commerce.name} 
                        className="commerce-image"
                        onError={handleImageError}
                      />
                      <span className="card-category-badge">
                        {categoryNames[commerce.category] || commerce.category}
                      </span>
                    </div>
                    
                    <div className="card-content">
                      <h3 className="card-title">{commerce.name}</h3>
                      <p className="card-description">
                        {commerce.description?.substring(0, 80)}...
                      </p>
                      <div className="card-footer">
                        <span className="card-location">
                          <MapPin size={14} className="icon-loc" /> 
                          <span>{commerce.address || 'Salta, Capital'}</span>
                        </span>
                      </div>
                    </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="no-results">
                <p>No se encontraron comercios en esta categoría.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CommercesListPage;
