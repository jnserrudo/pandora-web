// src/Components/pages/MyDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  Calendar,
  Megaphone,
  Plus,
  Eye,
  Edit,
  Crown,
  Zap,
  Star,
  Clock,
  MapPin,
  ChevronRight,
  LayoutDashboard,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { getMyCommerces, getMyEvents, getMyAdvertisements, getAbsoluteImageUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import './MyCommercesPage.css';
import './MyDashboardPage.css';

const MyDashboardPage = () => {
  const { token, user } = useAuth();
  const { showToast } = useToast();

  const [commerces, setCommerces] = useState([]);
  const [events, setEvents] = useState([]);
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('events');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [comm, evts] = await Promise.all([
          getMyCommerces(token).catch(() => []),
          getMyEvents(token).catch(() => []),
        ]);
        setCommerces(comm);
        setEvents(evts);
        // Advertisements optional — skip if endpoint not ready
        getMyAdvertisements(token).then(setAdvertisements).catch(() => {});
      } catch (err) {
        console.error('Error cargando dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchAll();
  }, [token]);

  const statusBadge = (status) => {
    const map = {
      PENDING:   { label: 'Pendiente',  color: '#facc15', icon: <AlertCircle size={12} /> },
      APPROVED:  { label: 'Aprobado',   color: '#4ade80', icon: <CheckCircle size={12} /> },
      SCHEDULED: { label: 'Programado', color: '#4ade80', icon: <CheckCircle size={12} /> },
      REJECTED:  { label: 'Rechazado',  color: '#f87171', icon: <XCircle size={12} /> },
      CANCELLED: { label: 'Cancelado',  color: '#f87171', icon: <XCircle size={12} /> },
      FINISHED:  { label: 'Finalizado', color: '#a0a0c0', icon: <Clock size={12} /> },
      ACTIVE:    { label: 'Activo',     color: '#4ade80', icon: <CheckCircle size={12} /> },
      INACTIVE:  { label: 'Inactivo',   color: '#a0a0c0', icon: <Clock size={12} /> },
    };
    return map[status] || { label: status || '—', color: '#a0a0c0', icon: null };
  };

  const tierBadge = (tier) => {
    if (tier === 3) return { label: 'PREMIUM', color: '#FFD700', icon: <Crown size={11} /> };
    if (tier === 2) return { label: 'PLUS',    color: '#38bdf8', icon: <Zap size={11} /> };
    return null;
  };

  const paymentBadge = (ps) => {
    if (ps === 'VALIDATED') return { label: 'Pago OK', color: '#4ade80' };
    if (ps === 'REJECTED')  return { label: 'Pago Rechazado', color: '#f87171' };
    if (ps === 'PENDING')   return { label: 'Pago Pendiente', color: '#facc15' };
    return null;
  };

  const planLabel = (level) => {
    const map = { 1: 'Free', 2: 'Plus', 3: 'Premium', 4: 'Diamond' };
    return map[level] || `Plan ${level}`;
  };

  const tabs = [
    { key: 'events',        label: 'Mis Eventos',      icon: <Calendar size={16} />,  count: events.length },
    { key: 'commerces',     label: 'Mis Comercios',    icon: <Store size={16} />,     count: commerces.length },
    { key: 'advertisements', label: 'Publicidades',    icon: <Megaphone size={16} />, count: advertisements.length },
  ];

  return (
    <div className="my-commerces-wrapper hub-theme">
      <Navbar />
      <div className="my-commerces-container">

        {/* Header */}
        <header className="page-neo-header">
          <div className="header-title-neo">
            <div className="title-with-icon">
              <LayoutDashboard className="title-icon" />
              <h1>Mi Panel</h1>
            </div>
            <p>Todo tu contenido en Pandora, de un vistazo.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/events/create" className="btn-neo-success" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1.2rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', background: 'linear-gradient(135deg,#8a2be2,#ff2093)', color: '#fff' }}>
              <Calendar size={16} /> Nuevo Evento
            </Link>
            <Link to="/commerces/create" className="btn-neo-success" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1.2rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}>
              <Store size={16} /> Nuevo Comercio
            </Link>
          </div>
        </header>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
          {[
            { label: 'Eventos',    value: events.length,        icon: <Calendar size={20} />, color: '#8a2be2' },
            { label: 'Comercios',  value: commerces.length,     icon: <Store size={20} />,    color: '#38bdf8' },
            { label: 'Publicidades', value: advertisements.length, icon: <Megaphone size={20} />, color: '#FFD700' },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ color: stat.color, background: `${stat.color}18`, padding: '0.75rem', borderRadius: '12px' }}>
                {stat.icon}
              </div>
              <div>
                <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1 }}>{stat.value}</p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '2rem' }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '0.75rem 1.25rem', cursor: 'pointer',
                background: 'transparent', border: 'none',
                borderBottom: activeTab === tab.key ? '2px solid #8a2be2' : '2px solid transparent',
                color: activeTab === tab.key ? '#fff' : 'rgba(255,255,255,0.45)',
                fontWeight: activeTab === tab.key ? 700 : 500,
                fontSize: '0.9rem', transition: 'all 0.2s ease',
                marginBottom: '-1px',
              }}
            >
              {tab.icon} {tab.label}
              {tab.count > 0 && (
                <span style={{ background: activeTab === tab.key ? '#8a2be2' : 'rgba(255,255,255,0.1)', color: '#fff', padding: '1px 8px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner message="Cargando tu contenido..." />
        ) : (
          <>
            {/* EVENTOS */}
            {activeTab === 'events' && (
              <div>
                {events.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'rgba(255,255,255,0.4)' }}>
                    <Calendar size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Todavía no tenés eventos creados.</p>
                    <Link to="/events/create" style={{ padding: '0.7rem 1.5rem', background: 'linear-gradient(135deg,#8a2be2,#ff2093)', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: 700 }}>
                      Crear mi primer evento
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {events.map(event => {
                      const sb = statusBadge(event.status);
                      const tb = tierBadge(event.eventTier || 1);
                      const pb = event.eventTier > 1 ? paymentBadge(event.paymentStatus || 'PENDING') : null;
                      return (
                        <div key={event.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1rem 1.25rem', transition: 'all 0.2s ease' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(138,43,226,0.4)'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                        >
                          {event.coverImage && (
                            <img src={getAbsoluteImageUrl(event.coverImage)} alt={event.name} style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }} />
                          )}
                          {!event.coverImage && (
                            <div style={{ width: '56px', height: '56px', borderRadius: '10px', background: 'rgba(138,43,226,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Calendar size={22} style={{ color: '#8a2be2' }} />
                            </div>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>{event.name}</span>
                              {tb && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 8px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 800, background: `${tb.color}20`, color: tb.color, border: `1px solid ${tb.color}40` }}>
                                  {tb.icon} {tb.label}
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', flexWrap: 'wrap' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>
                                <Clock size={12} />
                                {event.startDate ? new Date(event.startDate).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}
                              </span>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700, background: `${sb.color}20`, color: sb.color }}>
                                {sb.icon} {sb.label}
                              </span>
                              {pb && (
                                <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700, background: `${pb.color}20`, color: pb.color }}>
                                  {pb.label}
                                </span>
                              )}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                            <Link to={`/event/${event.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(56,189,248,0.15)', color: '#38bdf8', textDecoration: 'none', transition: 'background 0.2s' }} title="Ver evento">
                              <Eye size={16} />
                            </Link>
                            <Link to={`/events/${event.id}/edit`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(138,43,226,0.15)', color: '#a78bfa', textDecoration: 'none', transition: 'background 0.2s' }} title="Editar evento">
                              <Edit size={16} />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* COMERCIOS */}
            {activeTab === 'commerces' && (
              <div>
                {commerces.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'rgba(255,255,255,0.4)' }}>
                    <Store size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Todavía no tenés comercios registrados.</p>
                    <Link to="/commerces/create" style={{ padding: '0.7rem 1.5rem', background: 'linear-gradient(135deg,#8a2be2,#ff2093)', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: 700 }}>
                      Registrar mi comercio
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {commerces.map(commerce => {
                      const sb = statusBadge(commerce.status || 'ACTIVE');
                      return (
                        <div key={commerce.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1rem 1.25rem', transition: 'all 0.2s ease' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(56,189,248,0.4)'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                        >
                          {commerce.coverImage ? (
                            <img src={getAbsoluteImageUrl(commerce.coverImage)} alt={commerce.name} style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }} />
                          ) : (
                            <div style={{ width: '56px', height: '56px', borderRadius: '10px', background: 'rgba(56,189,248,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Store size={22} style={{ color: '#38bdf8' }} />
                            </div>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>{commerce.name}</span>
                              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '10px' }}>
                                {planLabel(commerce.planLevel)}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>
                                {commerce.category || 'Sin categoría'}
                              </span>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700, background: `${sb.color}20`, color: sb.color }}>
                                {sb.icon} {sb.label}
                              </span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                            <Link to={`/commerce/${commerce.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(56,189,248,0.15)', color: '#38bdf8', textDecoration: 'none' }} title="Ver comercio">
                              <Eye size={16} />
                            </Link>
                            <Link to={`/my-commerces`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(138,43,226,0.15)', color: '#a78bfa', textDecoration: 'none' }} title="Gestionar comercio">
                              <Edit size={16} />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* PUBLICIDADES */}
            {activeTab === 'advertisements' && (
              <div>
                {advertisements.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'rgba(255,255,255,0.4)' }}>
                    <Megaphone size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Todavía no tenés publicidades activas.</p>
                    <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.3)' }}>Contactá al equipo Pandora para gestionar tu publicidad.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {advertisements.map(ad => {
                      const sb = statusBadge(ad.isActive ? 'ACTIVE' : 'INACTIVE');
                      return (
                        <div key={ad.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1rem 1.25rem' }}>
                          {ad.imageUrl ? (
                            <img src={getAbsoluteImageUrl(ad.imageUrl)} alt={ad.title} style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }} />
                          ) : (
                            <div style={{ width: '56px', height: '56px', borderRadius: '10px', background: 'rgba(255,215,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Megaphone size={22} style={{ color: '#FFD700' }} />
                            </div>
                          )}
                          <div style={{ flex: 1 }}>
                            <span style={{ fontWeight: 700, color: '#fff', fontSize: '1rem', display: 'block' }}>{ad.title || 'Publicidad'}</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700, background: `${sb.color}20`, color: sb.color, marginTop: '4px' }}>
                              {sb.icon} {sb.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MyDashboardPage;
