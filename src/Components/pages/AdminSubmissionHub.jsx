// src/Components/pages/AdminSubmissionHub.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Trash2,
  ArrowUpRight,
  Clock,
  MessageSquare,
  Paperclip,
  CheckCircle2,
  ExternalLink,
  DollarSign
} from 'lucide-react';
import { getAdminSubmissions, replyToSubmission } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import './AdminArticlesPage.css';

const AdminSubmissionHub = () => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL'); // ALL, PENDING, PLAN_UPGRADE, etc.

  // Modal de respuesta
  const [showModal, setShowModal] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState('RESPONDED'); // RESPONDED, APPROVED, REJECTED

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const data = await getAdminSubmissions(token);
      setSubmissions(data);
    } catch (err) {
      console.error("Error fetching submissions:", err);
      // Fallback fallback
      setSubmissions([
        { id: 1, name: 'Juan Perez', type: 'PLAN_UPGRADE', message: 'Subir a nivel 4', status: 'PENDING', attachmentUrl: 'https://via.placeholder.com/300x400', createdAt: new Date() },
        { id: 2, name: 'Empresa X', type: 'AD_PROPOSAL', message: 'Queremos banner en la home', status: 'PENDING', createdAt: new Date() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchSubmissions();
  }, [token]);

  const openReplyModal = (sub) => {
    setSelectedSub(sub);
    setReplyText(sub.adminResponse || '');
    setReplyStatus(sub.type === 'PLAN_UPGRADE' ? 'APPROVED' : 'RESPONDED');
    setShowModal(true);
  };

  const handleSendReply = async () => {
    try {
      await replyToSubmission(selectedSub.id, { 
        adminResponse: replyText,
        status: replyStatus 
      }, token);
      
      setSubmissions(prev => prev.map(s => 
        s.id === selectedSub.id ? { ...s, adminResponse: replyText, status: replyStatus } : s
      ));
      setShowModal(false);
      showToast("Respuesta enviada correctamente.", 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filteredSubmissions = submissions.filter(s => {
    if (filter === 'ALL') return true;
    if (filter === 'PENDING') return s.status === 'PENDING';
    return s.type === filter;
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
            <h1>Buzon unificado</h1>
            <p>Contactos, Publicidad y Pagos de Planes.</p>
          </div>
          <div className="stat-pill">
            <Clock size={18} />
            <span>{submissions.filter(s => s.status === 'PENDING').length} Pendientes</span>
          </div>
        </header>

        {loading ? (
          <LoadingSpinner message="Abriendo archivadores oficiales..." />
        ) : (
          <div className="admin-table-wrapper-premium">
            <div className="table-filters-premium">
              <div className="search-bar-premium">
                 <Search size={18} />
                 <input type="text" placeholder="Buscar por remitente o asunto..." />
              </div>
              <div className="filter-group-premium">
                <select value={filter} onChange={(e) => setFilter(e.target.value)} className="btn-filter-premium">
                  <option value="ALL">Todos los tipos</option>
                  <option value="PENDING">Solo Pendientes</option>
                  <option value="EVENT_REQUEST">Solicitudes de Evento</option>
                  <option value="PLAN_UPGRADE">Pagos / Planes</option>
                  <option value="AD_PROPOSAL">Publicidad</option>
                  <option value="MAGAZINE_PROPOSAL">Revista</option>
                  <option value="CONTACT">General</option>
                </select>
              </div>
            </div>

            <table className="admin-table-premium">
              <thead>
                <tr>
                  <th>REMITENTE Y TIPO</th>
                  <th className="hide-mobile">MENSAJE</th>
                  <th className="hide-mobile">ADJUNTO</th>
                  <th className="hide-mobile">ESTADO</th>
                  <th className="text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((sub) => (
                  <tr key={sub.id}>
                    <td>
                      <div className="row-main-info">
                        <span className="row-title">{sub.name || sub.user?.name || 'Usuario Pandora'}</span>
                        <div className="sub-type-badge">
                          {sub.type === 'PLAN_UPGRADE' ? <DollarSign size={12} /> : sub.type === 'EVENT_REQUEST' ? <CheckCircle2 size={12} /> : <FileText size={12} />}
                          <span>{
                            sub.type === 'EVENT_REQUEST' ? 'Solicitud Evento' :
                            sub.type === 'PLAN_UPGRADE' ? 'Pago / Plan' :
                            sub.type === 'AD_PROPOSAL' ? 'Publicidad' :
                            sub.type === 'MAGAZINE_PROPOSAL' ? 'Revista' :
                            sub.type === 'CONTACT' ? 'Contacto' : sub.type
                          }</span>
                        </div>
                      </div>
                    </td>
                    <td className="hide-mobile">
                      <div className="message-preview">
                        {sub.message?.substring(0, 50)}...
                      </div>
                    </td>
                    <td className="hide-mobile">
                      {sub.attachmentUrl ? (
                         <a href={sub.attachmentUrl} target="_blank" rel="noreferrer" className="btn-action-premium view" title="Ver Adjunto">
                           <Paperclip size={18} />
                         </a>
                      ) : '-'}
                    </td>
                    <td className="hide-mobile">
                      <span className={`badge-premium ${sub.status === 'PENDING' ? 'draft' : 'active'}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="action-icons-group">
                        <button onClick={() => openReplyModal(sub)} className="btn-action-premium edit" title="Responder / Resolver">
                           <ArrowUpRight size={18} />
                        </button>
                        <button className="btn-action-premium delete" title="Archivar">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="table-footer-premium">
               <p>Sistema de Gestión de Entradas Pandora {new Date().getFullYear()}</p>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE RESPUESTA */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content">
            <h2>Responder Solicitud</h2>
            <p className="sub-detail-info"><strong>De:</strong> {selectedSub?.name}</p>
            <p className="sub-detail-info"><strong>Mensaje:</strong> "{selectedSub?.message}"</p>
            
            <div className="modal-form-group">
              <label>Tu Respuesta:</label>
              <textarea 
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Escribe aquí la respuesta que verá el usuario..."
              />
            </div>

            <div className="modal-form-group">
              <label>Cambiar Estado a:</label>
              <select value={replyStatus} onChange={(e) => setReplyStatus(e.target.value)}>
                 <option value="RESPONDED">Respondido (Solo cerrar ticket)</option>
                 <option value="APPROVED">Aprobado (Pasa a activo)</option>
                 <option value="REJECTED">Rechazado (No procede)</option>
                 <option value="ARCHIVED">Archivado</option>
              </select>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cerrar</button>
              <button className="btn-primary" onClick={handleSendReply}>Enviar Respuesta</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <style>{`
        .sub-type-badge {
          display: flex;
          align-items: center;
          gap: 5px;
          color: var(--color-primary);
          font-size: 0.75rem;
          font-weight: 800;
        }
        .message-preview {
          color: rgba(255,255,255,0.4);
          font-style: italic;
        }
        .sub-detail-info {
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
          color: rgba(255,255,255,0.6);
        }
      `}</style>
    </div>
  );
};

export default AdminSubmissionHub;
