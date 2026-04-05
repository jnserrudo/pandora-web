// src/pages/EventDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Crown, Zap, ExternalLink } from 'lucide-react';
import { getEventById, getAbsoluteImageUrl } from '../../services/api';
import MapView from '../ui/MapView';
import './CommerceDetailPage.css'; 
import './EventDetailPage.css';

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
  const tier = event.eventTier || 1;
  const isPremium = tier === 3;
  const isPlus = tier === 2;
  const organizer = event.commerce?.name || event.organizerName || 'Organizador independiente';

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    return null;
  };

  return (
    <div className="detail-page-container">
      <header 
        className="detail-header" 
        style={{ backgroundImage: event.coverImage ? `url(${getAbsoluteImageUrl(event.coverImage)})` : 'none' }}
      >
        <button onClick={() => navigate(-1)} className="back-button" aria-label="Volver">
          &larr;
        </button>
        <div className="header-overlay">
          {isPremium && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg,#FFD700,#FFA500)', color: '#000', padding: '4px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              <Crown size={13} /> EVENTO PREMIUM
            </span>
          )}
          {isPlus && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg,#38bdf8,#0ea5e9)', color: '#fff', padding: '4px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              <Zap size={13} /> EVENTO PLUS
            </span>
          )}
          <h1>{event.name}</h1>
          {event.externalLink && (
            <a
              href={event.externalLink}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '1rem', padding: '0.6rem 1.4rem', background: isPremium ? 'linear-gradient(135deg,#FFD700,#FFA500)' : 'linear-gradient(135deg,#38bdf8,#0ea5e9)', color: isPremium ? '#000' : '#fff', borderRadius: '25px', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}
            >
              <ExternalLink size={16} /> Comprar Entradas / Ver más
            </a>
          )}
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
              <strong>Lugar:</strong> {event.location || organizer}
            </div>
            <div className="info-item">
              <strong>Dirección:</strong> {event.address || event.commerce?.address || "Ver mapa"}
            </div>
            <div className="info-item">
              <strong>Organiza:</strong> {organizer}
            </div>
          </div>

          {event.latitude && event.longitude && (
            <div className="event-detail-map" style={{ marginTop: '2rem' }}>
              <h3>Ubicación en el Mapa</h3>
              <MapView latitude={event.latitude} longitude={event.longitude} />
            </div>
          )}

          <div className="event-description-box" style={{ marginTop: '2.5rem' }}>
            <h3>Acerca de este evento</h3>
            <p>{event.description}</p>
          </div>

          {/* Video promocional (Solo Premium) */}
          {event.videoUrl && getYouTubeEmbedUrl(event.videoUrl) && (
            <div style={{ marginTop: '2.5rem' }}>
              <h3 style={{ color: '#FFD700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Crown size={18} /> Video Promocional
              </h3>
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: '16px', overflow: 'hidden', border: '2px solid rgba(255,215,0,0.3)' }}>
                <iframe
                  src={getYouTubeEmbedUrl(event.videoUrl)}
                  title="Video del evento"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}
        </section>
        
        {event.galleryImages && event.galleryImages.length > 0 && (
          <section className="gallery-section">
            <h2>Galería del Evento</h2>
            <div className="gallery-grid">
              {event.galleryImages.map((img, index) => (
                <img key={index} src={getAbsoluteImageUrl(img)} alt={`${event.name} galeria ${index + 1}`} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default EventDetailPage;