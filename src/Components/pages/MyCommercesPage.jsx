// src/Components/pages/MyCommercesPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    getMyCommerces, 
    getCommerceAdvisories, 
    updateAdvisoryStatus,
    getCommerceMetrics,
    getAbsoluteImageUrl 
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import OwnerAdvisoryCard from '../Commerce/OwnerAdvisoryCard';
import { 
    Store, 
    MessageSquare, 
    Trophy, 
    Settings, 
    Plus, 
    ExternalLink,
    ChevronRight,
    Target,
    Loader2
} from 'lucide-react';
import './MyCommercesPage.css';

const MyCommercesPage = () => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [commerces, setCommerces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para gestión de asesorías
  const [selectedCommerce, setSelectedCommerce] = useState(null);
  const [advisories, setAdvisories] = useState([]);
  const [advisoriesLoading, setAdvisoriesLoading] = useState(false);
  const [view, setView] = useState('GRID'); // 'GRID' | 'ADVISORIES'

  useEffect(() => {
    const fetchMyCommerces = async () => {
      try {
        setLoading(true);
        const data = await getMyCommerces(token);
        
        // Enriquecer comercios con métricas básicas (opcional, para indicadores)
        const enrichedCommerces = await Promise.all(data.map(async (c) => {
            try {
                // Podríamos buscar si tiene asesorías nuevas aquí para poner un badge
                const advs = await getCommerceAdvisories(c.id, token);
                const hasNew = advs.some(a => a.status === 'SENT');
                return { ...c, hasNewAdvisory: hasNew };
            } catch {
                return c;
            }
        }));

        setCommerces(enrichedCommerces);
      } catch (err) {
        console.error("Error fetching my commerces:", err);
        setError("No se pudieron cargar tus comercios. Intenta nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchMyCommerces();
    }
  }, [token]);

  const handleViewAdvisories = async (commerce) => {
    setSelectedCommerce(commerce);
    setView('ADVISORIES');
    setAdvisoriesLoading(true);
    try {
        const data = await getCommerceAdvisories(commerce.id, token);
        setAdvisories(data);
        
        // Si hay asesorías SENT, marcarlas como READ al abrirlas
        const unread = data.filter(a => a.status === 'SENT');
        for (const adv of unread) {
            await updateAdvisoryStatus(adv.id, 'READ', token);
        }
    } catch (error) {
        showToast('Error al cargar asesorías', 'error');
    } finally {
        setAdvisoriesLoading(false);
    }
  };

  const handleUpdateAdvisoryStatus = async (advisoryId, status) => {
    try {
        const updated = await updateAdvisoryStatus(advisoryId, status, token);
        setAdvisories(prev => prev.map(a => a.id === advisoryId ? updated : a));
        showToast(status === 'IMPLEMENTED' ? '¡Excelente! Pandora registrará este cambio.' : 'Estado actualizado', 'success');
        
        // Si ya no quedan nuevas, actualizar el badge del listado principal
        if (status === 'IMPLEMENTED' || status === 'READ') {
            const stillHasNew = advisories.some(a => a.id !== advisoryId && a.status === 'SENT');
            if (!stillHasNew) {
                setCommerces(prev => prev.map(c => c.id === selectedCommerce.id ? { ...c, hasNewAdvisory: false } : c));
            }
        }
    } catch (error) {
        showToast('Error al actualizar estado', 'error');
    }
  };

  const getImageUrl = (commerce) => {
    if (commerce.galleryImages && commerce.galleryImages.length > 0) return getAbsoluteImageUrl(commerce.galleryImages[0]);
    if (commerce.coverImage) return getAbsoluteImageUrl(commerce.coverImage);
    return "https://placehold.co/400x250/0d0218/ffffff/png?text=Pandora"; 
  };

  if (loading) return <LoadingSpinner message="Analizando tus activos digitales..." />;

  return (
    <div className="my-commerces-wrapper hub-theme">
      <Navbar />
      
      <main className="my-commerces-container">
        {view === 'GRID' ? (
            <>
                <header className="page-neo-header">
                    <div className="header-title-neo">
                        <div className="title-with-icon">
                            <Store className="title-icon" />
                            <h1>Ecosistema de Negocios</h1>
                        </div>
                        <p>Gestioná la presencia y el rendimiento de tus marcas en Pandora</p>
                    </div>
                    <Link to="/commerces/create" className="btn-neo-success">
                        <Plus size={20} />
                        Registrar Nuevo Negocio
                    </Link>
                </header>

                {commerces.length === 0 ? (
                    <div className="empty-state-hub neo-glass-panel">
                        <div className="empty-icon-container">
                            <Store size={48} />
                        </div>
                        <h3>Tu portal está listo para crecer</h3>
                        <p>Aún no tienes comercios registrados. Comenzá a potenciar tu marca hoy mismo.</p>
                        <Link to="/commerces/create" className="btn-neo-primary">
                            Registrar Mi Primer Local
                        </Link>
                    </div>
                ) : (
                    <div className="commerces-neo-grid">
                        {commerces.map(commerce => (
                            <div key={commerce.id} className="neo-manage-card neo-glass-panel">
                                <div className="card-media">
                                    <img src={getImageUrl(commerce)} alt={commerce.name} />
                                    {commerce.hasNewAdvisory && (
                                        <div className="new-alert-badge">
                                            <Target size={14} /> Recomendación Nueva
                                        </div>
                                    )}
                                    <div className="plan-tag">Nivel {commerce.planLevel || 1}</div>
                                </div>
                                
                                <div className="card-body">
                                    <div className="card-top-info">
                                        <span className="card-category">{commerce.category?.replace('_', ' ')}</span>
                                        <span className={`status-pill ${commerce.status?.toLowerCase()}`}>
                                            {commerce.status === 'PENDING' ? 'En Revisión' : 
                                             commerce.status === 'ACTIVE' ? 'Publicado' : 'Rechazado'}
                                        </span>
                                    </div>
                                    <h3 className="card-name">{commerce.name}</h3>
                                    
                                    <div className="card-stats-mini">
                                        <div className="mini-stat">
                                            <MessageSquare size={14} />
                                            <span>{commerce.totalComments || 0} op.</span>
                                        </div>
                                        <div className="mini-stat">
                                            <Trophy size={14} />
                                            <span>{commerce.averageRating?.toFixed(1) || '0.0'}</span>
                                        </div>
                                    </div>

                                    <div className="card-neo-actions">
                                        <button 
                                            onClick={() => handleViewAdvisories(commerce)}
                                            className={`btn-card-neo advisory ${commerce.hasNewAdvisory ? 'vibrate' : ''}`}
                                        >
                                            <Target size={18} />
                                            Asesorías
                                        </button>
                                        <Link to={`/commerces/edit/${commerce.id}`} className="btn-card-neo edit">
                                            <Settings size={18} />
                                            Gestionar
                                        </Link>
                                        <Link to={`/commerce/${commerce.id}`} className="btn-card-neo view" title="Ver Público">
                                            <ExternalLink size={18} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </>
        ) : (
            <div className="advisories-view-container animate-fade-in">
                <header className="view-sub-header">
                    <button className="btn-back-neo" onClick={() => setView('GRID')}>
                        <Plus size={20} style={{ transform: 'rotate(45deg)' }} /> Volver a mis comercios
                    </button>
                    <div className="view-info">
                        <h2>Estrategias para <strong>{selectedCommerce?.name}</strong></h2>
                        <p>Recomendaciones personalizadas del equipo de consultoría Pandora</p>
                    </div>
                </header>

                <div className="advisories-content-layout">
                    {advisoriesLoading ? (
                        <div className="loading-advisories">
                             <Loader2 size={40} className="animate-spin text-purple-500" />
                             <p>Consultando analistas...</p>
                        </div>
                    ) : advisories.length === 0 ? (
                        <div className="empty-advisories glass-panel">
                            <Target size={48} className="text-gray-600 mb-4" />
                            <h3>No hay asesorías registradas aún</h3>
                            <p>Tus métricas están siendo analizadas. Pronto recibirás recomendaciones aquí.</p>
                        </div>
                    ) : (
                        <div className="advisories-list-owner">
                            {advisories.map(adv => (
                                <OwnerAdvisoryCard 
                                    key={adv.id} 
                                    advisory={adv} 
                                    onUpdateStatus={handleUpdateAdvisoryStatus}
                                />
                            ))}
                        </div>
                    )}

                    <div className="advisory-sidebar-info glass-panel">
                        <h4>¿Qué son las Asesorías?</h4>
                        <p>
                            Son análisis estratégicos realizados por administradores de Pandora basados en 
                            el comportamiento real de tus usuarios (clics, ratings y comentarios).
                        </p>
                        <div className="status-legend">
                            <div className="legend-item">
                                <span className="dot sent"></span>
                                <div>
                                    <strong>Nueva:</strong> Aún no has visualizado esta estrategia.
                                </div>
                            </div>
                            <div className="legend-item">
                                <span className="dot implemented"></span>
                                <div>
                                    <strong>Implementada:</strong> Has aplicado los cambios sugeridos.
                                </div>
                            </div>
                        </div>
                        <div className="pro-tip">
                            <h5>💡 Tip de Crecimiento</h5>
                            <p>Implementar al menos 2 asesorías al mes suele incrementar el CTR en un 15%.</p>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MyCommercesPage;

