import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  User, 
  LogOut, 
  Store, 
  PlusCircle, 
  ShieldCheck, 
  ChevronDown, 
  Menu, 
  X,
  LayoutDashboard,
  Bell,
  Inbox,
  Ticket
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getNotifications, markNotificationAsRead } from '../../services/NotificationService';
import { getPublicStats } from '../../services/api'; 
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout, loading, token } = useAuth(); // Added token
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [stats, setStats] = useState({ articles: 0, events: 0, commerces: 0 });

  const fetchStats = async () => {
    try {
      const data = await getPublicStats();
      console.log("Navbar Stats Received:", data);
      if (data) {
          setStats(data);
          console.log("Navbar Stats Applied:", data);
      }
    } catch (err) {
      console.warn("Failed to fetch nav stats", err);
    }
  };

  const fetchNotifications = async () => {
    if (isAuthenticated && token) {
      const data = await getNotifications(token);
      setNotifications(data);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchNotifications();
    const statsInterval = setInterval(fetchStats, 30000); // 30 sec
    const notifInterval = setInterval(fetchNotifications, 60000); // 1 min
    return () => {
      clearInterval(statsInterval);
      clearInterval(notifInterval);
    };
  }, [isAuthenticated, token]);

  const handleMarkAsRead = async (id, isRead) => {
    if (isRead) return;
    try {
      await markNotificationAsRead(id, token);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Error marking as read:", err);
      // Fallback local por si falla el backend
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className={`navbar-container ${isScrolled ? 'scrolled' : ''}`}>
      <nav className="navbar-content">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          PANDORA
        </Link>

        {/* Menú de escritorio */}
        <div className="desktop-menu">
          <div className="navbar-main-links">
            <Link to="/magazine" className={`nav-link ${isActive('/magazine') ? 'active' : ''}`}>
              Revista <span className="nav-stat">({stats.articles})</span>
            </Link>
            <Link to="/events" className={`nav-link ${isActive('/events') ? 'active' : ''}`}>
              Eventos <span className="nav-stat">({stats.events})</span>
            </Link>
            <Link to="/commerces" className={`nav-link ${isActive('/commerces') ? 'active' : ''}`}>
              Comercios <span className="nav-stat">({stats.commerces})</span>
            </Link>
            <Link to="/pricing" className={`nav-link ${isActive('/pricing') ? 'active' : ''}`}>Planes</Link>
          </div>

          <div className="navbar-actions">
            {loading ? (
              <div className="loader-sm"></div>
            ) : isAuthenticated ? (
              <div className="auth-user-nav">
                {/* Notificaciones */}
                <div className="notifications-wrapper">
                  <button 
                    className={`btn-notifications ${showNotifications ? 'active' : ''}`}
                    onClick={() => setShowNotifications(!showNotifications)}
                    title="Notificaciones"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                  </button>

                  {showNotifications && (
                    <div className="notifications-dropdown">
                      <div className="dropdown-header">
                        <h3>Notificaciones</h3>
                        {unreadCount > 0 && <span className="unread-count">{unreadCount} nuevas</span>}
                      </div>
                      <div className="notifications-list">
                        {notifications.length === 0 ? (
                          <div className="empty-notifications">No tienes avisos nuevos</div>
                        ) : (
                          notifications.map(n => (
                            <div 
                              key={n.id} 
                              className={`notification-item ${n.isRead ? 'read' : 'unread'}`}
                              onClick={() => handleMarkAsRead(n.id, n.isRead)}
                            >
                              <div className="notif-content">
                                <p>{n.message}</p>
                                <span className="notif-time">{new Date(n.createdAt).toLocaleDateString()}</span>
                              </div>
                              {!n.isRead && <div className="unread-dot"></div>}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Opciones de Gestión (ADMIN/OWNER) */}
                {(user?.role === 'OWNER' || user?.role === 'ADMIN') && (
                  <div className="management-group">
                    <Link to="/my-commerces" className="management-link" title="Mis Comercios">
                      <Store size={20} />
                      <span>Mis Comercios</span>
                    </Link>
                    <Link to="/events/create" className="management-link" title="Crear Evento">
                      <PlusCircle size={20} />
                      <span>Nuevo Evento</span>
                    </Link>
                  </div>
                )}

                {/* Acceso Admin */}
                {user?.role === 'ADMIN' && (
                  <Link to="/admin/dashboard" className="admin-access-btn" title="Panel de Administración">
                    <LayoutDashboard size={20} />
                    <span>Admin</span>
                  </Link>
                )}

                {/* Perfil de Usuario Integrado */}
                <div className="user-profile-dropdown">
                  <div className="user-info-side">
                    <span className="user-role-tag">{user?.role}</span>
                    <Link to="/profile" className="profile-link">
                      <div className="avatar-placeholder">
                        <User size={16} />
                      </div>
                      <span className="user-name">{user?.name}</span>
                    </Link>
                  </div>

                  <div className="user-actions-side">
                    <Link to="/my-submissions" className="icon-action-btn" title="Mis Mensajes">
                      <Inbox size={18} />
                    </Link>
                    <button onClick={handleLogout} className="btn-logout-icon" title="Cerrar Sesión">
                      <LogOut size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="auth-buttons">
                <div className="visitor-badge">MODO VISITANTE</div>
                <Link to="/login" className="login-button">Ingresar</Link>
                <Link to="/register" className="register-button">Registrarse</Link>
              </div>
            )}
          </div>
        </div>

        {/* Botón Móvil */}
        <button className="mobile-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

         {/* Menú Móvil */}
        <div className={`mobile-menu ${isMenuOpen ? 'menu-open' : ''}`}>
          <div className="mobile-links">
            <Link to="/magazine" onClick={closeMenu}>
              Revista <span className="m-stat">({stats.articles})</span>
            </Link>
            <Link to="/events" onClick={closeMenu}>
              Eventos <span className="m-stat">({stats.events})</span>
            </Link>
            <Link to="/commerces" onClick={closeMenu}>
              Comercios <span className="m-stat">({stats.commerces})</span>
            </Link>
            <Link to="/pricing" onClick={closeMenu}>Planes</Link>
            
            {isAuthenticated && (
              <>
                <div className="mobile-divider"></div>
                {(user?.role === 'OWNER' || user?.role === 'ADMIN') && (
                  <div className="mobile-mgmt-row">
                    <Link to="/my-commerces" onClick={closeMenu}>Locales</Link>
                    <Link to="/events/create" onClick={closeMenu}>+ Evento</Link>
                  </div>
                )}
                {user?.role === 'ADMIN' && (
                  <Link to="/admin/dashboard" className="mobile-admin-link" onClick={closeMenu}>Panel Admin</Link>
                )}
                <Link to="/profile" onClick={closeMenu}>Mi Perfil</Link>
                <button onClick={handleLogout} className="mobile-logout-btn">Cerrar Sesión</button>
              </>
            )}

            {!isAuthenticated && (
              <>
                <div className="mobile-divider"></div>
                <div className="mobile-auth-row">
                  <Link to="/login" onClick={closeMenu}>Ingresar</Link>
                  <Link to="/register" className="m-register-btn" onClick={closeMenu}>Registrarse</Link>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
