// src/Components/ArtisticCalendar/ArtisticCalendar.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { getEvents } from '../../services/api';
import './ArtisticCalendar.css';

const ArtisticCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const allEvents = await getEvents();
        setEvents(allEvents);
      } catch (error) {
        console.error("Error fetching events for calendar:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Helper to get days in month
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day) => {
    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  };

  // Check if a specific day has events
  const getEventsForDay = (day) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate); // Asume formato ISO
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  // Generate calendar grid
  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents = getEventsForDay(day);
    const hasEvents = dayEvents.length > 0;
    const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === currentMonth;
    const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth && new Date().getFullYear() === currentYear;

    calendarDays.push(
      <div 
        key={day} 
        className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${hasEvents ? 'has-events' : ''}`}
        onClick={() => handleDateClick(day)}
      >
        <span className="day-number">{day}</span>
        {hasEvents && <div className="event-indicators">
          {dayEvents.slice(0, 3).map((_, idx) => (
            <span key={idx} className="event-dot"></span>
          ))}
        </div>}
      </div>
    );
  }

  // Get selected day events details
  const selectedDayEvents = events.filter(event => {
    const eventDate = new Date(event.startDate);
    return (
      eventDate.getDate() === selectedDate.getDate() &&
      eventDate.getMonth() === selectedDate.getMonth() &&
      eventDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  return (
    <section className="artistic-calendar-section">
      <div className="calendar-container">
        {/* Left Side: Calendar Grid */}
        <div className="calendar-main">
          <div className="calendar-header">
            <button className="nav-btn prev" onClick={handlePrevMonth}>❮</button>
            <h2 className="month-year-title">
              {months[currentMonth]} <span className="year">{currentYear}</span>
            </h2>
            <button className="nav-btn next" onClick={handleNextMonth}>❯</button>
          </div>

          <div className="weekdays-grid">
            {daysOfWeek.map(day => (
              <div key={day} className="weekday-header">{day}</div>
            ))}
          </div>

          <div className="days-grid">
            {calendarDays}
          </div>
        </div>

        {/* Right Side: Event Details */}
        <div className="calendar-details-panel">
          <h3 className="details-date-title">
            {selectedDate.getDate()} de {months[selectedDate.getMonth()]}
          </h3>
          
          <div className="details-list">
            {loading ? (
              <div className="details-loading">Buscando eventos...</div>
            ) : selectedDayEvents.length > 0 ? (
              selectedDayEvents.map(event => (
                <div 
                  key={event.id} 
                  className="mini-event-card"
                  onClick={() => navigate(`/event/${event.id}`)}
                >
                  <div className="mini-event-time">
                    {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="mini-event-info">
                    <h4>{event.name}</h4>
                    <p>{event.commerce?.name || 'Evento Especial'}</p>
                  </div>
                  <div className="mini-event-arrow">→</div>
                </div>
              ))
            ) : (
              <div className="no-events-placeholder">
                <div className="placeholder-icon"><Calendar size={48} className="opacity-20" /></div>
                <p>No hay eventos programados para este día.</p>
                <div className="placeholder-hint">¡Seleccioná otro día para ver la agenda!</div>
              </div>
            )}
          </div>
          
          <button className="view-full-calendar-btn" onClick={() => navigate('/events')}>
            Ver Agenda Completa
          </button>
        </div>
      </div>
    </section>
  );
};

export default ArtisticCalendar;
