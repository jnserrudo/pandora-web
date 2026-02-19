import React from 'react';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Edit, 
  LogOut,
  Settings,
  Store,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyFavorites, getAbsoluteImageUrl } from '../../services/api';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import './UserProfilePage.css';

const UserProfilePage = () => {
  const { user, token, logout } = useAuth();
  const [favorites, setFavorites] = React.useState([]);
  const [loadingFavs, setLoadingFavs] = React.useState(true);

  React.useEffect(() => {
    const fetchFavs = async () => {
      if (token) {
        try {
          const data = await getMyFavorites(token);
          setFavorites(data);
        } catch (err) {
          console.error("Error fetching favorites:", err);
        } finally {
          setLoadingFavs(false);
        }
      }
    };
    fetchFavs();
  }, [token]);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="profile-wrapper hub-theme">
      <Navbar />
      
      <div className="profile-container">
        {/* Header de Perfil */}
        <div className="profile-header-premium">
          <div className="profile-avatar-large">
            <User size={80} strokeWidth={1} />
          </div>
          
          <div className="profile-info-main">
            <div className="profile-role-badge">
              <Shield size={14} />
              <span>{user?.role || 'USUARIO'}</span>
            </div>
            <h1>{user?.name || user?.username}</h1>
            <p className="profile-tagline">Miembro de la comunidad Pandora</p>
          </div>
        </div>

        {/* Dashboard de Actividad */}
        <div className="profile-dashboard-grid">
          <div className="stat-card-premium">
            <div className="stat-icon"><Star size={24} strokeWidth={2} /></div>
            <span className="stat-value">Activa</span>
            <span className="stat-label">Socio Pandora</span>
          </div>
          <div className="stat-card-premium">
            <div className="stat-icon"><Store size={24} /></div>
            <span className="stat-value">{favorites.length}</span>
            <span className="stat-label">Favoritos</span>
          </div>
          <div className="stat-card-premium">
            <div className="stat-icon"><Calendar size={24} /></div>
            <span className="stat-value">{new Date().getFullYear()}</span>
            <span className="stat-label">Sesión Actual</span>
          </div>
        </div>

        {/* Sección de Favoritos */}
        <div className="profile-section-favorites">
          <div className="section-title-group">
            <Store className="title-icon" />
            <h2>Mis Lugares Guardados</h2>
          </div>
          
          {loadingFavs ? (
            <div className="favs-loader">Buscando tus favoritos...</div>
          ) : favorites.length === 0 ? (
            <div className="empty-favorites-state">
              <p>Aún no tienes comercios favoritos.</p>
              <Link to="/commerces" className="btn-explore">Explorar Comercios</Link>
            </div>
          ) : (
            <div className="favorites-grid-mini">
              {favorites.map((fav) => (
                <Link to={`/commerce/${fav.commerceId}`} key={fav.id} className="fav-card-mini">
                  <img 
                    src={fav.commerce?.coverImage ? getAbsoluteImageUrl(fav.commerce.coverImage) : "https://placehold.co/150x150/0d0218/ffffff/png?text=Pandora"} 
                    alt={fav.commerce?.name} 
                  />
                  <div className="fav-mini-info">
                    <h4>{fav.commerce?.name}</h4>
                    <span>{fav.commerce?.category?.replace('_', ' ')}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Detalles y Configuración */}
        <div className="profile-content-sections">
          <div className="settings-card">
            <h3><Settings size={20} /> Información de la Cuenta</h3>
            
            <div className="info-item">
              <label>Nombre de Usuario</label>
              <p>@{user?.username}</p>
            </div>
            
            <div className="info-item">
              <label>Correo Electrónico</label>
              <p>{user?.email}</p>
            </div>

            <button className="btn-edit-profile">
              <Edit size={18} />
              Editar Información
            </button>
          </div>

          <div className="profile-quick-actions">
            <div className="settings-card">
              <h3>Opciones</h3>
              <button 
                onClick={handleLogout} 
                className="btn-edit-profile" 
                style={{ color: '#ff2093', borderColor: 'rgba(255, 32, 147, 0.2)' }}
              >
                <LogOut size={18} />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default UserProfilePage;
