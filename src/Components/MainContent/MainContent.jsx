// src/components/MainContent/MainContent.jsx

import React, { useState, useEffect } from "react";
import HeroSection from "../Hero/HeroSection";
import CallToAction from "../CallToAction/CallToAction";
import FeaturedCommerces from "../FeaturedCommerces/FeaturedCommerces";
import AdvertisementBanner from "../Advertisement/AdvertisementBanner";
import ArtisticCalendar from "../ArtisticCalendar/ArtisticCalendar";
import TrendingMagazine from "../Magazine/TrendingMagazine";
import Ambassadors from "../Ambassadors/Ambassadors";
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
    <main>
      <div className="app-layout">
        
        {/* ===== 5. MAGAZINE (Lo Más Visto) ===== */}
        <div id="magazine-section">
          <TrendingMagazine articles={trendingArticles} />
        </div>

        {/* ===== 6. COMERCIOS ORO (Carrusel Mediano) ===== */}
        <div id="featured-gold">
          <FeaturedCommerces 
            title="Comercios destacados" 
            variant="medium" 
            planLevel={3}
          />
        </div>

        {/* ===== 7. CALENDARIO DE EVENTOS ===== */}
        <div id="calendar-section">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
             <h2 className="section-title-premium">
               Calendario de <span className="text-accent">eventos</span>
             </h2>
          </div>
          <ArtisticCalendar />
        </div>

        {/* ===== EMBAJADORES ===== */}
        <div>
          <Ambassadors />
        </div>

        {/* ===== 8. PUBLICIDADES (Carruseles Nativos) ===== */}
        <div id="publicidades-section">
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

        {/* Guía completa */}
        <div id="all-commerces-section">
          <FeaturedCommerces 
            title="Explorá nuestra guía completa" 
            variant="medium" 
          />
        </div>

        {/* Hero Section (Al final como banner) */}
        <div style={{ display: 'none' }}>
          <HeroSection />
        </div>

        {/* Footer / CTA Final */}
        <div>
          <CallToAction />
        </div>
      </div>
    </main>
  );
};

export default MainContent;

