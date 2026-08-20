// src/components/MainContent/MainContent.jsx

import React, { useState, useEffect } from "react";
import FeaturedCommerces from "../FeaturedCommerces/FeaturedCommerces";
import AdvertisementBanner from "../Advertisement/AdvertisementBanner";
import ArtisticCalendar from "../ArtisticCalendar/ArtisticCalendar";
import TrendingMagazine from "../Magazine/TrendingMagazine";
import { getAdvertisements } from "../../services/AdvertisementService";
import { getArticles } from "../../services/api";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import { useToast } from "../../context/ToastContext";
import "./MainContent.css";

const MainContent = () => {
  const [commerceAds, setCommerceAds] = useState([]);
  const [otherAds, setOtherAds] = useState([]);
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [loadingHome, setLoadingHome] = useState(true);
  const { showToast } = useToast();

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
        showToast("No se pudo cargar parte del inicio. Recargá si falta contenido.", 'error');
      } finally {
        setLoadingHome(false);
      }
    };
    loadContent();
  }, []);

  return (
    <main>
      {loadingHome && <LoadingSpinner message="Cargando el inicio..." />}
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
      </div>
    </main>
  );
};

export default MainContent;

