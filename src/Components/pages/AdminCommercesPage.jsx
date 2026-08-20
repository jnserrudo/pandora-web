// src/Components/pages/AdminCommercesPage.jsx
import React, { useState, useEffect } from 'react';
import { getCategoryDisplayName } from '../../utils/categoryUtils.js';
import { Link } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  ExternalLink,
  Search,
  Filter,
  ChevronLeft,
  Store,
  Clock,
  ShieldCheck,
  Building,
  Eye,
  MapPin,
  Phone,
  Globe,
  Mail,
  User,
} from 'lucide-react';
import { getAllCommerces, validateCommerce, getAbsoluteImageUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatPlanLevelLabel, formatStatusLabel } from '../../utils/enumLabels.js';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import AdminTablePagination, { useAdminPagination } from '../admin/AdminTablePagination';
import AdminRowActionsMenu from '../admin/AdminRowActionsMenu';
import './AdminArticlesPage.css';
import './AdminCommercesPage.css';

function galleryList(commerce) {
  const raw = commerce?.galleryImages;
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean).slice(0, 4);
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(Boolean).slice(0, 4) : [];
    } catch {
      return [];
    }
  }
  return [];
}

const AdminCommercesPage = () => {
  const { token, user: adminUser } = useAuth();
  const { showToast } = useToast();
  const [commerces, setCommerces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedCommerce, setSelectedCommerce] = useState(null);
  const [validationReason, setValidationReason] = useState('');
  const [modalMode, setModalMode] = useState('REVIEW'); // REVIEW | DEACTIVATE
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingOnly, setPendingOnly] = useState(false);

  const fetchCommerces = async () => {
    try {
      setLoading(true);
      const data = await getAllCommerces(token);
      setCommerces(data || []);
    } catch (err) {
      console.error('Error fetching all commerces:', err);
      showToast('Error cargando el listado de comercios.', 'error');
      setError('Error cargando el listado de comercios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommerces();
  }, [token]);

  const openReviewModal = (commerce) => {
    setSelectedCommerce(commerce);
    setModalMode('REVIEW');
    setValidationReason('');
    setShowModal(true);
  };

  const openDeactivateModal = (commerce) => {
    setSelectedCommerce(commerce);
    setModalMode('DEACTIVATE');
    setValidationReason('');
    setShowModal(true);
  };

  const closeModal = () => {
    if (processing) return;
    setShowModal(false);
    setSelectedCommerce(null);
    setValidationReason('');
  };

  const handleProcessValidation = async (action) => {
    if (action === 'REJECT' && !validationReason.trim()) {
      showToast('Ingresá el motivo del rechazo.', 'warning');
      return;
    }

    try {
      setProcessing(true);
      const isApproved = action === 'APPROVE';
      await validateCommerce(
        selectedCommerce.id,
        {
          status: isApproved ? 'ACTIVE' : 'REJECTED',
          reason: validationReason,
          adminId: adminUser?.id,
        },
        token
      );

      setCommerces((prev) =>
        prev.map((c) =>
          c.id === selectedCommerce.id
            ? {
                ...c,
                status: isApproved ? 'ACTIVE' : 'REJECTED',
                isActive: isApproved ? true : false,
              }
            : c
        )
      );

      setShowModal(false);
      showToast(
        isApproved ? 'Comercio validado correctamente.' : 'Comercio rechazado correctamente.',
        isApproved ? 'success' : 'info'
      );
    } catch (err) {
      const msg = err.message || '';
      const isNetworkError = msg === 'Failed to fetch' || msg.includes('NetworkError');
      showToast(isNetworkError ? 'Error de conexión con el servidor.' : msg, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const statusBadgeClass = (status) => {
    if (status === 'ACTIVE') return 'active';
    if (status === 'REJECTED') return 'danger';
    if (status === 'INACTIVE') return 'inactive';
    return 'warning';
  };

  const visibleCommerces = commerces.filter((c) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term || c.name?.toLowerCase().includes(term);
    const matchesPending = !pendingOnly || c.status === 'PENDING';
    return matchesSearch && matchesPending;
  });

  const pagination = useAdminPagination(visibleCommerces, 10);
  const thumbs = galleryList(selectedCommerce);
  const cover = selectedCommerce?.coverImage
    ? getAbsoluteImageUrl(selectedCommerce.coverImage)
    : null;

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
            <h1>Moderación de Comercios</h1>
          </div>
          <div className="stat-pill">
            <Clock size={18} />
            <span>{commerces.filter((c) => c.status === 'PENDING').length} Pendientes</span>
          </div>
        </header>

        {loading ? (
          <LoadingSpinner message="Analizando base de datos de comercios..." />
        ) : error ? (
          <div className="hub-error-card">{error}</div>
        ) : (
          <div className="admin-table-wrapper-premium">
            <div className="table-filters-premium">
              <div className="search-bar-premium">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Buscar comercio por nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                className="btn-filter-premium"
                type="button"
                onClick={() => setPendingOnly((v) => !v)}
              >
                <Filter size={18} />
                <span>{pendingOnly ? 'Ver todos' : 'Solo pendientes'}</span>
              </button>
            </div>

            <table className="admin-table-premium">
              <thead>
                <tr>
                  <th className="col-main">COMERCIO Y NIVEL</th>
                  <th className="hide-tablet col-meta">CATEGORÍA</th>
                  <th className="hide-mobile col-status">ESTADO</th>
                  <th className="hide-tablet col-meta">PÁGINA PANDORA</th>
                  <th className="col-actions text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {visibleCommerces.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      No hay comercios con ese filtro. Cambiá la búsqueda o desactivá “solo pendientes”.
                    </td>
                  </tr>
                ) : (
                  pagination.pageItems.map((commerce) => (
                    <tr key={commerce.id}>
                      <td className="col-main">
                        <div className="row-main-info">
                          <span className="row-title">{commerce.name}</span>
                          <div className="row-subtitle-icon">
                            <Building size={12} />
                            <span>Plan {formatPlanLevelLabel(commerce.planLevel)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="hide-tablet col-meta">
                        <span className="row-meta">{getCategoryDisplayName(commerce.category)}</span>
                      </td>
                      <td className="hide-mobile col-status">
                        <span className={`badge-premium ${statusBadgeClass(commerce.status)}`}>
                          {commerce.status === 'ACTIVE'
                            ? 'Validado'
                            : formatStatusLabel(commerce.status)}
                        </span>
                      </td>
                      <td className="hide-tablet col-meta">
                        {commerce.isVerified ? (
                          <span
                            className="badge-premium active"
                            style={{ color: '#FFD700', borderColor: '#FFD700' }}
                          >
                            <ShieldCheck size={12} style={{ marginRight: '5px' }} />
                            Socio Pandora
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="col-actions text-right">
                        <AdminRowActionsMenu
                          label={`Acciones de ${commerce.name}`}
                          items={[
                            {
                              key: 'detail',
                              label: 'Ver detalle completo',
                              icon: ExternalLink,
                              to: `/admin/commerces/${commerce.id}/detail`,
                              tone: 'info',
                            },
                            commerce.status === 'PENDING'
                              ? {
                                  key: 'review',
                                  label: 'Revisar y decidir',
                                  icon: Eye,
                                  onClick: () => openReviewModal(commerce),
                                }
                              : null,
                            commerce.status === 'ACTIVE'
                              ? {
                                  key: 'deactivate',
                                  label: 'Dar de baja',
                                  icon: XCircle,
                                  tone: 'danger',
                                  onClick: () => openDeactivateModal(commerce),
                                }
                              : null,
                          ]}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <AdminTablePagination {...pagination} onPageSizeChange={pagination.setPageSize} />
          </div>
        )}
      </div>

      {showModal && selectedCommerce && (
        <div className="commerce-review-overlay" onClick={closeModal} role="presentation">
          <div
            className="commerce-review-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="commerce-review-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="commerce-review-header">
              <div>
                <p className="commerce-review-kicker">
                  {modalMode === 'DEACTIVATE' ? 'Dar de baja' : 'Revisión de solicitud'}
                </p>
                <h2 id="commerce-review-title">{selectedCommerce.name}</h2>
              </div>
              <span className={`badge-premium ${statusBadgeClass(selectedCommerce.status)}`}>
                {formatStatusLabel(selectedCommerce.status)}
              </span>
            </div>

            <div className="commerce-review-scroll">
              {(cover || thumbs.length > 0) && (
                <div className="commerce-review-media">
                  {cover && (
                    <img
                      className="commerce-review-cover"
                      src={cover}
                      alt=""
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  {thumbs.length > 0 && (
                    <div className="commerce-review-thumbs">
                      {thumbs.map((src, i) => (
                        <img
                          key={`${src}-${i}`}
                          src={getAbsoluteImageUrl(src)}
                          alt=""
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="commerce-review-grid">
                <div className="commerce-review-block">
                  <h3>Ficha</h3>
                  <p>
                    <Store size={14} /> {getCategoryDisplayName(selectedCommerce.category)}
                  </p>
                  <p>
                    <Building size={14} /> Plan {formatPlanLevelLabel(selectedCommerce.planLevel)}
                  </p>
                  {selectedCommerce.address && (
                    <p>
                      <MapPin size={14} /> {selectedCommerce.address}
                    </p>
                  )}
                </div>

                <div className="commerce-review-block">
                  <h3>Contacto</h3>
                  {(selectedCommerce.phone || selectedCommerce.whatsapp) && (
                    <p>
                      <Phone size={14} /> {selectedCommerce.phone || selectedCommerce.whatsapp}
                    </p>
                  )}
                  {selectedCommerce.website && (
                    <p>
                      <Globe size={14} /> {selectedCommerce.website}
                    </p>
                  )}
                  {selectedCommerce.instagram && <p>IG: {selectedCommerce.instagram}</p>}
                  {selectedCommerce.facebook && <p>FB: {selectedCommerce.facebook}</p>}
                  {!selectedCommerce.phone &&
                    !selectedCommerce.whatsapp &&
                    !selectedCommerce.website &&
                    !selectedCommerce.instagram &&
                    !selectedCommerce.facebook && <p className="muted">Sin datos de contacto</p>}
                </div>

                <div className="commerce-review-block">
                  <h3>Dueño</h3>
                  {selectedCommerce.owner ? (
                    <>
                      <p>
                        <User size={14} /> {selectedCommerce.owner.name || 'Sin nombre'}
                      </p>
                      <p>
                        <Mail size={14} /> {selectedCommerce.owner.email || 'Sin email'}
                      </p>
                    </>
                  ) : (
                    <p className="muted">Sin datos del dueño en este listado</p>
                  )}
                </div>
              </div>

              <div className="commerce-review-desc">
                <h3>Descripción</h3>
                <p>
                  {selectedCommerce.shortDescription ||
                    selectedCommerce.description ||
                    'Sin descripción cargada.'}
                </p>
              </div>

              <div className="modal-form-group">
                <label>
                  {modalMode === 'DEACTIVATE' || modalMode === 'REVIEW'
                    ? 'Motivo o nota del administrador'
                    : 'Nota'}
                </label>
                <textarea
                  value={validationReason}
                  onChange={(e) => setValidationReason(e.target.value)}
                  placeholder={
                    modalMode === 'DEACTIVATE'
                      ? 'Motivo de la baja (recomendado)...'
                      : 'Obligatorio al rechazar; opcional al validar...'
                  }
                />
              </div>
            </div>

            <div className="commerce-review-footer">
              <Link
                to={`/admin/commerces/${selectedCommerce.id}/detail`}
                className="btn-secondary commerce-detail-link"
              >
                Ver detalle completo
              </Link>
              <div className="commerce-review-actions">
                <button type="button" className="btn-secondary" onClick={closeModal} disabled={processing}>
                  Cancelar
                </button>
                {modalMode === 'DEACTIVATE' ? (
                  <button
                    type="button"
                    className="btn-primary btn-danger"
                    disabled={processing}
                    onClick={() => handleProcessValidation('REJECT')}
                  >
                    Confirmar baja
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn-primary btn-danger"
                      disabled={processing}
                      onClick={() => handleProcessValidation('REJECT')}
                    >
                      <XCircle size={16} /> Rechazar
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      disabled={processing}
                      onClick={() => handleProcessValidation('APPROVE')}
                    >
                      <CheckCircle size={16} /> Validar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdminCommercesPage;
