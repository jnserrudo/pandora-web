import React from 'react';
import './Hero.css';
// import phoneMockup from '../../assets/phone-mockup.png'; // En el futuro, pondremos una imagen aquí

const Hero = () => {
  return (
    <section className="hero-container">
      <div className="hero-text">
        <h1>
          La noche salteña, en tu <span className="highlight">bolsillo</span>.
        </h1>
        <p className="subtitle">
          Descubrí, explorá y viví lo mejor de Salta. Pandora es tu guía definitiva para eventos, gastronomía y cultura. Descargá la app y que empiece la aventura.
        </p>
        <div className="hero-buttons">
          <a href="#download" className="cta-button primary">Descargar App</a>
          <a href="#features" className="cta-button secondary">Ver Características</a>
        </div>
      </div>
      <div className="hero-image">
        {/* Aquí iría un mockup del teléfono con la app corriendo */}
        {/* <img src={phoneMockup} alt="App Pandora en un teléfono" /> */}
        <div className="image-placeholder"></div>
      </div>
    </section>
  );
};

export default Hero;