// src/Components/FeaturedCommerces/FeaturedCommerces.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCommerces } from "../../services/api";
import "./FeaturedCommerces.css";

const FeaturedCommerces = () => {
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
  }, []);

  // --- 1. FUNCIÓN HELPER PARA LA LÓGICA DE LA IMAGEN ---
  const getImageUrl = (commerce) => {
    const placeholder = "https://via.placeholder.com/400x250.png?text=Pandora";

    // Prioridad 1: Usar coverImage si es un string válido
    if (commerce.coverImage && commerce.coverImage.trim() !== "") {
      return commerce.coverImage;
    }
    // Prioridad 2: Usar la primera imagen de la galería si existe
    if (
      commerce.galleryImages &&
      Array.isArray(commerce.galleryImages) &&
      commerce.galleryImages.length > 0
    ) {
      return commerce.galleryImages[0];
    }
    // Prioridad 3: Usar el placeholder
    return placeholder;
  };

  if (loading) {
    return <div className="loader">Cargando comercios destacados...</div>;
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
