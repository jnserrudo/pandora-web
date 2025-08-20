// src/pages/CommerceDetailPage.jsx

import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getCommerceById } from "../../services/api";
import "./CommerceDetailPage.css"; // Crearemos este archivo a continuación

const CommerceDetailPage = () => {
  const { id } = useParams(); // Obtiene el :id de la URL
  const [commerce, setCommerce] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
   // --- 2. OBTENER LA FUNCIÓN navigate ---
   const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0); // Sube al inicio de la página al cargar
    const fetchCommerce = async () => {
      try {
        setLoading(true);
        const data = await getCommerceById(id);
        setCommerce(data);
      } catch (err) {
        setError("No se pudo encontrar el comercio.");
      } finally {
        setLoading(false);
      }
    };
    fetchCommerce();
  }, [id]);

  if (loading) return <div className="page-loader">Cargando...</div>;
  if (error) return <div className="page-error-message">{error}</div>;
  if (!commerce) return null;

  // Lógica para determinar la imagen de portada
  const coverImage =
    commerce.coverImage ||
    (commerce.galleryImages && commerce.galleryImages.length > 0
      ? commerce.galleryImages[0]
      : null);

  return (
    <div className="detail-page-container">
      <header
        className="detail-header"
        style={{ backgroundImage: coverImage ? `url(${coverImage})` : "none" }}
      >
         {/* --- 3. AÑADIR EL BOTÓN DE VOLVER --- */}
         <button onClick={() => navigate(-1)} className="back-button" aria-label="Volver">
          &larr; {/* Código HTML para una flecha a la izquierda */}
        </button>
        <div className="header-overlay">
          <p className="header-category">
            {commerce.category.replace("_", " ")}
          </p>
          <h1>{commerce.name}</h1>
        </div>
      </header>

      <main className="detail-content">
        <section className="info-section">
          <h2>Sobre el Lugar</h2>
          <p>{commerce.description}</p>
          <div className="info-grid">
            <div className="info-item">
              <strong>Ubicación:</strong> {commerce.address}
            </div>
            <div className="info-item">
              <strong>Teléfono:</strong> {commerce.phone || "No especificado"}
            </div>
          </div>
        </section>

        {commerce.galleryImages && commerce.galleryImages.length > 0 && (
          <section className="gallery-section">
            <h2>Galería</h2>
            <div className="gallery-grid">
              {commerce.galleryImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${commerce.name} galeria ${index + 1}`}
                />
              ))}
            </div>
          </section>
        )}

        {commerce.events && commerce.events.length > 0 && (
          <section className="related-events-section">
            <h2>Próximos Eventos en {commerce.name}</h2>
            <div className="events-list">
              {commerce.events.map((event) => {
                const date = new Date(event.startDate);
                const day = date.toLocaleDateString("es-ES", {
                  day: "2-digit",
                });
                const month = date
                  .toLocaleDateString("es-ES", { month: "short" })
                  .replace(".", "")
                  .toUpperCase();
                return (
                  <Link
                    to={`/event/${event.id}`}
                    key={event.id}
                    className="event-item-link"
                  >
                    <div className="event-item">
                      <div className="event-date">
                        <span className="event-day">{day}</span>
                        <span className="event-month">{month}</span>
                      </div>
                      <div className="event-info">
                        <h3 className="event-title">{event.name}</h3>
                        <p className="event-location">
                          {event.address || commerce.name}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default CommerceDetailPage;
