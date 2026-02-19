import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
    getCommerceById, 
    getCommerceComments, 
    getCommerceMetrics, 
    createCommerceAdvisory,
    markCommentAsRead,
    deleteCommerceComment,
    updateCommentNotes
} from '../../services/api';
import Navbar from '../Navbar/Navbar';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import CommentCard from '../Commerce/CommentCard';
import AdvisoryForm from '../Commerce/AdvisoryForm';
import { 
    LayoutDashboard, 
    ArrowLeft, 
    MessageSquare, 
    BarChart, 
    Eye, 
    MousePointer, 
    Star, 
    TrendingUp,
    Shield,
    Building,
    Mail,
    ExternalLink,
    MapPin,
    Phone,
    Globe
} from 'lucide-react';
import './AdminCommerceDetailPage.css';

const AdminCommerceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { showToast } = useToast();

  const [commerce, setCommerce] = useState(null);
  const [comments, setComments] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdvisoryForm, setShowAdvisoryForm] = useState(false);
  
  // Filtros de comentarios
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'UNREAD', 'URGENT'

  useEffect(() => {
    loadData();
  }, [id, token]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [commerceData, commentsData, metricsData] = await Promise.all([
        getCommerceById(id, token),
        getCommerceComments(id, token),
        getCommerceMetrics(id, token)
      ]);
      
      console.log('Commerce data:', commerceData); // Para depuración
      
      setCommerce(commerceData);
      setComments(commentsData);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Error loading commerce data:', error);
      showToast('Error cargando datos del comercio. ' + (error.response?.data?.message || ''), 'error');
      navigate('/admin/commerces');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (commentId) => {
    try {
        await markCommentAsRead(commentId, token);
        setComments(prev => prev.map(c => 
            c.id === commentId ? { ...c, isRead: true } : c
        ));
        showToast('Comentario marcado como leído', 'success');
    } catch (error) {
        showToast('Error al actualizar comentario', 'error');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('¿Estás seguro de eliminar este comentario?')) return;
    
    try {
        await deleteCommerceComment(commentId, token);
        setComments(prev => prev.filter(c => c.id !== commentId));
        showToast('Comentario eliminado', 'success');
        // Actualizar métricas localmente o recargar
        setMetrics(prev => ({ ...prev, totalComments: prev.totalComments - 1 }));
    } catch (error) {
        showToast('Error al eliminar comentario', 'error');
    }
  };

  const handleUpdateNotes = async (commentId, data) => {
    try {
        await updateCommentNotes(commentId, data, token);
        setComments(prev => prev.map(c => 
            c.id === commentId ? { ...c, ...data } : c
        ));
        showToast('Notas actualizadas', 'success');
    } catch (error) {
        showToast('Error al guardar notas', 'error');
    }
  };

  const handleSubmitAdvisory = async (commerceId, data) => {
    try {
        await createCommerceAdvisory(commerceId, data, token);
        showToast('Asesoría enviada con éxito', 'success');
        setShowAdvisoryForm(false);
    } catch (error) {
        console.error(error);
        showToast('Error al enviar asesoría', 'error');
    }
  };

  const filteredComments = comments.filter(c => {
    if (filter === 'UNREAD') return !c.isRead;
    if (filter === 'URGENT') return c.priority === 'URGENT' || c.priority === 'HIGH';
    return true;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="admin-detail-page">
      <Navbar />
      
      <div className="admin-detail-container">
        {/* Header */}
        <header className="page-header glass-panel">
            <button onClick={() => navigate('/admin/commerces')} className="btn-back">
                <ArrowLeft size={20} /> Volver
            </button>
            
            <div className="header-content">
                <div className="title-section">
                    <h1>{commerce?.name}</h1>
                    <span className={`status-badge status-${commerce?.status?.toLowerCase()}`}>
                        {commerce?.status}
                    </span>
                    <span className="plan-badge">Plan Nivel {metrics?.planLevel}</span>
                </div>
                
                <div className="header-actions">
                    <button 
                        className={`btn-advisory ${showAdvisoryForm ? 'active' : ''}`}
                        onClick={() => setShowAdvisoryForm(!showAdvisoryForm)}
                    >
                        <Shield size={18} />
                        {showAdvisoryForm ? 'Cerrar Asesoría' : 'Nueva Asesoría'}
                    </button>
                </div>
            </div>
        </header>

        {/* Advisory Form Section */}
        {showAdvisoryForm && (
            <section className="advisory-section">
                <AdvisoryForm 
                    commerceId={id} 
                    metrics={metrics} 
                    onSubmit={handleSubmitAdvisory}
                    onCancel={() => setShowAdvisoryForm(false)}
                />
            </section>
        )}

        {/* Metrics Grid */}
        <section className="metrics-grid">
            <div className="metric-card glass-panel">
                <div className="metric-icon blue"><Eye size={24} /></div>
                <div className="metric-content">
                    <h3>Impresiones</h3>
                    <p className="metric-value">{metrics?.impressions}</p>
                </div>
            </div>
            
            <div className="metric-card glass-panel">
                <div className="metric-icon purple"><MousePointer size={24} /></div>
                <div className="metric-content">
                    <h3>Clics</h3>
                    <p className="metric-value">{metrics?.clicks}</p>
                </div>
            </div>
            
            <div className="metric-card glass-panel">
                <div className="metric-icon green"><TrendingUp size={24} /></div>
                <div className="metric-content">
                    <h3>CTR</h3>
                    <p className="metric-value">{metrics?.ctr}%</p>
                </div>
            </div>
            
            <div className="metric-card glass-panel">
                <div className="metric-icon orange"><Star size={24} /></div>
                <div className="metric-content">
                    <h3>Rating Promedio</h3>
                    <p className="metric-value">{metrics?.averageRating?.toFixed(1) || '-'}</p>
                    <span className="metric-sub">de {metrics?.totalComments} opiniones</span>
                </div>
            </div>
        </section>

        {/* Información del Comercio */}
        <section className="commerce-info-section glass-panel">
          <h2><Building size={24} /> Información del Comercio</h2>
          <div className="commerce-info-grid">
            <div className="info-item">
              <span className="info-label">Nombre del Comercio</span>
              <p className="info-value">{commerce?.name || 'No disponible'}</p>
            </div>
            
            <div className="info-item">
              <span className="info-label">Categoría</span>
              <p className="info-value">{commerce?.category || 'No especificada'}</p>
            </div>
            
            <div className="info-item">
              <span className="info-label">Estado</span>
              <span className={`status-badge status-${commerce?.status?.toLowerCase() || 'pending'}`}>
                {commerce?.status || 'Pendiente'}
              </span>
            </div>
            
            <div className="info-item">
              <span className="info-label"><Mail size={14} /> Email de contacto</span>
              <p className="info-value">{commerce?.contactEmail || commerce?.owner?.email || 'No disponible'}</p>
            </div>
            
            <div className="info-item">
              <span className="info-label"><Phone size={14} /> Teléfono</span>
              <p className="info-value">{commerce?.phone || 'No disponible'}</p>
            </div>
            
            <div className="info-item">
              <span className="info-label"><MapPin size={14} /> Dirección</span>
              <p className="info-value">
                {typeof commerce?.address === 'string' 
                  ? commerce.address 
                  : (commerce?.address 
                      ? `${commerce.address.street || ''} ${commerce.address.city || ''} ${commerce.address.state || ''}`.trim() 
                      : 'No disponible')
                }
              </p>
            </div>
            
            <div className="info-item full-width">
              <span className="info-label">Descripción</span>
              <p className="info-value">
                {commerce?.description || 'No hay descripción disponible para este comercio.'}
              </p>
            </div>
            
            <div className="info-item">
              <span className="info-label">Horario de atención</span>
              <p className="info-value">
                {commerce?.businessHours || 'No especificado'}
              </p>
            </div>
            
            <div className="info-item">
              <span className="info-label">Sitio web</span>
              <p className="info-value">
                {commerce?.website ? (
                  <a href={commerce.website.startsWith('http') ? commerce.website : `https://${commerce.website}`} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="text-blue-600 hover:underline">
                    {commerce.website}
                  </a>
                ) : 'No disponible'}
              </p>
            </div>
          </div>
        </section>

        {/* Comments Section */}
        <section id="feedback-section" className="comments-section-container glass-panel">
            <div className="section-header">
                <h2><MessageSquare size={24}/> Feedback de Usuarios</h2>
                
                <div className="filter-tabs">
                    <button 
                        className={`filter-tab ${filter === 'ALL' ? 'active' : ''}`}
                        onClick={() => setFilter('ALL')}
                    >
                        Todos ({comments.length})
                    </button>
                    <button 
                        className={`filter-tab ${filter === 'UNREAD' ? 'active' : ''}`}
                        onClick={() => setFilter('UNREAD')}
                    >
                        No Leídos ({comments.filter(c => !c.isRead).length})
                    </button>
                    <button 
                        className={`filter-tab ${filter === 'URGENT' ? 'active' : ''}`}
                        onClick={() => setFilter('URGENT')}
                    >
                        Prioridad Alta ({comments.filter(c => ['URGENT', 'HIGH'].includes(c.priority)).length})
                    </button>
                </div>
            </div>

            <div className="comments-list">
                {filteredComments.length > 0 ? (
                    filteredComments.map(comment => (
                        <CommentCard 
                            key={comment.id} 
                            comment={comment}
                            onMarkAsRead={handleMarkAsRead}
                            onDelete={handleDeleteComment}
                            onUpdateNotes={handleUpdateNotes}
                        />
                    ))
                ) : (
                    <div className="empty-state">
                        <MessageSquare size={48} className="text-gray-300 mb-4" />
                        <p>No hay comentarios que coincidan con el filtro.</p>
                    </div>
                )}
            </div>
        </section>
      </div>
    </div>
  );
};

export default AdminCommerceDetailPage;
