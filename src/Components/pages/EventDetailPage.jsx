// src/pages/EventDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Crown, Zap, ExternalLink, ArrowLeft } from 'lucide-react';
import { getEventById, getAbsoluteImageUrl } from '../../services/api';
import MapView from '../ui/MapView';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import EntityMedia from '../motion/EntityMedia';
import Reveal from '../motion/Reveal';
import { useToast } from '../../context/ToastContext';
import './CommerceDetailPage.css'; 
import './EventDetailPage.css';

const EventDetailPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const data = await getEventById(id);
        setEvent(data);
      } catch (error) {
        setLoadError(true);
        showToast("No se pudo cargar el evento.", 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  if (loading) return <LoadingSpinner fullscreen message="Cargando evento..." />;
  if (loadError || !event) {
    return (
      <div className="detail-page-container">
        <Navbar />
        <div className="page-error-message">Evento no encontrado. Volvé a la agenda.</div>
        <Footer />
      </div>
    );
  }
  
  // Lógica para formatear fechas
  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
    return {
      date: date.toLocaleDateString('es-AR', dateOptions),
      time: date.toLocaleTimeString('es-AR', timeOptions) + ' hs'
    };
  };

  const start = formatDateTime(event.startDate);
  const end = formatDateTime(event.endDate);
  const tier = event.eventTier || 1;
  const isPremium = tier === 3;
  const isPlus = tier === 2;
  const organizer = event.commerce?.name || event.organizerName || 'Organizador independiente';
  const organizerCommerceId = event.commerce?.id;

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
      <Navbar />
      <button type="button" onClick={() => navigate(-1)} className="back-button" aria-label="Volver">
        <ArrowLeft size={18} />
      </button>
      <header className="detail-header">
        <EntityMedia
          className="detail-header-media"
          coverImage={event.coverImage}
          images={event.galleryImages}
          alt={event.name}
          intervalMs={5000}
          hoverZoom={false}
        />
        <div className="header-overlay">
          <div className="event-hero-badges">
            {isPremium && (
              <span className="event-tier-badge premium">
                <Crown size={13} /> EVENTO PREMIUM
              </span>
            )}
            {isPlus && (
              <span className="event-tier-badge plus">
                <Zap size={13} /> EVENTO PLUS
              </span>
            )}
          </div>
          <h1 className="event-title">{event.name}</h1>
          {event.description && (
            <p className="event-hero-subtitle">{event.description}</p>
          )}
        </div>
      </header>

      <main className="detail-content">
        <section className="info-section">
          <h2>Detalles del Evento</h2>
          <div className="event-actions-card">
            {event.externalLink && (
              <a
                href={event.externalLink}
                target="_blank"
                rel="noreferrer"
                className={`event-primary-link ${isPremium ? 'premium' : ''}`}
              >
                <ExternalLink size={16} /> Comprar Entradas / Ver más
              </a>
            )}
            {organizerCommerceId && (
              <Link to={`/commerce/${organizerCommerceId}`} className="event-secondary-link">
                Ver comercio organizador
              </Link>
            )}
          </div>
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
              <strong>Organiza:</strong> {organizerCommerceId ? <Link to={`/commerce/${organizerCommerceId}`}>{organizer}</Link> : organizer}
            </div>
          </div>

          {event.latitude && event.longitude && (
            <div className="event-detail-map">
              <h3>Ubicación en el Mapa</h3>
              <MapView latitude={event.latitude} longitude={event.longitude} />
            </div>
          )}

          <div className="event-description-box">
            <h3>Acerca de este evento</h3>
            <p>{event.description}</p>
          </div>

          {/* Video promocional (Solo Premium) */}
          {event.videoUrl && getYouTubeEmbedUrl(event.videoUrl) && (
            <div className="event-video-section">
              <h3 className="event-video-title">
                <Crown size={18} /> Video Promocional
              </h3>
              <div className="event-video-frame">
                <iframe
                  src={getYouTubeEmbedUrl(event.videoUrl)}
                  title="Video del evento"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}
        </section>
        
        {event.galleryImages && event.galleryImages.length > 0 && (
          <Reveal as="section" className="gallery-section" variant="up">
            <h2>Galería del Evento</h2>
            <div className="gallery-grid">
              {event.galleryImages.map((img, index) => (
                <img key={index} src={getAbsoluteImageUrl(img)} alt={`${event.name} galeria ${index + 1}`} />
              ))}
            </div>
          </Reveal>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default EventDetailPage;