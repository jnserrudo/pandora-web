import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyEvents, getAbsoluteImageUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { 
    Calendar,
    Plus,
    MapPin,
    ExternalLink,
    Settings,
    Clock,
    Zap,
    Crown,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react';
import './MyEventsPage.css';

const MyEventsPage = () => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        setLoading(true);
        const data = await getMyEvents(token);
        setEvents(data);
      } catch (err) {
        console.error("Error fetching my events:", err);
        showToast("No se pudieron cargar tus eventos. Intenta nuevamente.", 'error');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchMyEvents();
    }
  }, [token]);

  const getImageUrl = (event) => {
    if (event.coverImage) return getAbsoluteImageUrl(event.coverImage);
    return "https://placehold.co/400x250/0d0218/ffffff/png?text=Evento"; 
  };

  const getTierBadge = (tier) => {
    switch(tier) {
      case 3:
        return { icon: <Crown size={14} />, label: 'Premium', class: 'premium' };
      case 2:
        return { icon: <Zap size={14} />, label: 'Plus', class: 'plus' };
      default:
        return { icon: null, label: 'Básico', class: 'basic' };
    }
  };

  const getStatusInfo = (status) => {
    switch(status) {
      case 'APPROVED':
        return { icon: <CheckCircle size={16} />, label: 'Aprobado', class: 'approved' };
      case 'PENDING':
        return { icon: <AlertCircle size={16} />, label: 'En Revisión', class: 'pending' };
      case 'REJECTED':
        return { icon: <XCircle size={16} />, label: 'Rechazado', class: 'rejected' };
      case 'SCHEDULED':
        return { icon: <Clock size={16} />, label: 'Programado', class: 'scheduled' };
      case 'CANCELLED':
        return { icon: <XCircle size={16} />, label: 'Cancelado', class: 'cancelled' };
      case 'FINISHED':
        return { icon: <CheckCircle size={16} />, label: 'Finalizado', class: 'finished' };
      default:
        return { icon: <AlertCircle size={16} />, label: status, class: 'default' };
    }
  };

  const getPaymentStatusInfo = (paymentStatus, tier) => {
    if (tier === 1) return null;
    
    switch(paymentStatus) {
      case 'VALIDATED':
        return { icon: <CheckCircle size={14} />, label: 'Pago Validado', class: 'validated' };
      case 'PENDING':
        return { icon: <Clock size={14} />, label: 'Pago Pendiente', class: 'pending' };
      case 'REJECTED':
        return { icon: <XCircle size={14} />, label: 'Pago Rechazado', class: 'rejected' };
      default:
        return { icon: <AlertCircle size={14} />, label: 'Sin Estado', class: 'default' };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <LoadingSpinner message="Cargando tus eventos..." />;

  return (
    <div className="my-events-wrapper hub-theme">
      <Navbar />
      
      <main className="my-events-container">
        <header className="page-neo-header">
          <div className="header-title-neo">
            <div className="title-with-icon">
              <Calendar className="title-icon" />
              <h1>Mis Eventos</h1>
            </div>
            <p>Gestiona todos tus eventos publicados en Pandora</p>
          </div>
          <Link to="/events/create" className="btn-neo-success">
            <Plus size={20} />
            Crear Nuevo Evento
          </Link>
        </header>

        {events.length === 0 ? (
          <div className="empty-state-hub neo-glass-panel">
            <div className="empty-icon-container">
              <Calendar size={48} />
            </div>
            <h3>Aún no tienes eventos</h3>
            <p>Comienza a crear eventos y llega a más personas en Salta.</p>
            <Link to="/events/create" className="btn-neo-primary">
              Crear Mi Primer Evento
            </Link>
          </div>
        ) : (
          <div className="events-neo-grid">
            {events.map(event => {
              const tierBadge = getTierBadge(event.eventTier);
              const statusInfo = getStatusInfo(event.status);
              const paymentInfo = getPaymentStatusInfo(event.paymentStatus, event.eventTier);

              return (
                <div key={event.id} className="neo-manage-card neo-glass-panel">
                  <div className="card-media">
                    <img src={getImageUrl(event)} alt={event.name} />
                    {event.featured && (
                      <div className="featured-badge">
                        <Zap size={14} /> Destacado
                      </div>
                    )}
                    <div className={`tier-badge tier-${tierBadge.class}`}>
                      {tierBadge.icon}
                      {tierBadge.label}
                    </div>
                  </div>
                  
                  <div className="card-body">
                    <div className="card-top-info">
                      <span className={`status-pill ${statusInfo.class}`}>
                        {statusInfo.icon}
                        {statusInfo.label}
                      </span>
                      {paymentInfo && (
                        <span className={`payment-pill ${paymentInfo.class}`}>
                          {paymentInfo.icon}
                          {paymentInfo.label}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="card-name">{event.name}</h3>
                    
                    <div className="event-meta">
                      <div className="meta-item">
                        <Clock size={14} />
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                      <div className="meta-item">
                        <MapPin size={14} />
                        <span>{event.address}</span>
                      </div>
                    </div>

                    {event.organizerName && (
                      <div className="organizer-info">
                        Organizado por: <strong>{event.organizerName}</strong>
                      </div>
                    )}

                    <div className="card-neo-actions">
                      <Link to={`/events/edit/${event.id}`} className="btn-card-neo edit">
                        <Settings size={18} />
                        Editar
                      </Link>
                      <Link to={`/event/${event.id}`} className="btn-card-neo view" title="Ver Público">
                        <ExternalLink size={18} />
                        Ver
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default MyEventsPage;
