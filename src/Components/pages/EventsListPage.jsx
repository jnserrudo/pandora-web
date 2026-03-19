// src/pages/EventsListPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEvents, getAbsoluteImageUrl } from '../../services/api';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import ScrollToTopButton from '../ScrollToTopButton/ScrollToTopButton';
import { MapPin, Calendar, Clock } from 'lucide-react';
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import SEOManager from "../SEO/SEOManager";
import './EventsListPage.css';

const EventsListPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0); // Sube al inicio de la página al cargar
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const data = await getEvents();
        // Solo mostrar eventos aprobados/programados al público
        const visible = data.filter(e => 
          !e.status || e.status === 'APPROVED' || e.status === 'SCHEDULED'
        );
        const sorted = [...visible].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        setEvents(sorted);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const featuredEvents = events.filter(e => e.featured);
  const regularEvents = events.filter(e => !e.featured);

  const handleImageError = (e) => {
    e.target.src = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=500&auto=format&fit=crop';
  };

  if (loading) {
    return <LoadingSpinner fullscreen message="Cargando agenda..." />;
  }

  const renderEventCard = (event) => {
    const date = new Date(event.startDate);
    const day = date.toLocaleDateString('es-ES', { day: '2-digit' });
    const month = date.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '').toUpperCase();
    return (
      <Link to={`/event/${event.id}`} key={event.id} className="event-card-link">
        <div className={`event-card${event.featured ? ' event-card--featured' : ''}`}>
          <div className="event-card-image-wrapper">
            <img
              src={event.coverImage ? getAbsoluteImageUrl(event.coverImage) : 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=500&auto=format&fit=crop'}
              alt={event.name}
              className="event-card-image"
              onError={handleImageError}
            />
            <div className="event-card-date-badge">
              <span className="event-card-day">{day}</span>
              <span className="event-card-month">{month}</span>
            </div>
            {event.featured && (
              <span className="event-featured-badge">⭐ DESTACADO</span>
            )}
          </div>
          <div className="event-card-content">
            <h3 className="event-card-title">{event.name}</h3>
            <p className="event-card-location">
              <MapPin size={14} className="icon-loc" />
              {event.address || event.commerce?.name || event.organizerName || 'Salta'}
            </p>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="events-page-wrapper">
      <SEOManager
        title="Próximos Eventos"
        description="No te pierdas de nada. Consultá la agenda de eventos de Pandora."
      />
      <Navbar />
      <div className="events-list-container">
        <header className="events-list-header">
          <h1>Agenda de Eventos</h1>
          <p>Descubre todo lo que está pasando en la ciudad.</p>
        </header>

        {/* Sección Eventos Destacados */}
        {featuredEvents.length > 0 && (
          <section className="events-featured-section">
            <h2 className="events-section-title">⭐ Eventos Destacados</h2>
            <div className="events-grid events-grid--featured">
              {featuredEvents.map(renderEventCard)}
            </div>
          </section>
        )}

        {/* Todos los Eventos */}
        <section>
          {featuredEvents.length > 0 && (
            <h2 className="events-section-title" style={{ marginTop: '3rem' }}>Todos los Eventos</h2>
          )}
          <div className="events-grid events-grid--five">
            {regularEvents.length > 0 ? (
              regularEvents.map(renderEventCard)
            ) : (
              events.length === 0 && (
                <p className="no-results-message">No hay eventos programados por el momento. ¡Volvé pronto!</p>
              )
            )}
          </div>
        </section>
      </div>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default EventsListPage;