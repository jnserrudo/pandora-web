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
        // Ordenamos los eventos por fecha de inicio, del más próximo al más lejano
        data.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        setEvents(data);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleImageError = (e) => {
    e.target.src = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=500&auto=format&fit=crop';
  };

  if (loading) {
    return <LoadingSpinner fullscreen message="Cargando agenda..." />;
  }

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

        <div className="events-grid">
        {events.length > 0 ? (
          events.map(event => {
            // Lógica para formatear la fecha
            const date = new Date(event.startDate);
            const day = date.toLocaleDateString('es-ES', { day: '2-digit' });
            const month = date.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '').toUpperCase();
            
            return (
              <Link to={`/event/${event.id}`} key={event.id} className="event-card-link">
                <div className="event-card">
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
                  </div>
                  <div className="event-card-content">
                    <h3 className="event-card-title">{event.name}</h3>
                    <p className="event-card-location">
                      <MapPin size={14} className="icon-loc" /> {event.address || event.commerce.name}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <p className="no-results-message">No hay eventos programados por el momento. ¡Vuelve pronto!</p>
        )}
      </div>
    </div>
    <Footer />
    <ScrollToTopButton />
    </div>
  );
};

export default EventsListPage;