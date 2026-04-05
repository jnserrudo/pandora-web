import React from 'react';
import Navbar from '../Navbar/Navbar';
import CategoryCircles from '../CategoryCircles/CategoryCircles';
import EnhancedSearch from '../Search/EnhancedSearch';
import HomeAnchors from '../MainContent/HomeAnchors';
import MainContent from '../MainContent/MainContent';
import Footer from '../Footer/Footer';
import '../../App.css';
import '../MainContent/MainContent.css'; // Aseguramos que la clase app-container exista

function HomePage() {
  return (
    <div className="app-wrapper hub-layout">
      
      {/* 
        ========================================================================
        PRIMER VIEWPORT DEDICADO: Header + Centro + Redes (100dvh)
        ======================================================================== 
      */}
      <section 
        className="initial-viewport"
        style={{
          minHeight: '100dvh', /* Enfoque moderno con viewport units (dynamic) */
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box'
        }}
      >
        <Navbar />

        {/* 
           Utilizamos el `.app-container` existente para que respete 
           el padding top el cual empuja el contiendo abajo del Navbar Fijo.
           Aplicamos flex: 1 para ocupar toda la altura que resta.
        */}
        <div className="app-container" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="app-layout" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', paddingBottom: '1.5rem' }}>
            
            {/* Sección Media (Círculos y Buscador) centrada verticalmente */}
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="top-discovery-section">
                <CategoryCircles />
              </div>
              <EnhancedSearch />
            </div>

            {/* Fila Inferior (Íconos): El margin-top auto la empuja hasta el borde inferior */}
            <div style={{ marginTop: 'auto' }}>
              <HomeAnchors />
            </div>

          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        CONTENIDO POSTERIOR: Lo Más Visto y Resto (Requiere Scroll)
        ======================================================================== 
      */}
      <MainContent />
      
      <Footer />
    </div>
  );
}

export default HomePage;