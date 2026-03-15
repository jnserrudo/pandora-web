// src/components/MainContent/MainContent.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import HeroSection from "../Hero/HeroSection";
import CallToAction from "../CallToAction/CallToAction";
import FeaturedCommerces from "../FeaturedCommerces/FeaturedCommerces";
import EnhancedSearch from "../Search/EnhancedSearch";
import CategoryCircles from "../CategoryCircles/CategoryCircles";
import AdvertisementBanner from "../Advertisement/AdvertisementBanner";
import ArtisticCalendar from "../ArtisticCalendar/ArtisticCalendar";
import TrendingMagazine from "../Magazine/TrendingMagazine";
import { getAdvertisements } from "../../services/AdvertisementService";
import { getArticles } from "../../services/api";
import useScrollAnimation from "../../hooks/useScrollAnimation";
import "./MainContent.css";

const MainContent = () => {
  // State for advertisements carousels
  const [commerceAds, setCommerceAds] = useState([]);
  const [currentCommerceAdIndex, setCurrentCommerceAdIndex] = useState(0);
  
  const [otherAds, setOtherAds] = useState([]);
  const [currentOtherAdIndex, setCurrentOtherAdIndex] = useState(0);

  const [trendingArticles, setTrendingArticles] = useState([]);

  // Hooks para animaciones
  const searchAnimation = useScrollAnimation({ animationType: 'fade-in', delay: 100 });
  const commercesAnimation = useScrollAnimation({ animationType: 'zoom-in', delay: 200 });
  const calendarAnimation = useScrollAnimation({ animationType: 'fade-in', delay: 100 });
  const ctaAnimation = useScrollAnimation({ animationType: 'glow', delay: 150 });

  // Load advertisements, articles, etc.
  useEffect(() => {
    const loadContent = async () => {
      try {
        // Ads
        const ads = await getAdvertisements({ position: 'banner_home', isActive: true });
        if (ads.length > 0) {
          setCommerceAds(ads.filter(ad => ad.category === 'commerce'));
          setOtherAds(ads.filter(ad => ad.category !== 'commerce'));
        }

        // Trending Articles (Magazine)
        const articlesData = await getArticles(1, 10, 'recent');
        setTrendingArticles(articlesData.articles || []);
      } catch (error) {
        console.error('Error loading home content:', error);
      }
    };
    loadContent();
  }, []);

  // Timers for Ads
  useEffect(() => {
    if (commerceAds.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentCommerceAdIndex((prevIndex) => (prevIndex + 1) % commerceAds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [commerceAds]);

  useEffect(() => {
    if (otherAds.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentOtherAdIndex((prevIndex) => (prevIndex + 1) % otherAds.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [otherAds]);

  return (
    <main className="app-container hub-layout">
      <div className="app-layout">
        
        {/* PRIORIDAD 1: Categor├¡as y B├║squeda */}
        <div className="top-discovery-section" style={{ paddingTop: '2rem', marginBottom: '4rem' }}>
          <CategoryCircles />
          <div ref={searchAnimation.ref} className={searchAnimation.className} style={{ marginTop: '1rem' }}>
            <EnhancedSearch />
          </div>
        </div>

        {/* Hero Section (Bajado una posici├│n) */}
        <HeroSection />

        <div className="section-divider" style={{ marginTop: '4rem' }}>
          <h2>Recomendado para vos</h2>
        </div>

        <div ref={commercesAnimation.ref} className={commercesAnimation.className}>
          <FeaturedCommerces />
        </div>

        {/* --- NUEVA SECCI├ôN: MAGAZINE LO M├üS VISTO (Seg├║n referencia) --- */}
        <TrendingMagazine articles={trendingArticles} />

        {/* --- CAROUSEL 1: PANDORA COMMERCE ADS --- */}
        {commerceAds.length > 0 && (
          <div style={{ marginTop: '4rem', marginBottom: '4rem' }}>
             <AdvertisementBanner 
                key={commerceAds[currentCommerceAdIndex].id}
                advertisement={commerceAds[currentCommerceAdIndex]} 
                size="large" 
             />
          </div>
        )}

        {/* --- CALENDARIO ART├ìSTICO DE EVENTOS --- */}
        <div ref={calendarAnimation.ref} className={calendarAnimation.className} style={{ marginTop: '4rem', marginBottom: '4rem' }}>
          <div className="section-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
             <h2 style={{ fontSize: '2.5rem', color: '#fff', textTransform: 'uppercase' }}>
               Calendario de <span style={{ color: 'var(--color-accent)' }}>Eventos</span>
             </h2>
             <p style={{ color: 'rgba(255,255,255,0.7)' }}>Planific├í tu pr├│xima salida con nosotros</p>
          </div>
          <ArtisticCalendar />
        </div>

        {/* --- CAROUSEL 2: OTHER ADS --- */}
        {otherAds.length > 0 && (
           <div style={{ marginBottom: '4rem' }}>
              <div className="section-divider" style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.9rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '2px' }}>Espacio Publicitario</span>
              </div>
              <AdvertisementBanner 
                key={otherAds[currentOtherAdIndex].id}
                advertisement={otherAds[currentOtherAdIndex]} 
                size="medium"
              />
           </div>
        )}

        {/* PRIORIDAD FINAL: Descargar la Aplicaci├│n */}
        <div ref={ctaAnimation.ref} className={ctaAnimation.className} style={{ marginBottom: '4rem' }}>
          <CallToAction />
        </div>
      </div>
    </main>
  );
};

export default MainContent;
