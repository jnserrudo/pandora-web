// src/Components/pages/AdminContactRequestsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  Trash2,
  ArrowUpRight,
  MessageSquare
} from 'lucide-react';
import { apiClient, archiveContactRequest } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { formatEnumLabel } from '../../utils/enumLabels.js';
import AdminTablePagination, { useAdminPagination } from '../admin/AdminTablePagination';
import AdminRowActionsMenu from '../admin/AdminRowActionsMenu';
import './AdminArticlesPage.css';

const AdminContactRequestsPage = () => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingOnly, setPendingOnly] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/contact');
        setRequests(Array.isArray(response.data) ? response.data : []);
        setError(null);
      } catch (err) {
        setError("No se pudieron cargar las solicitudes.");
        setRequests([]);
        showToast("No se pudieron cargar las solicitudes.", 'error');
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchRequests();
  }, [token]);

  const handleArchive = async (id) => {
    try {
      await archiveContactRequest(id, token);
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'ARCHIVED' } : r));
      showToast("Mensaje archivado.", 'success');
    } catch (err) {
      showToast(err.message || "No se pudo archivar.", 'error');
    }
  };

  const visibleRequests = requests.filter((r) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term
      || r.name?.toLowerCase().includes(term)
      || r.email?.toLowerCase().includes(term)
      || r.message?.toLowerCase().includes(term);
    const matchesPending = !pendingOnly || r.status === 'PENDING';
    return matchesSearch && matchesPending;
  });

  const pagination = useAdminPagination(visibleRequests, 10);

  return (
    <div className="admin-wrapper hub-theme">
      <Navbar />
      <div className="admin-container">
        <div className="admin-sticky-back">
          <Link to="/admin/dashboard" className="back-link">
            <ChevronLeft size={20} />
            <span>Volver al Panel</span>
          </Link>
        </div>
        <header className="admin-header-premium">
          <div className="admin-title-group">
            <h1>Centro de Mensajería</h1>
          </div>
          <div className="stat-pill">
            <MessageSquare size={18} />
            <span>{requests.length} Solicitudes</span>
          </div>
        </header>

        {loading ? (
          <LoadingSpinner message="Abriendo buzón oficial..." />
        ) : (
          <div className="admin-table-wrapper-premium">
            <div className="table-filters-premium">
              <div className="search-bar-premium">
                 <Search size={18} />
                 <input
                   type="text"
                   placeholder="Buscar por remitente o asunto..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
              <button
                type="button"
                className="btn-filter-premium"
                onClick={() => setPendingOnly((prev) => !prev)}
                aria-pressed={pendingOnly}
              >
                <Filter size={18} />
                <span>{pendingOnly ? 'Todos' : 'Nuevos'}</span>
              </button>
            </div>

            <table className="admin-table-premium">
              <thead>
                <tr>
                  <th className="col-main">REMITENTE Y FECHA</th>
                  <th className="hide-mobile col-meta">TIPO / INTERÉS</th>
                  <th className="hide-tablet col-meta">MENSAJE (FRAGMENTO)</th>
                  <th className="col-actions text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {visibleRequests.length === 0 ? (
                  <tr>
                    <td colSpan={4}>{error || 'No hay mensajes con ese filtro. Cambiá la búsqueda o mirá el buzón unificado.'}</td>
                  </tr>
                ) : pagination.pageItems.map((request) => (
                  <tr key={request.id}>
                    <td className="col-main">
                      <div className="row-main-info">
                        <span className="row-title">{request.name}</span>
                        <small className="row-subtitle">{request.email}</small>
                      </div>
                    </td>
                    <td className="hide-mobile col-meta">
                      <span className="badge-premium active" style={{ opacity: 0.7 }}>
                        {formatEnumLabel(request.interestType || request.type, 'Consulta')}
                      </span>
                    </td>
                    <td className="hide-tablet col-meta">
                      <div className="message-box-preview">
                        {request.message?.substring(0, 60)}...
                      </div>
                    </td>
                      <td className="col-actions text-right">
                        <AdminRowActionsMenu
                          label={`Acciones de ${request.name || request.email}`}
                          items={[
                            request.email
                              ? {
                                  key: 'mail',
                                  label: 'Responder por mail',
                                  icon: ArrowUpRight,
                                  href: `mailto:${request.email}`,
                                  tone: 'info',
                                }
                              : null,
                            {
                              key: 'archive',
                              label: 'Archivar',
                              icon: Trash2,
                              tone: 'danger',
                              onClick: () => handleArchive(request.id),
                            },
                          ]}
                        />
                      </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <AdminTablePagination {...pagination} onPageSizeChange={pagination.setPageSize} />
          </div>
        )}
      </div>
      <Footer />
      <style>{`
        .message-box-preview {
          color: rgba(255, 255, 255, 0.4);
          font-style: italic;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};

export default AdminContactRequestsPage;
