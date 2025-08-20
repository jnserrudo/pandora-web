// src/components/MainContent/MainContent.jsx

import React from "react";
import { Link } from "react-router-dom"; // Importamos Link para la navegación
import HeroSection from "../Hero/HeroSection";
import CallToAction from "../CallToAction/CallToAction";
import FeaturedCommerces from "../FeaturedCommerces/FeaturedCommerces";
import Search from "../Search/Search";
import "./MainContent.css";

const MainContent = () => {
  return (
    <main className="app-container">
      <div className="app-layout">
        <HeroSection />

        <Search />

        <div className="section-divider">
          <h2>Descubrí un mundo de posibilidades</h2>
        </div>

        <FeaturedCommerces />

        {/* --- NUEVA SECCIÓN PARA EVENTOS Y MAGAZINE --- */}
        <section className="featured-links-section">
          {/* Tarjeta para la Agenda de Eventos */}
          <Link to="/events" className="featured-link-card events-card">
            <div className="card-content">
              <h3>Agenda de Eventos</h3>
              <p>No te pierdas de nada. Mirá todos los eventos programados.</p>
              <span>Ver Agenda →</span>
            </div>
          </Link>

          {/* Tarjeta para el Magazine */}
          <Link to="/magazine" className="featured-link-card magazine-card">
            <div className="card-content">
              <h3>Magazine</h3>
              <p>
                Lee las últimas noticias, entrevistas y artículos de la escena
                local.
              </p>
              <span>Leer Ahora →</span>
            </div>
          </Link>
        </section>
        {/* --- FIN DE LA NUEVA SECCIÓN --- */}

        <CallToAction />
      </div>
    </main>
  );
};

export default MainContent;
