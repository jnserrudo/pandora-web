// src/pages/EventsListPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEvents } from '../../services/api';
import EntityCardSkeleton from '../ui/EntityCardSkeleton';
import EntityMedia from '../motion/EntityMedia';
import Reveal from '../motion/Reveal';
import { MapPin, Star, Zap, Crown, ExternalLink } from 'lucide-react';
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import SEOManager from "../SEO/SEOManager";
import { useToast } from '../../context/ToastContext';
import './EventsListPage.css';

const EventsListPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tierFilter, setTierFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadError, setLoadError] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const data = await getEvents();
        const visible = (data || []).filter((e) =>
          e &&
          e.isActive !== false &&
          (!e.status || e.status === 'SCHEDULED') &&
          e.paymentStatus !== 'REJECTED'
        );
        // Ordenar: Premium (3) > Plus (2) > Básico (1), luego por fecha
        const sorted = [...visible].sort((a, b) => {
          const tierDiff = (b.eventTier || 1) - (a.eventTier || 1);
          if (tierDiff !== 0) return tierDiff;
          return new Date(a.startDate) - new Date(b.startDate);
        });
        setEvents(sorted);
      } catch (error) {
        setLoadError(true);
        showToast("No se pudo cargar la agenda.", 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Apply filters
  const filteredEvents = events.filter(event => {
    const matchesTier = tierFilter === 'ALL' || (event.eventTier || 1) === parseInt(tierFilter);
    const matchesSearch = !searchTerm || 
      (event.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTier && matchesSearch;
  });

  const premiumEvents = filteredEvents.filter(e => (e.eventTier || 1) === 3);
  const plusEvents = filteredEvents.filter(e => (e.eventTier || 1) === 2);
  const basicEvents = filteredEvents.filter(e => (e.eventTier || 1) === 1);

  if (loading) {
    return (
      <div className="events-page-wrapper">
        <Navbar />
        <div className="events-list-container" aria-busy="true" aria-label="Cargando agenda">
          <header className="events-header">
            <h1>Agenda</h1>
            <p>Cargando lo que está por pasar en Salta…</p>
          </header>
          <div className="events-grid">
            <EntityCardSkeleton count={6} />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const renderEventCard = (event, index = 0) => {
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
      <Reveal
        key={event.id}
        as={Link}
        to={`/event/${event.id}`}
        className="event-card-link"
        delay={Math.min(index, 8) * 45}
        variant="up"
      >
        <div className={cardClass}>
          <div className="event-card-image-wrapper">
            <EntityMedia
              className="event-card-image"
              coverImage={event.coverImage}
              images={event.galleryImages}
              alt={event.name}
              intervalMs={3900 + (event.id % 5) * 220}
              fallback="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=500&auto=format&fit=crop"
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
                <Star size={14} fill="var(--tier-premium)" style={{ display: 'inline-block', marginRight: '4px' }} /> DESTACADO
              </span>
            )}
          </div>
          <div className="event-card-content">
            <h3 className="event-card-title">{event.name}</h3>
            <div className="event-card-meta">
              {event.externalLink && (
                <span className="external-link-indicator">
                  <ExternalLink size={12} /> Entradas / más info
                </span>
              )}
            </div>
            <p className="event-card-location">
              <MapPin size={14} className="icon-loc" />
              {event.address || event.commerce?.name || event.organizerName || 'Salta'}
            </p>
          </div>
        </div>
      </Reveal>
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

        {/* Event Filters */}
        <div className="events-filters">
          <div className="filter-group">
            <label htmlFor="tier-filter">Filtrar por nivel:</label>
            <select 
              id="tier-filter"
              value={tierFilter} 
              onChange={(e) => setTierFilter(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">Todos</option>
              <option value="3">Premium</option>
              <option value="2">Plus</option>
              <option value="1">Básico</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="search-filter">Buscar eventos:</label>
            <input
              id="search-filter"
              type="text"
              placeholder="Buscar por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-input"
            />
          </div>
        </div>

        {/* Eventos Premium */}
        {premiumEvents.length > 0 && (
          <section className="events-featured-section">
            <h2 className="events-section-title events-section-title--premium">
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
            <h2
              className="events-section-title events-section-title--plus"
              style={{ marginTop: premiumEvents.length > 0 ? '3rem' : 0 }}
            >
              <Zap size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
              Eventos Plus
            </h2>
            <div className="events-grid events-grid--five">
              {plusEvents.map(renderEventCard)}
            </div>
          </section>
        )}

        {basicEvents.length > 0 && (
          <section>
            {(premiumEvents.length > 0 || plusEvents.length > 0) && (
              <h2 className="events-section-title" style={{ marginTop: '3rem' }}>Otros eventos</h2>
            )}
            <div className="events-grid">
              {basicEvents.map(renderEventCard)}
            </div>
          </section>
        )}

        {filteredEvents.length === 0 && (
          <div className="no-results-message">
            {loadError ? (
              <p>No se pudo cargar la agenda. Probá recargar.</p>
            ) : events.length === 0 ? (
              <>
                <p>No hay eventos programados por el momento.</p>
                <p>Volvé al <Link to="/">inicio</Link> o mirá los <Link to="/commerces">comercios</Link>.</p>
              </>
            ) : (
              <p>No hay eventos con esos filtros. Probá otra búsqueda o nivel.</p>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default EventsListPage;