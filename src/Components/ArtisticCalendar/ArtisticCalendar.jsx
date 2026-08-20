// src/Components/ArtisticCalendar/ArtisticCalendar.jsx
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Star,
  Zap,
  Crown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Search,
  X,
  MapPin,
  Clock,
} from 'lucide-react';
import { getEvents, getAbsoluteImageUrl } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import './ArtisticCalendar.css';

const TIER_FILTERS = [
  { id: 'ALL', label: 'Todos' },
  { id: '3', label: 'Premium' },
  { id: '2', label: 'Plus' },
  { id: 'FEATURED', label: 'Destacados' },
  { id: '1', label: 'Básicos' },
];

function isPublicEvent(event) {
  if (!event) return false;
  if (event.isActive === false) return false;
  if (event.status && event.status !== 'SCHEDULED') return false;
  if (event.paymentStatus === 'REJECTED') return false;
  return true;
}

function matchesTierFilter(event, tierFilter) {
  const tier = event.eventTier || 1;
  if (tierFilter === 'ALL') return true;
  if (tierFilter === 'FEATURED') return Boolean(event.featured) && tier === 1;
  return tier === parseInt(tierFilter, 10);
}

function matchesSearch(event, term) {
  if (!term) return true;
  const q = term.toLowerCase();
  return (
    (event.name || '').toLowerCase().includes(q) ||
    (event.description || '').toLowerCase().includes(q) ||
    (event.commerce?.name || '').toLowerCase().includes(q) ||
    (event.organizerName || '').toLowerCase().includes(q) ||
    (event.address || '').toLowerCase().includes(q) ||
    (event.commerce?.address || '').toLowerCase().includes(q)
  );
}

function tierBadge(event) {
  const tier = event.eventTier || 1;
  if (tier === 3) return { label: 'Premium', Icon: Crown, cls: 'premium' };
  if (tier === 2) return { label: 'Plus', Icon: Zap, cls: 'plus' };
  if (event.featured) return { label: 'Destacado', Icon: Star, cls: 'featured' };
  return { label: 'Básico', Icon: null, cls: 'basic' };
}

