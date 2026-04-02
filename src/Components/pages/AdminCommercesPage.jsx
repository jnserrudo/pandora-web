// src/Components/pages/AdminCommercesPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  Search, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Store,
  Clock,
  ShieldCheck,
  Building
} from 'lucide-react';
import { getCommerces, updateCommerce, validateCommerce } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import './AdminArticlesPage.css';

const AdminCommercesPage = () => {
  const { token, user: adminUser } = useAuth();
  const { showToast } = useToast();
  const [commerces, setCommerces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para el modal de validación
  const [showModal, setShowModal] = useState(false);
  const [selectedCommerce, setSelectedCommerce] = useState(null);
  const [validationReason, setValidationReason] = useState('');
  const [validationAction, setValidationAction] = useState(null); // 'APPROVE' | 'REJECT'

  const fetchCommerces = async () => {
    try {
      setLoading(true);
      const data = await getCommerces(null);
      setCommerces(data);
    } catch (err) {
      console.error("Error fetching all commerces:", err);
      showToast("Error cargando el listado de comercios.", 'error');
      setError("Error cargando el listado de comercios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommerces();
  }, [token]);

  const openValidationModal = (commerce, action) => {
    setSelectedCommerce(commerce);
    setValidationAction(action);
    setValidationReason('');
    setShowModal(true);
  };

  const handleProcessValidation = async () => {
    if (!validationReason && validationAction === 'REJECT') {
      showToast("Por favor, ingresa el motivo del rechazo.", 'warning');
      return;
    }

    try {
      const isApproved = validationAction === 'APPROVE';
      // Ahora usamos la función específica de validación
      await validateCommerce(selectedCommerce.id, { 
        status: isApproved ? 'ACTIVE' : 'REJECTED',
        reason: validationReason,
        adminId: adminUser?.id
      }, token);

        setCommerces(prev => prev.map(c => 
        c.id === selectedCommerce.id ? { 
          ...c, 
          status: isApproved ? 'ACTIVE' : 'REJECTED'
        } : c
      ));
      
      setShowModal(false);
      showToast(isApproved ? "Comercio aprobado exitosamente." : "Comercio rechazado correctamente.", isApproved ? 'success' : 'info');
    } catch (err) {
      const msg = err.message || '';
      const isNetworkError = msg === 'Failed to fetch' || msg.includes('NetworkError');
      showToast(isNetworkError ? 'Error de conexión con el servidor.' : msg, 'error');
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
            <h1>Moderación de Comercios</h1>
          </div>
          <div className="stat-pill">
            <Clock size={18} />
            <span>{commerces.filter(c => c.status === 'PENDING').length} Pendientes</span>
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
                 <input type="text" placeholder="Buscar comercio por nombre o CUIT..." />
              </div>
              <button className="btn-filter-premium">
                <Filter size={18} />
                <span>Solo Pendientes</span>
              </button>
            </div>

            <table className="admin-table-premium">
              <thead>
                <tr>
                  <th>COMERCIO Y NIVEL</th>
                  <th className="hide-mobile">CATEGORÍA</th>
                  <th className="hide-mobile">ESTADO</th>
                  <th className="hide-mobile">PÁGINA PANDORA</th>
                  <th className="text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {commerces.map((commerce) => (
                  <tr key={commerce.id}>
                    <td>
                      <div className="row-main-info">
                        <span className="row-title">{commerce.name}</span>
                        <div className="row-subtitle-icon">
                          <Building size={12} />
                          <span>Nivel de Plan: {commerce.planLevel || 1}</span>
                        </div>
                      </div>
                    </td>
                    <td className="hide-mobile">
                      <span className="row-meta">{commerce.category || 'General'}</span>
                    </td>
                    <td className="hide-mobile">
                      <span className={`badge-premium ${commerce.status === 'ACTIVE' ? 'active' : (commerce.status === 'REJECTED' ? 'danger' : 'warning')}`}>
                        {commerce.status === 'ACTIVE' ? 'Validado' : (commerce.status === 'REJECTED' ? 'Rechazado' : 'Pendiente')}
                      </span>
                    </td>
                    <td className="hide-mobile">
                       {commerce.isVerified ? (
                         <span className="badge-premium active" style={{ color: '#FFD700', borderColor: '#FFD700' }}>
                           <ShieldCheck size={12} style={{ marginRight: '5px' }} />
                           Socio Pandora
                         </span>
                       ) : '-'}
                    </td>
                    <td className="text-right">
                      <div className="action-icons-group">
                        <Link to={`/admin/commerces/${commerce.id}/detail`} className="btn-action-premium view" title="Ver Feedback, Métricas y Detalles">
                          <ExternalLink size={18} />
                        </Link>
                        
                        {commerce.status === 'PENDING' && (
                          <>
                            <button 
                              onClick={() => openValidationModal(commerce, 'APPROVE')} 
                              className="btn-action-premium edit"
                              title="Aprobar"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button 
                              onClick={() => openValidationModal(commerce, 'REJECT')} 
                              className="btn-action-premium delete"
                              title="Rechazar"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        
                        {commerce.status === 'ACTIVE' && (
                          <button 
                            onClick={() => openValidationModal(commerce, 'REJECT')} 
                            className="btn-action-premium delete"
                            title="Invalidar / Dar de baja"
                          >
                            <XCircle size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="table-footer-premium">
              <p>Total de {commerces.length} comercios en el ecosistema</p>
              <div className="pagination-group-premium">
                 <button disabled className="btn-page"><ChevronLeft size={20} /></button>
                 <button disabled className="btn-page active">1</button>
                 <button disabled className="btn-page"><ChevronRight size={20} /></button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE VALIDACIÓN */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content">
            <h2>{validationAction === 'APPROVE' ? 'Aprobar Comercio' : 'Rechazar Solicitud'}</h2>
            <p><strong>Comercio:</strong> {selectedCommerce?.name}</p>
            
            <div className="modal-form-group">
              <label>Motivo o Nota del Administrador:</label>
              <textarea 
                value={validationReason}
                onChange={(e) => setValidationReason(e.target.value)}
                placeholder={validationAction === 'REJECT' ? "Escribe el motivo del rechazo para el usuario..." : "Nota interna opcional..."}
                required={validationAction === 'REJECT'}
              />
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button 
                className={`btn-primary ${validationAction === 'REJECT' ? 'btn-danger' : ''}`}
                onClick={handleProcessValidation}
              >
                {validationAction === 'APPROVE' ? 'Aceptar y Validar' : 'Confirmar Rechazo'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
      
      <style>{`
        .admin-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }
        .admin-modal-content {
          background: #1a1a2e;
          padding: 2.5rem;
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          width: 90%;
          max-width: 500px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
        }
        .admin-modal-content h2 {
          margin-bottom: 1.5rem;
          font-size: 1.5rem;
          background: linear-gradient(135deg, #fff, rgba(255, 255, 255, 0.6));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .modal-form-group {
          margin: 1.5rem 0;
        }
        .modal-form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9rem;
        }
        .modal-form-group textarea {
          width: 100%;
          height: 100px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1rem;
          border-radius: 12px;
          color: #fff;
          resize: none;
        }
        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
        }
        .btn-secondary {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #fff;
          padding: 0.8rem 1.5rem;
          border-radius: 12px;
          cursor: pointer;
        }
        .btn-primary {
          background: var(--color-primary);
          border: none;
          color: #fff;
          padding: 0.8rem 1.5rem;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
        }
        .btn-danger {
          background: #ff4d4d !important;
        }
      `}</style>
    </div>
  );
};

export default AdminCommercesPage;
