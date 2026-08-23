// src/Components/FeaturedCommerces/FeaturedCommerces.jsx

import React, { useState, useEffect } from "react";
import { getCategoryDisplayName } from "../../utils/categoryUtils.js";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { getCommerces, toggleFavorite } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import AutoCarousel from "../motion/AutoCarousel";
import EntityMedia from "../motion/EntityMedia";
import Reveal from "../motion/Reveal";
import "./FeaturedCommerces.css";

const FeaturedCommerces = ({ planLevel = null, title = "", variant = "large" }) => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [commerces, setCommerces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommerces = async () => {
      setLoading(true);
      try {
        const data = await getCommerces({ planLevel });
        if (Array.isArray(data)) {
          if (planLevel) {
            setCommerces(
              data.filter((c) => Number(c.planLevel) === Number(planLevel))
            );
          } else {
            setCommerces(data);
          }
        }
      } catch {
        showToast("No se pudieron cargar los locales destacados.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchCommerces();
  }, [token, planLevel, showToast]);

  const handleFavorite = async (e, commerceId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) {
      showToast("Debes iniciar sesión para guardar favoritos.", "info");
      return;
    }
    try {
      await toggleFavorite(commerceId, "commerce", token);
      setCommerces((prev) =>
        prev.map((c) =>
          c.id === commerceId || c._id === commerceId
            ? { ...c, isFavorite: !c.isFavorite }
            : c
        )
      );
      showToast("Favoritos actualizados.", "success");
    } catch (err) {
      showToast(err.message || "No se pudo actualizar el favorito.", "error");
    }
  };

  if (loading) return <LoadingSpinner message="Buscando los mejores lugares..." />;

  return (
    <Reveal
      as="section"
      className={`featured-commerces-carousel-section ${variant}`}
      variant="up"
    >
      {title && (
        <div className="section-header" style={{ marginBottom: "1.5rem", paddingLeft: "1rem" }}>
          <h2 className="section-title-premium">{title}</h2>
        </div>
      )}

      {commerces.length === 0 ? (
        <div className="featured-empty-diagnostic">
          <p>Todavía no hay locales destacados en este bloque.</p>
          <small>
            <Link to="/commerces">Ver todos los comercios</Link>
          </small>
        </div>
      ) : (
        <AutoCarousel
          className="carousel-wrapper"
          intervalMs={4000}
          scrollRatio={variant === "large" ? 0.75 : 0.55}
        >
          {commerces.map((commerce) => {
            const id = commerce.id || commerce._id;
            return (
              <Link
                key={id}
                to={`/commerce/${id}`}
                className="commerce-carousel-card-link"
              >
                <div className="commerce-carousel-card">
                  <EntityMedia
                    className="commerce-card-image"
                    coverImage={commerce.coverImage || commerce.image}
                    images={commerce.galleryImages}
                    alt={commerce.name}
                    intervalMs={3600 + (Number(id) % 7) * 180}
                  />

                  <button
                    type="button"
                    className={`favorite-btn-floating ${commerce.isFavorite ? "active" : ""}`}
                    onClick={(e) => handleFavorite(e, id)}
                    aria-label="Favorito"
                  >
                    <Heart size={18} fill={commerce.isFavorite ? "currentColor" : "none"} />
                  </button>

                  <div className="commerce-card-overlay">
                    <h3 className="commerce-card-name">{commerce.name}</h3>
                    <span className="commerce-card-category">
                      {getCategoryDisplayName(commerce.category)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </AutoCarousel>
      )}
    </Reveal>
  );
};

export default FeaturedCommerces;
