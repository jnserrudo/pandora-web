// src/Components/FeaturedCommerces/FeaturedCommerces.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { getCommerces, toggleFavorite, getAbsoluteImageUrl } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import "./FeaturedCommerces.css";

const FeaturedCommerces = () => {
  const { token, user } = useAuth();
  const { showToast } = useToast();
  const [commerces, setCommerces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommerces = async () => {
      setLoading(true);
      const data = await getCommerces();
      setCommerces(data);
      setLoading(false);
    };
    fetchCommerces();
  }, [token]);

  const handleFavorite = async (e, commerceId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) {
      showToast("Debes iniciar sesión para guardar favoritos.", 'info');
      return;
    }
    try {
      await toggleFavorite(commerceId, 'commerce', token);
      // Actualizamos UI localmente
      setCommerces(prev => prev.map(c => 
        (c.id === commerceId || c._id === commerceId) 
          ? { ...c, isFavorite: !c.isFavorite } 
          : c
      ));
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  // --- 1. FUNCIÓN HELPER PARA LA LÓGICA DE LA IMAGEN ---
  const getImageUrl = (commerce) => {
    const placeholder = "https://via.placeholder.com/400x250.png?text=Pandora";

    // Prioridad 1: Usar coverImage si es un string válido
    if (commerce.coverImage && commerce.coverImage.trim() !== "") {
      return getAbsoluteImageUrl(commerce.coverImage);
    }
    // Prioridad 2: Usar la primera imagen de la galería si existe
    if (
      commerce.galleryImages &&
      Array.isArray(commerce.galleryImages) &&
      commerce.galleryImages.length > 0
    ) {
      return getAbsoluteImageUrl(commerce.galleryImages[0]);
    }
    // Prioridad 3: Usar el placeholder
    return placeholder;
  };

  if (loading) {
    return <LoadingSpinner message="Cargando comercios destacados..." />;
  }

  return (
    <section className="featured-commerces-section">
      <div className="featured-commerces-grid">
        {commerces.map((commerce) => {
          const imageUrl = getImageUrl(commerce);

          return (
            <Link
              to={`/commerce/${commerce.id}`}
              key={commerce.id}
              className="commerce-card-link"
            >
              <div className="commerce-card">
                <button 
                  className={`favorite-btn-floating ${commerce.isFavorite ? 'active' : ''}`}
                  onClick={(e) => handleFavorite(e, commerce.id || commerce._id)}
                  title="Guardar en favoritos"
                >
                  <Heart size={20} fill={commerce.isFavorite ? "currentColor" : "none"} />
                </button>
                <img
                  src={imageUrl}
                  alt={commerce.name}
                  className="commerce-card-image"
                  // --- 2. EL "SALVAVIDAS": MANEJADOR onError ---
                  // Si la URL falla (ej. 404 de Cloudinary),
                  // este evento se dispara y cambia la fuente al placeholder.
                  onError={(e) => {
                    e.target.onerror = null; // Previene bucles infinitos si el placeholder también falla
                    e.target.src =
                      "https://via.placeholder.com/400x250.png?text=Error";
                  }}
                />
                <div className="commerce-card-overlay">
                  <div className="commerce-card-info">
                    <h4 className="commerce-card-name">{commerce.name}</h4>
                    <span className="commerce-card-category">
                      {commerce.category.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default FeaturedCommerces;
