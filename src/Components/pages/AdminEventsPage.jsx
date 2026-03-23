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
  Edit,
  Trash2,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Star
} from 'lucide-react';
import { getEvents, approveEvent, rejectEvent } from '../../services/api';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal de rechazo
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectNote, setRejectNote] = useState('');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getEvents(token);
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

  const handleApprove = async (id) => {
    try {
      await approveEvent(id, token);
      setEvents(prev => prev.map(e => e.id === id ? { ...e, status: 'APPROVED' } : e));
      showToast("Evento aprobado y publicado.", 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const openRejectModal = (id) => {
    setRejectingId(id);
    setRejectNote('');
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    try {
      await rejectEvent(rejectingId, rejectNote, token);
      setEvents(prev => prev.map(e => e.id === rejectingId ? { ...e, status: 'REJECTED' } : e));
      setShowRejectModal(false);
      showToast("Solicitud rechazada. Se notificó al usuario.", 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleEvent = async (id, currentStatus) => {
    try {
      setEvents(prev => prev.map(e => 
        e.id === id ? { ...e, isActive: !currentStatus } : e
      ));
      showToast("Estado del evento actualizado.", 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const statusLabel = (status) => {
    const map = {
      PENDING: { label: 'Pendiente', cls: 'draft' },
      APPROVED: { label: 'Aprobado', cls: 'active' },
      REJECTED: { label: 'Rechazado', cls: 'inactive' },
      SCHEDULED: { label: 'Programado', cls: 'active' },
      CANCELLED: { label: 'Cancelado', cls: 'inactive' },
      FINISHED: { label: 'Finalizado', cls: 'draft' },
    };
    return map[status] || { label: status || 'Sin estado', cls: 'draft' };
  };

  const filteredEvents = events.filter(e => {
    const matchSearch = !searchTerm || (e.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

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
                <input
                  type="text"
                  placeholder="Buscar por nombre de evento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="btn-filter-premium"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">Todos los estados</option>
                <option value="PENDING">Pendientes</option>
                <option value="APPROVED">Aprobados</option>
                <option value="REJECTED">Rechazados</option>
                <option value="SCHEDULED">Programados</option>
                <option value="CANCELLED">Cancelados</option>
                <option value="FINISHED">Finalizados</option>
              </select>
            </div>

            <table className="admin-table-premium">
              <thead>
                <tr>
                  <th>EVENTO Y ORGANIZADOR</th>
                  <th className="hide-mobile">FECHA INICIO</th>
                  <th className="hide-mobile">ESTADO</th>
                  <th className="text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => {
                  const sl = statusLabel(event.status);
                  return (
                    <tr key={event.id}>
                      <td>
                        <div className="row-main-info">
                          <span className="row-title">
                            {event.featured && <Star size={13} style={{ color: '#FFD700', marginRight: 4, verticalAlign: 'middle' }} />}
                            {event.name}
                          </span>
                          <div className="row-subtitle-icon">
                            <MapPin size={12} />
                            <span>{event.commerce?.name || event.organizerName || 'Organizador independiente'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="hide-mobile">
                        <div className="row-meta-date">
                          <Clock size={14} />
                          <span>
                            {event.startDate
                              ? new Date(event.startDate).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                              : '—'}
                          </span>
                        </div>
                      </td>
                      <td className="hide-mobile">
                        <span className={`badge-premium ${sl.cls}`}>{sl.label}</span>
                      </td>
                      <td className="text-right">
                        <div className="action-icons-group">
                          <Link to={`/event/${event.id}`} className="btn-action-premium view" title="Ver Evento">
                            <Eye size={18} />
                          </Link>
                          <Link to={`/events/${event.id}/edit`} className="btn-action-premium edit" title="Editar Evento">
                            <Edit size={18} />
                          </Link>
                          {event.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApprove(event.id)}
                                className="btn-action-premium edit"
                                title="Aprobar solicitud"
                              >
                                <CheckCircle size={18} />
                              </button>
                              <button
                                onClick={() => openRejectModal(event.id)}
                                className="btn-action-premium delete"
                                title="Rechazar solicitud"
                              >
                                <XCircle size={18} />
                              </button>
                            </>
                          )}
                          {event.status !== 'PENDING' && (
                            <button
                              onClick={() => handleToggleEvent(event.id, event.isActive !== false)}
                              className={`btn-action-premium ${event.isActive !== false ? 'delete' : 'edit'}`}
                              title={event.isActive !== false ? 'Desactivar' : 'Reactivar'}
                            >
                              {event.isActive !== false ? <Trash2 size={18} /> : <Plus size={18} />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredEvents.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.4)' }}>
                      No se encontraron eventos con los filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="table-footer-premium">
              <p>Total: {filteredEvents.length} de {events.length} eventos</p>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                {events.filter(e => e.status === 'PENDING').length} solicitudes pendientes
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Rechazo */}
      {showRejectModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content">
            <h2>Rechazar Solicitud de Evento</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Indicá el motivo del rechazo. El usuario será notificado.
            </p>
            <div className="modal-form-group">
              <label>Motivo del rechazo:</label>
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="Ej. Las fechas están incompletas, la descripción no cumple con los requisitos..."
                rows={4}
              />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowRejectModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleReject} disabled={!rejectNote.trim()}>
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}

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
        .badge-premium.inactive {
          background: rgba(255, 70, 70, 0.15);
          color: #ff6b6b;
          border-color: rgba(255, 70, 70, 0.3);
        }
      `}</style>
    </div>
  );
};

export default AdminEventsPage;
