// src/Components/pages/AdminEventsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Eye,
  Trash2,
  Clock,
  MapPin
} from 'lucide-react';
import { getEvents } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import './AdminArticlesPage.css';

const AdminEventsPage = () => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getEvents();
      setEvents(data);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Error cargando listado de eventos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [token]);

  const handleToggleEvent = async (id, currentStatus) => {
    // if (!window.confirm(`¿Seguro que deseas ${currentStatus ? 'desactivar' : 'reactivar'} este evento?`)) return;
    try {
      // Usamos la nueva función del service
      // await toggleEventStatus(id, !currentStatus, token);
      
      setEvents(prev => prev.map(e => 
        e.id === id ? { ...e, isActive: !currentStatus } : e
      ));
      showToast("Agenda actualizada correctamente.", 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="admin-wrapper hub-theme">
      <Navbar />
      <div className="admin-container">
        <header className="admin-header-premium">
          <div className="admin-title-group">
            <Link to="/admin/dashboard" className="back-link">
              <ChevronLeft size={20} />
              <span>Volver al Panel</span>
            </Link>
            <h1>Agenda de Eventos</h1>
          </div>
          <Link to="/events/create" className="btn-create-premium">
            <Plus size={20} />
            <span>Crear Evento</span>
          </Link>
        </header>

        {loading ? (
          <LoadingSpinner message="Sincronizando la agenda global..." />
        ) : error ? (
          <div className="hub-error-card">{error}</div>
        ) : (
          <div className="admin-table-wrapper-premium">
            <div className="table-filters-premium">
              <div className="search-bar-premium">
                 <Search size={18} />
                 <input type="text" placeholder="Buscar por evento o ubicación..." />
              </div>
              <button className="btn-filter-premium">
                <Filter size={18} />
                <span>Próximos</span>
              </button>
            </div>

            <table className="admin-table-premium">
              <thead>
                <tr>
                  <th>EVENTO Y LUGAR</th>
                  <th className="hide-mobile">FECHA</th>
                  <th className="hide-mobile">CATEGORÍA</th>
                  <th className="text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td>
                      <div className="row-main-info">
                        <span className="row-title">{event.title}</span>
                        <div className="row-subtitle-icon">
                          <MapPin size={12} />
                          <span>{event.commerce?.name || 'Sede Pandora'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="hide-mobile">
                      <div className="row-meta-date">
                        <Clock size={14} />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="hide-mobile">
                      <span className="row-meta">{event.category || 'Cultural'}</span>
                    </td>
                    <td className="text-right">
                      <div className="action-icons-group">
                        <Link to={`/event/${event.id}`} className="btn-action-premium view" title="Ver Evento">
                          <Eye size={18} />
                        </Link>
                        <button 
                          onClick={() => handleToggleEvent(event.id, event.isActive !== false)} 
                          className={`btn-action-premium ${event.isActive !== false ? 'delete' : 'edit'}`} 
                          title={event.isActive !== false ? "Cancelar/Bajar" : "Reactivar"}
                        >
                          {event.isActive !== false ? <Trash2 size={18} /> : <Plus size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="table-footer-premium">
              <p>Agenda completa: {events.length} presentaciones</p>
              <div className="pagination-group-premium">
                 <button disabled className="btn-page"><ChevronLeft size={20} /></button>
                 <button disabled className="btn-page active">1</button>
                 <button disabled className="btn-page"><ChevronRight size={20} /></button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
      
      <style>{`
        .row-subtitle-icon {
          display: flex;
          align-items: center;
          gap: 6px;
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.8rem;
        }
        .row-meta-date {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #fff;
          font-size: 0.9rem;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default AdminEventsPage;
