// src/components/MainContent/MainContent.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Importamos Link para la navegación
import HeroSection from "../Hero/HeroSection";
import CallToAction from "../CallToAction/CallToAction";
import FeaturedCommerces from "../FeaturedCommerces/FeaturedCommerces";
import EnhancedSearch from "../Search/EnhancedSearch";
import CategoryCircles from "../CategoryCircles/CategoryCircles";
import AdvertisementBanner from "../Advertisement/AdvertisementBanner";
import { getAdvertisements } from "../../services/AdvertisementService";
import useScrollAnimation from "../../hooks/useScrollAnimation";
import "./MainContent.css";

const MainContent = () => {
  // State for advertisements
  const [bannerAd, setBannerAd] = useState(null);

  // Hooks para animaciones artísticas de scroll
  const searchAnimation = useScrollAnimation({ animationType: 'fade-in', delay: 100 });
  const dividerAnimation = useScrollAnimation({ animationType: 'slide-up', delay: 150 });
  const adBannerAnimation = useScrollAnimation({ animationType: 'zoom-in', delay: 100 });
  const commercesAnimation = useScrollAnimation({ animationType: 'zoom-in', delay: 200 });
  const eventsCardAnimation = useScrollAnimation({ animationType: 'slide-left', delay: 100 });
  const magazineCardAnimation = useScrollAnimation({ animationType: 'slide-right', delay: 200 });
  const ctaAnimation = useScrollAnimation({ animationType: 'glow', delay: 150 });

  // Load advertisements
  useEffect(() => {
    const loadAds = async () => {
      try {
        const ads = await getAdvertisements({ position: 'banner_home', isActive: true });
        if (ads.length > 0) {
          // Random banner ad
          const randomAd = ads[Math.floor(Math.random() * ads.length)];
          setBannerAd(randomAd);
        }
      } catch (error) {
        console.error('Error loading advertisements:', error);
      }
    };
    loadAds();
  }, []);

  return (
    <main className="app-container">
      <div className="app-layout">
        <HeroSection />

        {/* Sección de Categorías Interactiva (Simil captura) */}
        <div style={{ marginTop: '-50px', position: 'relative', zIndex: 5 }}>
           <CategoryCircles />
        </div>

        <div ref={searchAnimation.ref} className={searchAnimation.className}>
          <EnhancedSearch />
        </div>

        <div ref={dividerAnimation.ref} className={`section-divider ${dividerAnimation.className}`}>
          <h2>Descubrí un mundo de posibilidades</h2>
        </div>

        <div ref={commercesAnimation.ref} className={commercesAnimation.className}>
          <FeaturedCommerces />
        </div>

        {/* --- PUBLICIDAD BANNER --- */}
        {bannerAd && (
          <div ref={adBannerAnimation.ref} className={adBannerAnimation.className} style={{ marginTop: '3rem', marginBottom: '3rem' }}>
            <AdvertisementBanner advertisement={bannerAd} size="large" />
          </div>
        )}

        {/* --- NUEVA SECCIÓN PARA EVENTOS Y MAGAZINE --- */}
        <section className="featured-links-section">
          {/* Tarjeta para la Agenda de Eventos */}
          <Link 
            to="/events" 
            className="featured-link-card events-card"
            ref={eventsCardAnimation.ref}
          >
            <div className={`card-content ${eventsCardAnimation.className}`}>
              <h3>Agenda de Eventos</h3>
              <p>No te pierdas de nada. Mirá todos los eventos programados.</p>
              <span>Ver Agenda →</span>
            </div>
          </Link>

          {/* Tarjeta para el Magazine */}
          <Link 
            to="/magazine" 
            className="featured-link-card magazine-card"
            ref={magazineCardAnimation.ref}
          >
            <div className={`card-content ${magazineCardAnimation.className}`}>
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

        <div ref={ctaAnimation.ref} className={ctaAnimation.className}>
          <CallToAction />
        </div>
      </div>
    </main>
  );
};

export default MainContent;
