import React from "react";
import HeroSection from "../Hero/HeroSection";
import Categories from "../Categories/Categories"; // Mantenemos este
import CallToAction from "../CallToAction/CallToAction"; // Añadimos el nuevo
import "./MainContent.css";
import FeaturedCommerces from "../FeaturedCommerces/FeaturedCommerces"; // <-- Nuevo
import Search from "../Search/Search"; // <-- Importa el nuevo componente

const MainContent = () => {
  return (
    // 'app-container' y 'app-layout' ya los teníamos y están bien
    <main className="app-container">
      <div className="app-layout">
        <HeroSection />
        {/* --- AÑADIMOS EL COMPONENTE DE BÚSQUEDA AQUÍ --- */}
        <Search />

        {/* Añadimos un separador visual para dar contexto a las categorías */}
        <div className="section-divider">
          <h2>Descubrí un mundo de posibilidades</h2>
        </div>

        <FeaturedCommerces />

        {/* El CallToAction es el cierre, invitando a la descarga */}
        <CallToAction />
      </div>
    </main>
  );
};

export default MainContent;
