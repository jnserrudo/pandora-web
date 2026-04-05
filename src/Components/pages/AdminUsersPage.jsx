// src/Components/pages/AdminUsersPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  ChevronLeft,
  Eye,
  Calendar,
  Store,
  Megaphone,
  Crown,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  X,
  User
} from 'lucide-react';
import { getAdminUsers, getAdminUserContent } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import './AdminArticlesPage.css';

const AdminUsersPage = () => {
  const { token } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Panel de detalle de usuario
  const [selectedUser, setSelectedUser] = useState(null);
  const [userContent, setUserContent] = useState(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentTab, setContentTab] = useState('events');

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await getAdminUsers(token);
        setUsers(Array.isArray(data) ? data : data.users || []);
      } catch (err) {
        setError('Error cargando usuarios.');
        showToast('Error cargando usuarios.', 'error');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetch();
  }, [token]);

  const openUserDetail = async (user) => {
    setSelectedUser(user);
    setUserContent(null);
    setContentTab('events');
    setContentLoading(true);
    try {
      const data = await getAdminUserContent(user.id, token);
      setUserContent(data);
    } catch {
      setUserContent({ events: [], commerces: [], advertisements: [] });
    } finally {
      setContentLoading(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = !searchTerm ||
      (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const roleBadge = (role) => {
    const map = {
      ADMIN: { label: 'Admin',      color: '#f87171' },
      OWNER: { label: 'Propietario', color: '#38bdf8' },
      USER:  { label: 'Usuario',    color: '#a0a0c0' },
    };
    return map[role] || { label: role, color: '#a0a0c0' };
  };

  const statusBadge = (status) => {
    const map = {
      PENDING:   { label: 'Pendiente',  color: '#facc15', icon: <AlertCircle size={11} /> },
      APPROVED:  { label: 'Aprobado',   color: '#4ade80', icon: <CheckCircle size={11} /> },
      SCHEDULED: { label: 'Programado', color: '#4ade80', icon: <CheckCircle size={11} /> },
      REJECTED:  { label: 'Rechazado',  color: '#f87171', icon: <XCircle size={11} /> },
      ACTIVE:    { label: 'Activo',     color: '#4ade80', icon: <CheckCircle size={11} /> },
      INACTIVE:  { label: 'Inactivo',   color: '#a0a0c0', icon: <Clock size={11} /> },
      FINISHED:  { label: 'Finalizado', color: '#a0a0c0', icon: <Clock size={11} /> },
      CANCELLED: { label: 'Cancelado',  color: '#f87171', icon: <XCircle size={11} /> },
    };
    return map[status] || { label: status || '—', color: '#a0a0c0', icon: null };
  };

  const tierBadge = (tier) => {
    if (tier === 3) return { label: 'PREMIUM', color: '#FFD700', icon: <Crown size={10} /> };
    if (tier === 2) return { label: 'PLUS',    color: '#38bdf8', icon: <Zap size={10} /> };
    return null;
  };

  const planLabel = (l) => ({ 1: 'Free', 2: 'Plus', 3: 'Premium', 4: 'Diamond' }[l] || `Plan ${l}`);

  return (
    <div className="admin-wrapper hub-theme">
      <Navbar />
      <div className="admin-container">

        <header className="admin-header-premium">
          <div className="admin-title-group">
            <Link to="/admin/dashboard" className="back-link">
              <ChevronLeft size={20} /> Volver al Panel
            </Link>
            <h1>Gestión de Usuarios</h1>
          </div>
        </header>

        {loading ? (
          <LoadingSpinner message="Cargando usuarios..." />
        ) : error ? (
          <div className="hub-error-card">{error}</div>
        ) : (
          <div className="admin-table-wrapper-premium">
            <div className="table-filters-premium" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
              <div className="search-bar-premium">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select className="btn-filter-premium" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="ALL">Todos los roles</option>
                <option value="USER">Usuarios</option>
                <option value="OWNER">Propietarios</option>
                <option value="ADMIN">Admins</option>
              </select>
            </div>

            <table className="admin-table-premium">
              <thead>
                <tr>
                  <th>USUARIO</th>
                  <th className="hide-mobile">EMAIL</th>
                  <th className="hide-mobile">ROL</th>
                  <th className="hide-mobile">CONTENIDO</th>
                  <th className="text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => {
                  const rb = roleBadge(u.role);
                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="row-main-info">
                          <span className="row-title">
                            {u.name || u.email}
                          </span>
                          {u.dni && (
                            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>DNI: {u.dni}</span>
                          )}
                        </div>
                      </td>
                      <td className="hide-mobile">
                        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem' }}>{u.email}</span>
                      </td>
                      <td className="hide-mobile">
                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, background: `${rb.color}20`, color: rb.color, border: `1px solid ${rb.color}40` }}>
                          {rb.label}
                        </span>
                      </td>
                      <td className="hide-mobile">
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {u._count?.events > 0 && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
                              <Calendar size={12} /> {u._count.events}
                            </span>
                          )}
                          {u._count?.commerces > 0 && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
                              <Store size={12} /> {u._count.commerces}
                            </span>
                          )}
                          {!u._count?.events && !u._count?.commerces && (
                            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.25)' }}>Sin contenido</span>
                          )}
                        </div>
                      </td>
                      <td className="text-right">
                        <div className="action-icons-group">
                          <button
                            onClick={() => openUserDetail(u)}
                            className="btn-action-premium view"
                            title="Ver contenido del usuario"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.4)' }}>
                      No se encontraron usuarios.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="table-footer-premium">
              <p>Total: {filteredUsers.length} de {users.length} usuarios</p>
            </div>
          </div>
        )}
      </div>

      {/* Panel lateral de detalle de usuario */}
      {selectedUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', justifyContent: 'flex-end' }}
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedUser(null); }}
        >
          <div style={{ width: '100%', maxWidth: '560px', background: '#0f0f1a', borderLeft: '1px solid rgba(255,255,255,0.1)', height: '100vh', overflowY: 'auto', padding: '2rem' }}>

            {/* Header del panel */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.5rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(138,43,226,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={22} style={{ color: '#8a2be2' }} />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>{selectedUser.name || 'Sin nombre'}</h2>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>{selectedUser.email}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {(() => { const rb = roleBadge(selectedUser.role); return (
                    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, background: `${rb.color}20`, color: rb.color, border: `1px solid ${rb.color}40` }}>
                      {rb.label}
                    </span>
                  );})()}
                  {selectedUser.dni && (
                    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.06)' }}>
                      DNI: {selectedUser.dni}
                    </span>
                  )}
                  <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.04)' }}>
                    ID #{selectedUser.id}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} />
              </button>
            </div>

            {/* Tabs del panel */}
            <div style={{ display: 'flex', gap: '0.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.5rem' }}>
              {[
                { key: 'events',        label: 'Eventos',     icon: <Calendar size={14} />,  count: userContent?.events?.length || 0 },
                { key: 'commerces',     label: 'Comercios',   icon: <Store size={14} />,     count: userContent?.commerces?.length || 0 },
                { key: 'advertisements', label: 'Publicidades', icon: <Megaphone size={14} />, count: userContent?.advertisements?.length || 0 },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setContentTab(tab.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '0.6rem 0.9rem', cursor: 'pointer',
                    background: 'transparent', border: 'none',
                    borderBottom: contentTab === tab.key ? '2px solid #8a2be2' : '2px solid transparent',
                    color: contentTab === tab.key ? '#fff' : 'rgba(255,255,255,0.4)',
                    fontWeight: contentTab === tab.key ? 700 : 500,
                    fontSize: '0.82rem', marginBottom: '-1px',
                  }}
                >
                  {tab.icon} {tab.label}
                  {tab.count > 0 && (
                    <span style={{ background: contentTab === tab.key ? '#8a2be2' : 'rgba(255,255,255,0.1)', color: '#fff', padding: '1px 6px', borderRadius: '10px', fontSize: '0.7rem' }}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {contentLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <LoadingSpinner message="Cargando contenido..." />
              </div>
            ) : (
              <>
                {/* Eventos del usuario */}
                {contentTab === 'events' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {(!userContent?.events || userContent.events.length === 0) ? (
                      <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '2rem' }}>Sin eventos</p>
                    ) : userContent.events.map(ev => {
                      const sb = statusBadge(ev.status);
                      const tb = tierBadge(ev.eventTier || 1);
                      return (
                        <div key={ev.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{ev.name}</span>
                                {tb && (
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '1px 7px', borderRadius: '10px', fontSize: '0.62rem', fontWeight: 800, background: `${tb.color}20`, color: tb.color }}>
                                    {tb.icon} {tb.label}
                                  </span>
                                )}
                              </div>
                              <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                                  {ev.startDate ? new Date(ev.startDate).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}
                                </span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '1px 7px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 700, background: `${sb.color}20`, color: sb.color }}>
                                  {sb.icon} {sb.label}
                                </span>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                              <Link to={`/event/${ev.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '6px', background: 'rgba(56,189,248,0.15)', color: '#38bdf8', textDecoration: 'none' }} title="Ver evento">
                                <Eye size={14} />
                              </Link>
                              <Link to={`/events/${ev.id}/edit`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '6px', background: 'rgba(138,43,226,0.15)', color: '#a78bfa', textDecoration: 'none' }} title="Editar">
                                <Calendar size={14} />
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Comercios del usuario */}
                {contentTab === 'commerces' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {(!userContent?.commerces || userContent.commerces.length === 0) ? (
                      <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '2rem' }}>Sin comercios</p>
                    ) : userContent.commerces.map(c => {
                      const sb = statusBadge(c.status || 'ACTIVE');
                      return (
                        <div key={c.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{c.name}</span>
                                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)', padding: '1px 7px', borderRadius: '8px' }}>
                                  {planLabel(c.planLevel)}
                                </span>
                              </div>
                              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{c.category || 'Sin categoría'}</span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '1px 7px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 700, background: `${sb.color}20`, color: sb.color }}>
                                  {sb.icon} {sb.label}
                                </span>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <Link to={`/commerce/${c.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '6px', background: 'rgba(56,189,248,0.15)', color: '#38bdf8', textDecoration: 'none' }} title="Ver comercio">
                                <Eye size={14} />
                              </Link>
                              <Link to={`/admin/commerces/${c.id}/detail`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '6px', background: 'rgba(138,43,226,0.15)', color: '#a78bfa', textDecoration: 'none' }} title="Admin detail">
                                <Store size={14} />
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Publicidades del usuario */}
                {contentTab === 'advertisements' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {(!userContent?.advertisements || userContent.advertisements.length === 0) ? (
                      <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '2rem' }}>Sin publicidades</p>
                    ) : userContent.advertisements.map(ad => (
                      <div key={ad.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '0.85rem 1rem' }}>
                        <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{ad.title || `Publicidad #${ad.id}`}</span>
                        <div style={{ marginTop: '4px' }}>
                          <span style={{ fontSize: '0.75rem', color: ad.isActive ? '#4ade80' : '#a0a0c0' }}>
                            {ad.isActive ? '● Activa' : '● Inactiva'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdminUsersPage;
