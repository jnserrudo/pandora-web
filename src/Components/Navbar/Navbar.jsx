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
import { 
  getNotifications, 
  markNotificationAsRead,
  markAllNotificationsAsRead 
} from '../../services/NotificationService';
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
  const [stats, setStats] = useState({ articles: 0, events: 0, commerces: 0, plans: 0 });

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

  const handleNotificationClick = async (notif) => {
    // Marcar como leída si no lo está
    if (!notif.isRead) {
      try {
        await markNotificationAsRead(notif.id, token);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
      } catch (err) {
        console.error("Error marking as read:", err);
      }
    }

    // Navegar según el tipo de notificación
    switch (notif.type) {
      case 'NEW_COMMERCE_REQUEST':
        navigate('/admin/commerces');
        break;
      case 'COMMERCE_VALIDATED':
        navigate('/my-commerces');
        break;
      case 'NEW_SUBMISSION':
        navigate('/admin/submissions');
        break;
      case 'SUBMISSION_UPDATED':
        navigate('/my-submissions');
        break;
      case 'NEW_COMMERCE_COMMENT':
        navigate(`/admin/commerces/${notif.referenceId}/detail#feedback-section`);
        break;
      case 'NEW_COMMERCE_ADVISORY':
        navigate('/my-commerces');
        break;
      default:
        console.log("Notificación sin ruta asignada:", notif.type);
    }

    setShowNotifications(false);
  };
  
  const handleMarkAllRead = async () => {
    if (!token) return;
    try {
      await markAllNotificationsAsRead(token);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Error marking all as read:", err);
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
          <img src="/logo_pandora1.png" alt="Pandora Logo" className="navbar-logo-img" />
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
            <Link to="/pricing" className={`nav-link ${isActive('/pricing') ? 'active' : ''}`}>
              Planes <span className="nav-stat">({stats.plans})</span>
            </Link>
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
                        <div className="header-titles">
                          <h3>Notificaciones</h3>
                          {unreadCount > 0 && <span className="unread-count">{unreadCount} nuevas</span>}
                        </div>
                        {unreadCount > 0 && (
                          <button 
                            className="btn-mark-all-read"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAllRead();
                            }}
                          >
                            Marcar todas como leídas
                          </button>
                        )}
                      </div>
                      <div className="notifications-list">
                        {notifications.length === 0 ? (
                          <div className="empty-notifications">No tienes avisos nuevos</div>
                        ) : (
                          notifications.map(n => (
                            <div 
                              key={n.id} 
                              className={`notification-item ${n.isRead ? 'read' : 'unread'}`}
                              onClick={() => handleNotificationClick(n)}
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
                {(user?.role === 'OWNER' || user?.role === 'ADMIN') ? (
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
                ) : (
                  /* Botón para Usuarios que quieren ser Owners */
                  <Link to="/commerces/create" className="join-partner-btn">
                    <PlusCircle size={18} />
                    <span>Sumar mi Comercio</span>
                  </Link>
                )}

                {/* Acceso Admin */}
                {user?.role === 'ADMIN' && (
                  <Link to="/admin/dashboard" className="admin-access-btn" title="Panel de Administración">
                    <LayoutDashboard size={20} />
                    <span>Admin</span>
                  </Link>
                )}

                {/* Perfil de Usuario con Dropdown al hacer Hover */}
                <div className="user-profile-menu-container">
                  <div className="profile-trigger">
                    <div className="avatar-placeholder">
                      <User size={16} />
                    </div>
                    <div className="user-name-wrapper">
                      <span className="user-name">{user?.name}</span>
                      <ChevronDown size={14} className="chevron-icon" />
                    </div>
                  </div>
                  
                  <div className="profile-dropdown-content">
                    <div className="dropdown-user-header">
                      <span className="user-role-badge">{user?.role}</span>
                      <span className="user-email">{user?.email}</span>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link to="/profile" className="dropdown-item" onClick={closeMenu}>
                      <User size={16} />
                      <span>Mi Perfil</span>
                    </Link>
                    <Link to="/my-dashboard" className="dropdown-item" onClick={closeMenu}>
                      <LayoutDashboard size={16} />
                      <span>Mi Panel</span>
                    </Link>
                    <Link to="/my-submissions" className="dropdown-item" onClick={closeMenu}>
                      <Inbox size={16} />
                      <span>Mis Mensajes</span>
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogout} className="dropdown-item logout-item">
                      <LogOut size={16} />
                      <span>Cerrar Sesión</span>
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

        {/* Botón Móvil - solo hamburguesa */}
        <button 
          className={`mobile-toggle ${isMenuOpen ? 'hidden' : ''}`} 
          onClick={() => setIsMenuOpen(true)}
        >
          <Menu size={28} />
        </button>
      </nav>

      {/* Menú Móvil - fuera del nav para evitar overflow:hidden */}
      <div className={`mobile-menu ${isMenuOpen ? 'menu-open' : ''}`}>
        <button className="mobile-close-btn" onClick={closeMenu}>
          <X size={28} />
        </button>
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
          <Link to="/pricing" onClick={closeMenu}>
            Planes <span className="m-stat">({stats.plans})</span>
          </Link>
          
          {isAuthenticated && (
            <>
              <div className="mobile-divider"></div>
              <Link to="/my-dashboard" onClick={closeMenu}>Mi Panel</Link>
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
    </header>
  );
};

export default Navbar;
