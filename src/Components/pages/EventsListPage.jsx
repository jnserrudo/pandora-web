// src/pages/EventsListPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEvents, getAbsoluteImageUrl } from '../../services/api';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import ScrollToTopButton from '../ScrollToTopButton/ScrollToTopButton';
import { MapPin, Star, Zap, Crown } from 'lucide-react';
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import SEOManager from "../SEO/SEOManager";
import './EventsListPage.css';

const EventsListPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const data = await getEvents();
        const visible = data.filter(e => 
          !e.status || e.status === 'APPROVED' || e.status === 'SCHEDULED'
        );
        // Ordenar: Premium (3) > Plus (2) > Básico (1), luego por fecha
        const sorted = [...visible].sort((a, b) => {
          const tierDiff = (b.eventTier || 1) - (a.eventTier || 1);
          if (tierDiff !== 0) return tierDiff;
          return new Date(a.startDate) - new Date(b.startDate);
        });
        setEvents(sorted);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const premiumEvents = events.filter(e => (e.eventTier || 1) === 3);
  const plusEvents = events.filter(e => (e.eventTier || 1) === 2);
  const basicEvents = events.filter(e => (e.eventTier || 1) === 1);

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
    const tier = event.eventTier || 1;
    const isPremium = tier === 3;
    const isPlus = tier === 2;

    let cardClass = 'event-card';
    if (isPremium) cardClass += ' event-card--premium';
    else if (isPlus) cardClass += ' event-card--plus';
    else if (event.featured) cardClass += ' event-card--featured';

    return (
      <Link to={`/event/${event.id}`} key={event.id} className="event-card-link">
        <div className={cardClass}>
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
            {isPremium && (
              <span className="event-tier-badge event-tier-badge--premium">
                <Crown size={12} style={{ display: 'inline', marginRight: '4px' }} /> PREMIUM
              </span>
            )}
            {isPlus && (
              <span className="event-tier-badge event-tier-badge--plus">
                <Zap size={12} style={{ display: 'inline', marginRight: '4px' }} /> PLUS
              </span>
            )}
            {!isPremium && !isPlus && event.featured && (
              <span className="event-featured-badge">
                <Star size={14} fill="#FFD700" style={{ display: 'inline-block', marginRight: '4px' }} /> DESTACADO
              </span>
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

        {/* Eventos Premium */}
        {premiumEvents.length > 0 && (
          <section className="events-featured-section">
            <h2 className="events-section-title" style={{ color: '#FFD700' }}>
              <Crown size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
              Eventos Premium
            </h2>
            <div className="events-grid events-grid--featured">
              {premiumEvents.map(renderEventCard)}
            </div>
          </section>
        )}

        {/* Eventos Plus */}
        {plusEvents.length > 0 && (
          <section className="events-featured-section">
            <h2 className="events-section-title" style={{ color: '#38bdf8', marginTop: premiumEvents.length > 0 ? '3rem' : 0 }}>
              <Zap size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
              Eventos Plus
            </h2>
            <div className="events-grid events-grid--five">
              {plusEvents.map(renderEventCard)}
            </div>
          </section>
        )}

        {/* Todos los Eventos (básicos) */}
        <section>
          {(premiumEvents.length > 0 || plusEvents.length > 0) && (
            <h2 className="events-section-title" style={{ marginTop: '3rem' }}>Todos los Eventos</h2>
          )}
          <div className="events-grid events-grid--five">
            {basicEvents.length > 0 ? (
              basicEvents.map(renderEventCard)
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