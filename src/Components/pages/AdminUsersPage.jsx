import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
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
  User,
  UserCog,
  UserCheck,
  UserX,
  Loader2,
} from 'lucide-react';
import { getAdminUsers, getAdminUserContent, updateAdminUser } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import AdminTablePagination, { useAdminPagination } from '../admin/AdminTablePagination';
import AdminRowActionsMenu from '../admin/AdminRowActionsMenu';
import { getCategoryDisplayName } from '../../utils/categoryUtils.js';
import { formatEnumLabel, formatStatusLabel, formatPlanLevelLabel } from '../../utils/enumLabels.js';
import './AdminArticlesPage.css';
import './AdminUsersPage.css';

const ROLE_OPTIONS = [
  { value: 'USER', label: 'Usuario' },
  { value: 'OWNER', label: 'Propietario' },
  { value: 'ADMIN', label: 'Admin' },
];

const AdminUsersPage = () => {
  const { token } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [busyUserId, setBusyUserId] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);
  const [userContent, setUserContent] = useState(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentTab, setContentTab] = useState('events');
  const [draftRole, setDraftRole] = useState('USER');

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

  const syncSelectedFromList = (list, userId) => {
    const fresh = list.find((u) => u.id === userId);
    if (fresh) {
      setSelectedUser(fresh);
      setDraftRole(fresh.role || 'USER');
    }
  };

  const openUserDetail = async (user) => {
    setSelectedUser(user);
    setDraftRole(user.role || 'USER');
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

  const filteredUsers = users.filter((u) => {
    const matchSearch = !searchTerm
      || (u.name || '').toLowerCase().includes(searchTerm.toLowerCase())
      || (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const pagination = useAdminPagination(filteredUsers, 10);

  const refreshUsers = async () => {
    const data = await getAdminUsers(token);
    const list = Array.isArray(data) ? data : data.users || [];
    setUsers(list);
    return list;
  };

  const applyRoleChange = async (user, role) => {
    if (!user || !role || role === user.role) return;
    const label = ROLE_OPTIONS.find((r) => r.value === role)?.label || role;
    if (!window.confirm(`¿Cambiar el rol de ${user.name || user.email} a ${label}?`)) {
      setDraftRole(user.role || 'USER');
      return;
    }

    setBusyUserId(user.id);
    try {
      await updateAdminUser(user.id, { role }, token);
      showToast(`Rol actualizado a ${label}.`, 'success');
      const list = await refreshUsers();
      if (selectedUser?.id === user.id) syncSelectedFromList(list, user.id);
    } catch (err) {
      showToast(err.message || 'No se pudo cambiar el rol.', 'error');
      setDraftRole(user.role || 'USER');
    } finally {
      setBusyUserId(null);
    }
  };

  const handleToggleActive = async (user) => {
    const nextActive = user.isActive === false;
    const verb = nextActive ? 'activar' : 'desactivar';
    if (!window.confirm(`¿Seguro que querés ${verb} a ${user.name || user.email}?`)) return;

    setBusyUserId(user.id);
    try {
      await updateAdminUser(user.id, { isActive: nextActive }, token);
      showToast(nextActive ? 'Usuario activado.' : 'Usuario desactivado.', 'success');
      const list = await refreshUsers();
      if (selectedUser?.id === user.id) syncSelectedFromList(list, user.id);
    } catch (err) {
      showToast(err.message || 'No se pudo actualizar el estado.', 'error');
    } finally {
      setBusyUserId(null);
    }
  };

  const roleBadge = (role) => {
    const map = {
      ADMIN: { label: 'Admin', color: '#f87171' },
      OWNER: { label: 'Propietario', color: '#38bdf8' },
      USER: { label: 'Usuario', color: '#a0a0c0' },
    };
    return map[role] || { label: formatEnumLabel(role, 'Usuario'), color: '#a0a0c0' };
  };

  const statusBadge = (status) => {
    const map = {
      PENDING: { label: 'Pendiente', color: '#facc15', icon: <AlertCircle size={11} /> },
      APPROVED: { label: 'Aprobado', color: '#4ade80', icon: <CheckCircle size={11} /> },
      SCHEDULED: { label: 'Programado', color: '#4ade80', icon: <CheckCircle size={11} /> },
      REJECTED: { label: 'Rechazado', color: '#f87171', icon: <XCircle size={11} /> },
      ACTIVE: { label: 'Activo', color: '#4ade80', icon: <CheckCircle size={11} /> },
      INACTIVE: { label: 'Inactivo', color: '#a0a0c0', icon: <Clock size={11} /> },
      FINISHED: { label: 'Finalizado', color: '#a0a0c0', icon: <Clock size={11} /> },
      CANCELLED: { label: 'Cancelado', color: '#f87171', icon: <XCircle size={11} /> },
    };
    return map[status] || { label: formatStatusLabel(status) || '—', color: '#a0a0c0', icon: null };
  };

  const tierBadge = (tier) => {
    if (tier === 3) return { label: 'PREMIUM', color: '#FFD700', icon: <Crown size={10} /> };
    if (tier === 2) return { label: 'PLUS', color: '#38bdf8', icon: <Zap size={10} /> };
    return null;
  };

  const planLabel = (l) => formatPlanLevelLabel(l);

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
            <p>Ver contenido, cambiar rol y activar o desactivar cuentas.</p>
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
                  <th className="col-main">USUARIO</th>
                  <th className="hide-tablet col-meta">EMAIL</th>
                  <th className="hide-mobile col-meta">ROL</th>
                  <th className="hide-mobile col-status">ESTADO</th>
                  <th className="hide-tablet col-meta">CONTENIDO</th>
                  <th className="col-actions text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {pagination.pageItems.map((u) => {
                  const rb = roleBadge(u.role);
                  const inactive = u.isActive === false;
                  const busy = busyUserId === u.id;
                  return (
                    <tr key={u.id} className={busy ? 'admin-users-busy' : ''}>
                      <td className="col-main">
                        <div className="row-main-info">
                          <span className="row-title">{u.name || u.email}</span>
                          {u.dni && (
                            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>DNI: {u.dni}</span>
                          )}
                        </div>
                      </td>
                      <td className="hide-tablet col-meta">
                        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem' }}>{u.email}</span>
                      </td>
                      <td className="hide-mobile col-meta">
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: '20px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: `${rb.color}20`,
                          color: rb.color,
                          border: `1px solid ${rb.color}40`,
                        }}>
                          {rb.label}
                        </span>
                      </td>
                      <td className="hide-mobile col-status">
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: '20px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: inactive ? 'rgba(248,113,113,0.15)' : 'rgba(74,222,128,0.15)',
                          color: inactive ? '#f87171' : '#4ade80',
                          border: `1px solid ${inactive ? 'rgba(248,113,113,0.35)' : 'rgba(74,222,128,0.35)'}`,
                        }}>
                          {inactive ? 'Inactivo' : 'Activo'}
                        </span>
                      </td>
                      <td className="hide-tablet col-meta">
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {(u._count?.events || 0) > 0 && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
                              <Calendar size={12} /> {u._count.events}
                            </span>
                          )}
                          {(u._count?.commerces || 0) > 0 && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
                              <Store size={12} /> {u._count.commerces}
                            </span>
                          )}
                          {!u._count?.events && !u._count?.commerces && (
                            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.25)' }}>Sin contenido</span>
                          )}
                        </div>
                      </td>
                      <td className="col-actions text-right">
                        <AdminRowActionsMenu
                          label={`Acciones de ${u.name || u.email}`}
                          items={[
                            {
                              key: 'view',
                              label: 'Ver detalle',
                              icon: Eye,
                              tone: 'info',
                              onClick: () => openUserDetail(u),
                            },
                            {
                              key: 'manage',
                              label: 'Gestionar rol',
                              icon: UserCog,
                              onClick: () => openUserDetail(u),
                            },
                            {
                              key: 'toggle',
                              label: inactive ? 'Activar usuario' : 'Desactivar usuario',
                              icon: inactive ? UserCheck : UserX,
                              tone: inactive ? 'success' : 'danger',
                              disabled: busy,
                              onClick: () => handleToggleActive(u),
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.4)' }}>
                      No se encontraron usuarios.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <AdminTablePagination {...pagination} onPageSizeChange={pagination.setPageSize} />
          </div>
        )}
      </div>

      {selectedUser && (
        <div
          className="admin-users-drawer-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedUser(null); }}
        >
          <aside className="admin-users-drawer">
            <div className="admin-users-drawer-top">
              <div className="admin-users-drawer-identity">
                <div className="admin-users-avatar"><User size={22} /></div>
                <div>
                  <h2>{selectedUser.name || 'Sin nombre'}</h2>
                  <p>{selectedUser.email}</p>
                </div>
              </div>
              <button type="button" className="admin-users-close" onClick={() => setSelectedUser(null)} aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>

            <div className="admin-users-badges">
              {(() => {
                const rb = roleBadge(selectedUser.role);
                return (
                  <span className="admin-users-badge" style={{ background: `${rb.color}20`, color: rb.color, border: `1px solid ${rb.color}40` }}>
                    {rb.label}
                  </span>
                );
              })()}
              {selectedUser.dni && (
                <span className="admin-users-badge" style={{ color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.06)' }}>
                  DNI: {selectedUser.dni}
                </span>
              )}
              <span className="admin-users-badge" style={{ color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.04)' }}>
                ID #{selectedUser.id}
              </span>
              <span
                className="admin-users-badge"
                style={{
                  color: selectedUser.isActive === false ? '#f87171' : '#4ade80',
                  background: selectedUser.isActive === false ? 'rgba(248,113,113,0.15)' : 'rgba(74,222,128,0.15)',
                  border: `1px solid ${selectedUser.isActive === false ? 'rgba(248,113,113,0.35)' : 'rgba(74,222,128,0.35)'}`,
                }}
              >
                {selectedUser.isActive === false ? 'Inactivo' : 'Activo'}
              </span>
            </div>

            <div className={`admin-users-manage ${busyUserId === selectedUser.id ? 'admin-users-busy' : ''}`}>
              <div className="admin-users-manage-row">
                <label htmlFor="admin-user-role">Cambiar rol</label>
                <select
                  id="admin-user-role"
                  className="admin-users-role-select"
                  value={draftRole}
                  disabled={busyUserId === selectedUser.id}
                  onChange={(e) => {
                    const next = e.target.value;
                    setDraftRole(next);
                    applyRoleChange(selectedUser, next);
                  }}
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="admin-users-manage-row">
                <label>Estado de la cuenta</label>
                <button
                  type="button"
                  className={`admin-users-action-btn ${selectedUser.isActive === false ? 'activate' : 'deactivate'}`}
                  disabled={busyUserId === selectedUser.id}
                  onClick={() => handleToggleActive(selectedUser)}
                >
                  {busyUserId === selectedUser.id ? (
                    <><Loader2 size={16} className="spinning" /> Guardando…</>
                  ) : selectedUser.isActive === false ? (
                    <><UserCheck size={16} /> Activar usuario</>
                  ) : (
                    <><UserX size={16} /> Desactivar usuario</>
                  )}
                </button>
              </div>
            </div>

            <div className="admin-users-tabs">
              {[
                { key: 'events', label: 'Eventos', icon: <Calendar size={14} />, count: userContent?.events?.length || 0 },
                { key: 'commerces', label: 'Comercios', icon: <Store size={14} />, count: userContent?.commerces?.length || 0 },
                { key: 'advertisements', label: 'Publicidades', icon: <Megaphone size={14} />, count: userContent?.advertisements?.length || 0 },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`admin-users-tab ${contentTab === tab.key ? 'on' : ''}`}
                  onClick={() => setContentTab(tab.key)}
                >
                  {tab.icon} {tab.label}
                  {tab.count > 0 && <span className="admin-users-tab-count">{tab.count}</span>}
                </button>
              ))}
            </div>

            {contentLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <LoadingSpinner message="Cargando contenido..." />
              </div>
            ) : (
              <>
                {contentTab === 'events' && (
                  <div>
                    {(!userContent?.events || userContent.events.length === 0) ? (
                      <p className="admin-users-empty">Sin eventos vinculados</p>
                    ) : userContent.events.map((ev) => {
                      const sb = statusBadge(ev.status);
                      const tb = tierBadge(ev.eventTier || 1);
                      return (
                        <div key={ev.id} className="admin-users-item">
                          <div className="admin-users-item-row">
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <span className="admin-users-item-title">{ev.name}</span>
                                {tb && (
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '1px 7px', borderRadius: '10px', fontSize: '0.62rem', fontWeight: 800, background: `${tb.color}20`, color: tb.color }}>
                                    {tb.icon} {tb.label}
                                  </span>
                                )}
                              </div>
                              <div className="admin-users-item-meta">
                                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                                  {ev.startDate ? new Date(ev.startDate).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}
                                </span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '1px 7px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 700, background: `${sb.color}20`, color: sb.color }}>
                                  {sb.icon} {sb.label}
                                </span>
                              </div>
                            </div>
                            <div className="admin-users-mini-links">
                              <Link to={`/event/${ev.id}`} className="view" title="Ver evento"><Eye size={14} /></Link>
                              <Link to={`/events/${ev.id}/edit`} className="edit" title="Editar"><Calendar size={14} /></Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {contentTab === 'commerces' && (
                  <div>
                    {(!userContent?.commerces || userContent.commerces.length === 0) ? (
                      <p className="admin-users-empty">Sin comercios vinculados</p>
                    ) : userContent.commerces.map((c) => {
                      const sb = statusBadge(c.status || 'ACTIVE');
                      return (
                        <div key={c.id} className="admin-users-item">
                          <div className="admin-users-item-row">
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span className="admin-users-item-title">{c.name}</span>
                                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)', padding: '1px 7px', borderRadius: '8px' }}>
                                  {planLabel(c.planLevel)}
                                </span>
                              </div>
                              <div className="admin-users-item-meta">
                                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{getCategoryDisplayName(c.category)}</span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '1px 7px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 700, background: `${sb.color}20`, color: sb.color }}>
                                  {sb.icon} {sb.label}
                                </span>
                              </div>
                            </div>
                            <div className="admin-users-mini-links">
                              <Link to={`/commerce/${c.id}`} className="view" title="Ver comercio"><Eye size={14} /></Link>
                              <Link to={`/admin/commerces/${c.id}/detail`} className="edit" title="Detalle admin"><Store size={14} /></Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {contentTab === 'advertisements' && (
                  <div>
                    {(!userContent?.advertisements || userContent.advertisements.length === 0) ? (
                      <p className="admin-users-empty">Sin publicidades vinculadas</p>
                    ) : userContent.advertisements.map((ad) => (
                      <div key={ad.id} className="admin-users-item">
                        <span className="admin-users-item-title">{ad.title || `Publicidad #${ad.id}`}</span>
                        <div className="admin-users-item-meta">
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
          </aside>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdminUsersPage;
