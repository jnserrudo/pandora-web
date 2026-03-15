// src/Components/CategoryCircles/CategoryCircles.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CategoryCircles.css';

const CategoryCircles = () => {
  const navigate = useNavigate();

  const categories = [
    {
      id: 'vida-nocturna',
      title: 'Vida',
      subtitle: 'Nocturna',
      dbValue: 'VIDA_NOCTURNA',
      image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=2671&auto=format&fit=crop', // Concierto/Boliche
    },
    {
      id: 'gastronomia',
      title: 'Gastronom├¡a',
      subtitle: '',
      dbValue: 'GASTRONOMIA',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2670&auto=format&fit=crop', // Restaurant elegante
    },
    {
      id: 'salas-teatro',
      title: 'Salas y',
      subtitle: 'Teatro',
      dbValue: 'SALAS_Y_TEATRO',
      image: 'https://images.unsplash.com/photo-1507676184212-d0339efdc80c?q=80&w=2544&auto=format&fit=crop', // Teatro/Butacas
    }
  ];

  const handleCategoryClick = (category) => {
    // Navegar a la lista de comercios filtrada por esa categor├¡a
    navigate(`/commerces?category=${category}`);
  };

  return (
    <section className="category-circles-section">
      <h2 className="category-circles-title">
        Todo en un solo <span>lugar</span>
      </h2>
      
      <div className="circles-container">
        {categories.map((cat, index) => (
          <div 
            key={cat.id} 
            className="category-circle-wrapper"
            onClick={() => handleCategoryClick(cat.dbValue)}
            role="button"
            tabIndex={0}
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            <div className="category-circle">
              <div 
                className="circle-bg" 
                style={{ backgroundImage: `url(${cat.image})` }} 
              />
              <div className="circle-overlay" />
              
              <div className="circle-content">
                <h3 className="circle-title">
                  {cat.title}
                  {cat.subtitle && <span className="d-block">{cat.subtitle}</span>}
                </h3>
                <span className="circle-cta">Ver m├ís</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategoryCircles;
