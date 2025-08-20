// src/pages/AboutPage.jsx

import React, { useEffect } from 'react';
import './AboutPage.css'; // Crearemos este archivo a continuación

const AboutPage = () => {
  // Sube al inicio de la página cada vez que se carga
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="about-container">
      <header className="about-header">
        <h1>Sobre Pandora</h1>
        <p className="lead-paragraph">
          Nacimos de la idea de que cada rincón de la ciudad tiene una historia que contar y una experiencia que ofrecer. Pandora es tu guía personal para descubrir el pulso vibrante de la vida cultural y nocturna.
        </p>
      </header>

      <section className="about-section">
        <h2>¿Qué Ofrecemos?</h2>
        <div className="features-grid">
          <div className="feature-card">
            {/* <div className="feature-icon">🗓️</div> */}
            <h3>Agenda de Eventos Actualizada</h3>
            <p>Desde conciertos íntimos hasta festivales masivos, mantenemos nuestra agenda al día para que nunca te pierdas de nada.</p>
          </div>
          <div className="feature-card">
            {/* <div className="feature-icon">🏪</div> */}
            <h3>Directorio de Comercios</h3>
            <p>Explora los mejores bares, restaurantes y teatros. Conoce su historia, mira sus fotos y encuentra tu próximo lugar favorito.</p>
          </div>
          <div className="feature-card">
            {/* <div className="feature-icon">📰</div> */}
            <h3>Magazine Cultural</h3>
            <p>Sumérgete en artículos, entrevistas y reportajes sobre la escena local, contados por sus protagonistas.</p>
          </div>
        </div>
      </section>

      <section className="about-section">
        <h2>Nuestra Filosofía</h2>
        <p>
          Creemos en el poder de la comunidad y en la importancia de apoyar a los artistas y emprendedores locales. Pandora no es solo una app, es un puente que conecta a la gente con la cultura que los rodea, fomentando un ecosistema creativo más fuerte y unido.
        </p>
      </section>

      <section className="about-section contact-section">
        <h2>Únete a la Comunidad</h2>
        <p>
          ¿Tienes un negocio, organizas un evento o quieres colaborar con nuestro magazine? ¡Nos encantaría saber de ti!
        </p>
        <a href="mailto:contacto@pandora-app.com" className="contact-button">
          Contáctanos
        </a>
      </section>
    </div>
  );
};

export default AboutPage;