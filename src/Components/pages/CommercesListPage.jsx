// src/Components/pages/CommercesListPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getCommerces, getAbsoluteImageUrl } from '../../services/api';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { MapPin, Search } from 'lucide-react';
import './CommercesListPage.css';

const CommercesListPage = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [allCommerces, setAllCommerces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(categoryParam || 'ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');

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
        const data = await getCommerces();
        setAllCommerces(data);
      } catch (error) {
        console.error("Error cargando comercios:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCommerces();
  }, []);

  useEffect(() => {
    if (categoryParam) setActiveCategory(categoryParam);
  }, [categoryParam]);

  const handleImageError = (e) => {
    e.target.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=500&auto=format&fit=crop';
  };

  // Filtrado y ordenamiento client-side
  const filtered = allCommerces
    .filter(c => {
      const matchCat = activeCategory === 'ALL' || c.category === activeCategory ||
        (c.categories && c.categories.some(cat => cat.slug === activeCategory || cat.name === activeCategory));
      const term = searchTerm.toLowerCase();
      const matchSearch = !term ||
        c.name?.toLowerCase().includes(term) ||
        c.description?.toLowerCase().includes(term) ||
        c.shortDescription?.toLowerCase().includes(term) ||
        c.address?.toLowerCase().includes(term);
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'az') return a.name.localeCompare(b.name);
      if (sortBy === 'za') return b.name.localeCompare(a.name);
      if (sortBy === 'plan') return (b.planLevel || 1) - (a.planLevel || 1);
      // recent: por id desc (más nuevo primero)
      return b.id - a.id;
    });

  return (
    <div className="commerces-page-wrapper">
      <Navbar />
      
      <div className="commerces-list-container">
        <header className="commerces-header">
          <h1>Nuestros Locales</h1>
          <p>Explorá las mejores opciones de Salta</p>

          {/* Buscador */}
          <div className="commerces-search-bar">
            <div className="commerces-search-input-wrapper">
              <Search size={16} className="commerces-search-icon" />
              <input
                type="text"
                placeholder="Buscar por nombre, descripción o dirección..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="commerces-search-input"
              />
            </div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="commerces-sort-select"
            >
              <option value="recent">Más recientes</option>
              <option value="az">A → Z</option>
              <option value="za">Z → A</option>
              <option value="plan">Por plan</option>
            </select>
          </div>
          
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
          <>
            {searchTerm && (
              <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} para &ldquo;{searchTerm}&rdquo;
              </p>
            )}
            <div className="unified-commerces-grid">
              {filtered.length > 0 ? (
                filtered.map((commerce) => (
                  <Link to={`/commerce/${commerce.id}`} key={commerce.id} className="commerce-card-link">
                    <div className="commerce-card">
                      <div className="card-image-wrapper">
                        <img 
                          src={commerce.galleryImages?.[0] ? getAbsoluteImageUrl(commerce.galleryImages[0]) : 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=500&auto=format&fit=crop'} 
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
                ))
              ) : (
                <div className="no-results">
                  <p>No se encontraron comercios{searchTerm ? ` para "${searchTerm}"` : ' en esta categoría'}.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CommercesListPage;
