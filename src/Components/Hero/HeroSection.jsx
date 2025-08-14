import React from 'react';
import './HeroSection.css'; // Usaremos HeroSection.css
import pandoraMockup from '../../assets/pandora_mockup.png'; // 1. Importa la imagen

const HeroSection = () => {
  return (
    <section className="hero-section-container">
      <div className="hero-text">
        <h1>
          La noche salteña, en tu <span className="highlight">bolsillo</span>.
        </h1>
        <p className="subtitle">
          Descubrí, explorá y viví lo mejor de Salta. Pandora es tu guía definitiva para eventos, gastronomía y cultura. Descargá la app y que empiece la aventura.
        </p>
        <div className="hero-buttons">
          <a href="#download" className="cta-button primary">Descargar App</a>
        </div>
      </div>
      <div className="hero-image">
        {/* 2. Reemplazamos el div del placeholder por un tag <img> real. */}
        {/* Usamos la variable importada en el atributo src. */}
        <img 
          src={pandoraMockup} 
          alt="Aplicación Pandora Salta en un teléfono" 
          className="mockup-image" 
        />
      </div>
    </section>
  );
};


export default HeroSection;