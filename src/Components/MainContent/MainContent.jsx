// src/components/MainContent/MainContent.jsx

import React, { useState, useEffect } from "react";
import HeroSection from "../Hero/HeroSection";
import CallToAction from "../CallToAction/CallToAction";
import FeaturedCommerces from "../FeaturedCommerces/FeaturedCommerces";
import EnhancedSearch from "../Search/EnhancedSearch";
import CategoryCircles from "../CategoryCircles/CategoryCircles";
import AdvertisementBanner from "../Advertisement/AdvertisementBanner";
import ArtisticCalendar from "../ArtisticCalendar/ArtisticCalendar";
import TrendingMagazine from "../Magazine/TrendingMagazine";
import HomeAnchors from "./HomeAnchors";
import { getAdvertisements } from "../../services/AdvertisementService";
import { getArticles } from "../../services/api";
import "./MainContent.css";

const MainContent = () => {
  const [commerceAds, setCommerceAds] = useState([]);
  const [otherAds, setOtherAds] = useState([]);
  const [trendingArticles, setTrendingArticles] = useState([]);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const ads = await getAdvertisements({ position: 'banner_home', isActive: true });
        if (Array.isArray(ads)) {
          setCommerceAds(ads.filter(ad => ad.category === 'commerce'));
          setOtherAds(ads.filter(ad => ad.category !== 'commerce'));
        }

        const articlesData = await getArticles(1, 10, 'recent');
        setTrendingArticles(articlesData.articles || []);
      } catch (error) {
        console.error('Error loading home content:', error);
      }
    };
    loadContent();
  }, []);

  return (
    <main className="app-container hub-layout">
      <div className="app-layout">
        
        {/* ===== 1. CATEGORÍAS (Burbujas en carrusel) ===== */}
        <div className="top-discovery-section" style={{ paddingTop: '1rem' }}>
          <CategoryCircles />
        </div>

        {/* ===== 2. BUSCADOR ===== */}
        <div style={{ marginTop: '0.5rem' }}>
          <EnhancedSearch />
        </div>

        {/* ===== 3. ANCLAS (Noticias/Calendario) + RRSS ===== */}
        <div style={{ marginTop: '1.5rem' }}>
          <HomeAnchors />
        </div>

        {/* ===== 4. DESTACADOS PLATINO (Carrusel Grande) ===== */}
        <div id="featured-platinum" style={{ marginTop: '2rem' }}>
          <FeaturedCommerces 
            title="Sugeridos de Hoy" 
            variant="large" 
            planLevel={4}
          />
        </div>

        {/* ===== 5. MAGAZINE (Lo Más Visto) ===== */}
        <div id="magazine-section" style={{ marginTop: '2rem' }}>
          <TrendingMagazine articles={trendingArticles} />
        </div>

        {/* ===== 6. COMERCIOS ORO (Carrusel Mediano) ===== */}
        <div id="featured-gold" style={{ marginTop: '2rem' }}>
          <FeaturedCommerces 
            title="Comercios Destacados" 
            variant="medium" 
            planLevel={3}
          />
        </div>

        {/* ===== 7. CALENDARIO DE EVENTOS ===== */}
        <div id="calendar-section" style={{ marginTop: '3rem' }}>
          <div className="section-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
             <h2 className="section-title-premium">
               Calendario de <span className="text-accent">Eventos</span>
             </h2>
          </div>
          <ArtisticCalendar />
        </div>

        {/* ===== 8. PUBLICIDADES (Carruseles Nativos) ===== */}
        <div id="publicidades-section" style={{ marginTop: '3rem' }}>
          {commerceAds.length > 0 && (
            <div className="ads-carousel-wrapper">
               <div className="ads-horizontal-scroll">
                 {commerceAds.map(ad => (
                   <div key={ad.id} className="ad-card-carousel-item">
                     <AdvertisementBanner advertisement={ad} size="large" />
                   </div>
                 ))}
               </div>
            </div>
          )}
        </div>

        {/* Guía completa (Opcional, se mantiene por el usuario "no borrar nada") */}
        <div id="all-commerces-section" style={{ marginTop: '4rem', paddingBottom: '2rem' }}>
          <FeaturedCommerces 
            title="Explorá nuestra guía completa" 
            variant="medium" 
          />
        </div>

        {/* Hero Section (Al final como banner) */}
        <div style={{ marginTop: '2rem' }}>
          <HeroSection />
        </div>

        {/* Footer / CTA Final */}
        <div style={{ paddingBottom: '4rem' }}>
          <CallToAction />
        </div>
      </div>
    </main>
  );
};

export default MainContent;
