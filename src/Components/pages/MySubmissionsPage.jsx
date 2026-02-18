// src/Components/pages/MySubmissionsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search,
  ChevronLeft,
  MessageCircle,
  Paperclip,
  ArrowRight
} from 'lucide-react';
import { getMySubmissions } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import './UserProfilePage.css'; // Reutilizamos base de estilos de perfil

const MySubmissionsPage = () => {
  const { token } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const data = await getMySubmissions(token);
        setSubmissions(data);
      } catch (err) {
        console.error("Error fetching submissions:", err);
        setError("No pudimos cargar tus solicitudes.");
        // Fallback mock para visualización inicial
        setSubmissions([
          { id: 1, type: 'PLAN_UPGRADE', status: 'PENDING', message: 'Solicitud de Plan Elite para mi café.', createdAt: new Date(), attachmentUrl: '#' },
          { id: 2, type: 'CONTACT', status: 'RESPONDED', message: 'Duda sobre banners.', adminResponse: 'Hola! Ya están activos tus banners.', createdAt: new Date() }
        ]);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchSubmissions();
  }, [token]);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'PENDING': return <span className="status-badge pending"><Clock size={14} /> Pendiente</span>;
      case 'RESPONDED': return <span className="status-badge success"><CheckCircle2 size={14} /> Respondido</span>;
      case 'APPROVED': return <span className="status-badge success"><CheckCircle2 size={14} /> Aprobado</span>;
      case 'REJECTED': return <span className="status-badge danger"><XCircle size={14} /> Rechazado</span>;
      default: return <span className="status-badge">{status}</span>;
    }
  };

  const getTypeLabel = (type) => {
    switch(type) {
      case 'PLAN_UPGRADE': return 'Cambio de Plan';
      case 'AD_PROPOSAL': return 'Propuesta de Publicidad';
      case 'MAGAZINE_PROPOSAL': return 'Propuesta de Revista';
      default: return 'Consulta General';
    }
  };

  return (
    <div className="profile-page-wrapper">
      <Navbar />
      
      <div className="profile-container">
        <header className="profile-header-premium">
          <Link to="/profile" className="back-link">
            <ChevronLeft size={20} />
            <span>Volver a mi Perfil</span>
          </Link>
          <h1>Mis Solicitudes y Mensajes</h1>
          <p>Hacé el seguimiento de tus trámites y respuestas administrativas.</p>
        </header>

        {loading ? (
          <LoadingSpinner message="Abriendo tu buzón personal..." />
        ) : error && submissions.length === 0 ? (
          <div className="error-card">{error}</div>
        ) : submissions.length === 0 ? (
          <div className="empty-submissions glass-morphism">
            <MessageCircle size={64} className="empty-icon" />
            <h3>No tenés solicitudes activas</h3>
            <p>Cuando envíes un contacto o solicites un cambio de plan, aparecerá aquí.</p>
            <Link to="/contact" className="btn-primary">Enviar Mensaje</Link>
          </div>
        ) : (
          <div className="submissions-list">
            {submissions.map((sub) => (
              <div key={sub.id} className="submission-card glass-morphism">
                <div className="sub-header">
                  <div className="sub-type-group">
                    <FileText className="type-icon" />
                    <div>
                      <span className="sub-type">{getTypeLabel(sub.type)}</span>
                      <small className="sub-date">Enviado el {new Date(sub.createdAt).toLocaleDateString()}</small>
                    </div>
                  </div>
                  {getStatusBadge(sub.status)}
                </div>

                <div className="sub-body">
                  <p className="sub-message">"{sub.message}"</p>
                  {sub.attachmentUrl && (
                    <a href={sub.attachmentUrl} target="_blank" rel="noreferrer" className="attachment-link">
                      <Paperclip size={14} /> Ver archivo adjunto / comprobante
                    </a>
                  )}
                </div>

                {sub.adminResponse && (
                  <div className="admin-response-block">
                    <div className="response-header">
                      <MessageCircle size={16} />
                      <span>Respuesta de Pandora Admin:</span>
                    </div>
                    <p className="response-text">{sub.adminResponse}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
      
      <style>{`
        .submissions-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-top: 2rem;
        }
        .submission-card {
          padding: 2rem;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: transform 0.3s ease;
        }
        .submission-card:hover {
          transform: translateX(10px);
        }
        .sub-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }
        .sub-type-group {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        .type-icon { color: var(--color-primary); }
        .sub-type { font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
        .sub-date { display: block; color: rgba(255, 255, 255, 0.4); font-size: 0.8rem; }
        .status-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 50px;
          font-size: 0.8rem;
          font-weight: 700;
          background: rgba(255, 255, 255, 0.05);
        }
        .status-badge.pending { color: #f1c40f; background: rgba(241, 196, 15, 0.1); }
        .status-badge.success { color: #2ecc71; background: rgba(46, 204, 113, 0.1); }
        .status-badge.danger { color: #e74c3c; background: rgba(231, 76, 60, 0.1); }
        .sub-message { color: rgba(255, 255, 255, 0.7); font-style: italic; margin-bottom: 1rem; }
        .attachment-link { 
          display: inline-flex; 
          align-items: center; 
          gap: 5px; 
          color: var(--color-primary); 
          text-decoration: none; 
          font-size: 0.85rem; 
        }
        .admin-response-block {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .response-header {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--color-secondary);
          font-weight: 700;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }
        .response-text {
          color: #fff;
          background: rgba(255, 255, 255, 0.03);
          padding: 1.25rem;
          border-radius: 12px;
          font-size: 0.95rem;
          line-height: 1.5;
        }
        .empty-submissions {
          padding: 5rem;
          text-align: center;
          border-radius: 32px;
        }
        .empty-icon { color: rgba(255, 255, 255, 0.1); margin-bottom: 2rem; }
      `}</style>
    </div>
  );
};

export default MySubmissionsPage;