function clampText(text, max = 140) {
  if (!text) return '';
  const clean = String(text).replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).trim()}…`;
}

const ArtisticCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tierFilter, setTierFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewEvent, setPreviewEvent] = useState(null);
  const hoverTimer = useRef(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const allEvents = await getEvents();
        setEvents((allEvents || []).filter(isPublicEvent));
      } catch (error) {
        showToast('No se pudo cargar el calendario de eventos.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    if (!previewEvent) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setPreviewEvent(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [previewEvent]);

  const visibleEvents = useMemo(
    () => events.filter((e) => matchesTierFilter(e, tierFilter) && matchesSearch(e, searchTerm)),
    [events, tierFilter, searchTerm]
  );

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleGoToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  const handleDateClick = (day) => {
    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  };

  const getEventsForDay = useCallback((day, source = visibleEvents) => {
    return source.filter((event) => {
      const eventDate = new Date(event.startDate);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear()
      );
    });
  }, [visibleEvents, currentDate]);

  const openPreview = (event) => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
    setPreviewEvent(event);
  };

  const scheduleHoverPreview = (event) => {
    if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
      hoverTimer.current = setTimeout(() => setPreviewEvent(event), 380);
    }
  };

  const cancelHoverPreview = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  };

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="calendar-day empty" />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents = getEventsForDay(day);
    const hasEvents = dayEvents.length > 0;
    const isSelected =
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth &&
      selectedDate.getFullYear() === currentYear;
    const isToday =
      new Date().getDate() === day &&
      new Date().getMonth() === currentMonth &&
      new Date().getFullYear() === currentYear;

    const hasFeatured = dayEvents.some((e) => e.featured && (e.eventTier || 1) === 1);
    const hasPremium = dayEvents.some((e) => (e.eventTier || 1) === 3);
    const hasPlus = dayEvents.some((e) => (e.eventTier || 1) === 2);

    calendarDays.push(
      <div
        key={day}
        className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${hasEvents ? 'has-events' : ''} ${hasFeatured ? 'has-featured' : ''} ${hasPremium ? 'has-premium' : ''}`}
        onClick={() => handleDateClick(day)}
      >
        <span className="day-number">{day}</span>
        {hasPremium && (
          <span className="tier-star" title="Evento Premium">
            <Crown size={11} style={{ color: '#FFD700' }} />
          </span>
        )}
        {!hasPremium && hasPlus && (
          <span className="tier-star" title="Evento Plus">
            <Zap size={11} style={{ color: '#38bdf8' }} />
          </span>
        )}
        {!hasPremium && !hasPlus && hasFeatured && (
          <span className="featured-star" title="Evento destacado">
            <Star size={12} fill="#FFD700" />
          </span>
        )}
        {hasEvents && (
          <div className="event-indicators">
            {dayEvents.slice(0, 3).map((ev, idx) => {
              const t = ev.eventTier || 1;
              return (
                <span
                  key={idx}
                  className={`event-dot${t === 3 ? ' event-dot--premium' : t === 2 ? ' event-dot--plus' : ev.featured ? ' event-dot--featured' : ''}`}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const selectedDayEvents = visibleEvents
    .filter((event) => {
      const eventDate = new Date(event.startDate);
      return (
        eventDate.getDate() === selectedDate.getDate() &&
        eventDate.getMonth() === selectedDate.getMonth() &&
        eventDate.getFullYear() === selectedDate.getFullYear()
      );
    })
    .sort((a, b) => (b.eventTier || 1) - (a.eventTier || 1));

  const previewBadge = previewEvent ? tierBadge(previewEvent) : null;
  const PreviewBadgeIcon = previewBadge?.Icon;

  return (
    <section className="artistic-calendar-section">
      <div className="calendar-intro">
        <div>
          <h2 className="calendar-section-title">Agenda de Salta</h2>
          <p className="calendar-howto">
            Tocá un día para ver qué hay. Los puntos e iconos indican el tipo de evento.
            Pasá el mouse o tocá una tarjeta para un resumen rápido; entrá al detalle solo si querés más info.
          </p>
        </div>
        <button type="button" className="calendar-today-btn" onClick={handleGoToday}>
          Hoy
        </button>
      </div>

      <div className="calendar-legend" aria-label="Cómo leer el calendario">
        <span className="legend-item">
          <Crown size={14} style={{ color: '#FFD700' }} /> Premium
        </span>
        <span className="legend-item">
          <Zap size={14} style={{ color: '#38bdf8' }} /> Plus
        </span>
        <span className="legend-item">
          <Star size={14} fill="#FFD700" /> Destacado
        </span>
        <span className="legend-item">
          <span className="event-dot legend-dot" /> Básico
        </span>
      </div>

      <div className="calendar-toolbar">
        <div className="calendar-search">
          <Search size={16} />
          <input
            type="search"
            placeholder="Buscar por nombre o lugar…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Buscar eventos en el calendario"
          />
        </div>
        <div className="calendar-tier-filters" role="group" aria-label="Filtrar por nivel">
          {TIER_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`tier-chip ${tierFilter === f.id ? 'is-active' : ''}`}
              onClick={() => setTierFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="calendar-container">
        <div className="calendar-main">
          <div className="calendar-header">
            <button className="nav-btn prev" onClick={handlePrevMonth} aria-label="Mes anterior">
              <ChevronLeft size={18} />
            </button>
            <h2 className="month-year-title">
              {months[currentMonth]} <span className="year">{currentYear}</span>
            </h2>
            <button className="nav-btn next" onClick={handleNextMonth} aria-label="Mes siguiente">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="weekdays-grid">
            {daysOfWeek.map((day) => (
              <div key={day} className="weekday-header">
                {day}
              </div>
            ))}
          </div>

          <div className="days-grid">{calendarDays}</div>
        </div>

        <div className="calendar-details-panel">
          <h3 className="details-date-title">
            {selectedDate.getDate()} de {months[selectedDate.getMonth()]}
          </h3>

          <div className="details-list">
            {loading ? (
              <div className="details-loading">Buscando eventos...</div>
            ) : selectedDayEvents.length > 0 ? (
              selectedDayEvents.map((event) => {
                const tier = event.eventTier || 1;
                const borderColor =
                  tier === 3 ? '#FFD700' : tier === 2 ? '#38bdf8' : event.featured ? '#FFD700' : 'transparent';
                return (
                  <div
                    key={event.id}
                    className="mini-event-card"
                    role="button"
                    tabIndex={0}
                    onClick={() => openPreview(event)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openPreview(event);
                      }
                    }}
                    onMouseEnter={() => scheduleHoverPreview(event)}
                    onMouseLeave={cancelHoverPreview}
                    style={{ borderLeft: `3px solid ${borderColor}` }}
                  >
                    <div className="mini-event-time">
                      {new Date(event.startDate).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    <div className="mini-event-info">
                      <h4>
                        {tier === 3 && (
                          <Crown
                            size={13}
                            style={{ color: '#FFD700', display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}
                          />
                        )}
                        {tier === 2 && (
                          <Zap
                            size={13}
                            style={{ color: '#38bdf8', display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}
                          />
                        )}
                        {tier === 1 && event.featured && (
                          <Star
                            size={13}
                            fill="#FFD700"
                            style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}
                          />
                        )}
                        {event.name}
                      </h4>
                      <p>{event.commerce?.name || event.organizerName || 'Evento especial'}</p>
                    </div>
                    <div className="mini-event-arrow" aria-hidden="true">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-events-placeholder">
                <div className="placeholder-icon">
                  <Calendar size={48} className="opacity-20" />
                </div>
                <p>
                  {searchTerm || tierFilter !== 'ALL'
                    ? 'No hay eventos con ese filtro para este día.'
                    : 'No hay eventos programados para este día.'}
                </p>
                <div className="placeholder-hint">
                  Probá otro día, quitá el filtro o abrí la agenda completa.
                </div>
              </div>
            )}
          </div>

          <button className="view-full-calendar-btn" onClick={() => navigate('/events')}>
            Ver agenda completa
          </button>
        </div>
      </div>

      {previewEvent && (
        <div
          className="event-preview-overlay"
          onClick={() => setPreviewEvent(null)}
          role="presentation"
        >
          <div
            className="event-preview-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-preview-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="event-preview-close"
              onClick={() => setPreviewEvent(null)}
              aria-label="Cerrar vista previa"
            >
              <X size={18} />
            </button>

            {previewEvent.coverImage && (
              <div className="event-preview-cover">
                <img
                  src={getAbsoluteImageUrl(previewEvent.coverImage)}
                  alt=""
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}

            <div className="event-preview-body">
              {previewBadge && (
                <span className={`event-preview-badge ${previewBadge.cls}`}>
                  {PreviewBadgeIcon ? <PreviewBadgeIcon size={12} /> : null}
                  {previewBadge.label}
                </span>
              )}
              <h3 id="event-preview-title">{previewEvent.name}</h3>
              <div className="event-preview-meta">
                <span>
                  <Clock size={14} />
                  {new Date(previewEvent.startDate).toLocaleString('es-AR', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span>
                  <MapPin size={14} />
                  {previewEvent.commerce?.name ||
                    previewEvent.organizerName ||
                    previewEvent.address ||
                    'Salta'}
                </span>
              </div>
              <p className="event-preview-desc">
                {clampText(previewEvent.shortDescription || previewEvent.description, 160) ||
                  'Tocá “Ver más detalle” para conocer la propuesta completa.'}
              </p>
              <div className="event-preview-actions">
                <button type="button" className="btn-preview-secondary" onClick={() => setPreviewEvent(null)}>
                  Seguir explorando
                </button>
                <button
                  type="button"
                  className="btn-preview-primary"
                  onClick={() => navigate(`/event/${previewEvent.id}`)}
                >
                  Ver más detalle
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ArtisticCalendar;
