// src/components/MainContent/MainContent.jsx

import React, { useState, useEffect } from "react";
import FeaturedCommerces from "../FeaturedCommerces/FeaturedCommerces";
import AdvertisementBanner from "../Advertisement/AdvertisementBanner";
import ArtisticCalendar from "../ArtisticCalendar/ArtisticCalendar";
import TrendingMagazine from "../Magazine/TrendingMagazine";
import AutoCarousel from "../motion/AutoCarousel";
import Reveal from "../motion/Reveal";
import { getAdvertisements } from "../../services/AdvertisementService";
import { getArticles } from "../../services/api";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import { useToast } from "../../context/ToastContext";
import "./MainContent.css";

const MainContent = () => {
  const [commerceAds, setCommerceAds] = useState([]);
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [loadingHome, setLoadingHome] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const loadContent = async () => {
      try {
        const ads = await getAdvertisements({ position: "banner_home", isActive: true });
        if (Array.isArray(ads)) {
          setCommerceAds(ads.filter((ad) => ad.category === "commerce"));
        }

        const articlesData = await getArticles(1, 10, "recent");
        setTrendingArticles(articlesData.articles || []);
      } catch {
        showToast("No se pudo cargar parte del inicio. Recargá si falta contenido.", "error");
      } finally {
        setLoadingHome(false);
      }
    };
    loadContent();
  }, [showToast]);

  return (
    <main>
      {loadingHome && <LoadingSpinner message="Cargando el inicio..." />}
      <div className="app-layout">
        <div id="magazine-section">
          <TrendingMagazine articles={trendingArticles} />
        </div>

        <div id="featured-gold">
          <FeaturedCommerces title="Comercios destacados" variant="medium" planLevel={3} />
        </div>

        <Reveal id="calendar-section" variant="up">
          <div className="section-header" style={{ textAlign: "center", marginBottom: "var(--space-lg)" }}>
            <h2 className="section-title-premium">
              Calendario de <span className="text-accent">eventos</span>
            </h2>
          </div>
          <ArtisticCalendar />
        </Reveal>

        <div id="publicidades-section">
          {commerceAds.length > 0 && (
            <Reveal className="ads-carousel-wrapper" variant="up">
              <AutoCarousel intervalMs={5000} scrollRatio={0.7}>
                {commerceAds.map((ad) => (
                  <div key={ad.id} className="ad-card-carousel-item">
                    <AdvertisementBanner advertisement={ad} size="large" />
                  </div>
                ))}
              </AutoCarousel>
            </Reveal>
          )}
        </div>

        <div id="all-commerces-section">
          <FeaturedCommerces title="Explorá nuestra guía completa" variant="medium" />
        </div>
      </div>
    </main>
  );
};

export default MainContent;
