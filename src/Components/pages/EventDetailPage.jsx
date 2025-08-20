// src/pages/EventDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById } from '../../services/api';
import './CommerceDetailPage.css'; // USAMOS LOS MISMOS
import './EventDetailPage.css'; // Crearemos este archivo

const EventDetailPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const data = await getEventById(id);
        setEvent(data);
      } catch (error) {
        console.error("Failed to fetch event details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  if (loading) return <div className="page-loader">Cargando...</div>;
  if (!event) return <div className="page-error-message">Evento no encontrado.</div>;
  
  // Lógica para formatear fechas
  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
    return {
      date: date.toLocaleDateString('es-ES', dateOptions),
      time: date.toLocaleTimeString('es-ES', timeOptions) + ' hs'
    };
  };

  const start = formatDateTime(event.startDate);
  const end = formatDateTime(event.endDate);

  return (
    <div className="detail-page-container">
      <header 
        className="detail-header" 
        style={{ backgroundImage: `url(${event.coverImage})` }}
      >
         {/* --- 3. AÑADIR EL BOTÓN DE VOLVER --- */}
         <button onClick={() => navigate(-1)} className="back-button" aria-label="Volver">
          &larr; {/* Código HTML para una flecha a la izquierda */}
        </button>
        <div className="header-overlay">
          <h1>{event.name}</h1>
        </div>
      </header>

      <main className="detail-content">
        <section className="info-section">
          <h2>Detalles del Evento</h2>
          <div className="info-grid event-meta-grid">
            <div className="info-item">
              <strong>Comienza:</strong> {start.date}<br/>a las {start.time}
            </div>
            <div className="info-item">
              <strong>Finaliza:</strong> {end.date}<br/>a las {end.time}
            </div>
            <div className="info-item">
              <strong>Lugar:</strong> {event.address || event.commerce.name}
            </div>
            <div className="info-item">
              <strong>Organiza:</strong> {event.commerce.name}
            </div>
          </div>
          <p>{event.description}</p>
        </section>
        
        {event.galleryImages && event.galleryImages.length > 0 && (
          <section className="gallery-section">
            <h2>Galería del Evento</h2>
            <div className="gallery-grid">
              {event.galleryImages.map((img, index) => (
                <img key={index} src={img} alt={`${event.name} galeria ${index + 1}`} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default EventDetailPage;