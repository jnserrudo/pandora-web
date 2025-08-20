// src/pages/EventsListPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEvents } from '../../services/api';
import './EventsListPage.css'; // Crearemos este archivo a continuación

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

  if (loading) {
    return <div className="page-loader">Cargando agenda...</div>;
  }

  return (
    <div className="events-list-container">
      <header className="events-list-header">
        <h1>Agenda de Eventos</h1>
        <p>Descubre todo lo que está pasando en la ciudad.</p>
      </header>
      <div className="events-list">
        {events.length > 0 ? (
          events.map(event => {
            // Lógica para formatear la fecha
            const date = new Date(event.startDate);
            const day = date.toLocaleDateString('es-ES', { day: '2-digit' });
            const month = date.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '').toUpperCase();
            
            return (
              <Link to={`/event/${event.id}`} key={event.id} className="event-item-link">
                <div className="event-item">
                  <div className="event-date">
                    <span className="event-day">{day}</span>
                    <span className="event-month">{month}</span>
                  </div>
                  <div className="event-info">
                    <h3 className="event-title">{event.name}</h3>
                    {/* El backend incluye el comercio, así que podemos mostrar su nombre */}
                    <p className="event-location">{event.commerce.name}</p>
                  </div>
                  <div className="event-cover-image">
                    <img src={event.coverImage} alt={event.name} />
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
  );
};

export default EventsListPage;