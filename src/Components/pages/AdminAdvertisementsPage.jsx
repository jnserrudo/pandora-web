// src/Components/pages/AdminAdvertisementsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Megaphone, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Edit3,
  Trash2,
  Calendar,
  Layers,
  Activity
} from 'lucide-react';
import { getAdvertisements, toggleAdvertisementStatus } from '../../services/AdvertisementService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import './AdminArticlesPage.css';

const AdminAdvertisementsPage = () => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      const data = await getAdvertisements({});
      setAdvertisements(data);
    } catch (err) {
      console.error("Error fetching advertisements:", err);
      setError("Error cargando publicidades.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvertisements();
  }, [token]);

  const handleToggleStatus = async (id, currentStatus) => {
    if (!window.confirm(`¿Seguro que deseas ${currentStatus ? 'pausar' : 'activar'} esta campaña?`)) return;
    try {
      await toggleAdvertisementStatus(id, !currentStatus, token);
      fetchAdvertisements();
      showToast(`Campaña ${!currentStatus ? 'activada' : 'pausada'} correctamente.`, 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

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
            <h1>Gestión de Publicidades</h1>
          </div>
          <Link to="/admin/advertisements/create" className="btn-create-premium">
            <Plus size={20} />
            <span>Nueva Campaña</span>
          </Link>
        </header>

        {loading ? (
          <LoadingSpinner message="Analizando impacto publicitario..." />
        ) : error ? (
          <div className="hub-error-card">{error}</div>
        ) : advertisements.length === 0 ? (
          <div className="hub-empty-state">
            <Megaphone size={48} />
            <h3>No hay campañas activas</h3>
            <p>Comienza a promocionar el ecosistema Pandora ahora.</p>
            <Link to="/admin/advertisements/create" className="btn-create-premium">Crear Primera Publicidad</Link>
          </div>
        ) : (
          <div className="admin-table-wrapper-premium">
            <div className="table-filters-premium">
              <div className="search-bar-premium">
                 <Search size={18} />
                 <input type="text" placeholder="Buscar por título o posición..." />
              </div>
              <button className="btn-filter-premium">
                <Filter size={18} />
                <span>Activas</span>
              </button>
            </div>

            <table className="admin-table-premium">
              <thead>
                <tr>
                  <th>TÍTULO Y POSICIÓN</th>
                  <th className="hide-mobile">TIPO</th>
                  <th className="hide-mobile">ESTADO</th>
                  <th className="hide-mobile">VIGENCIA</th>
                  <th className="text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {advertisements.map((ad) => (
                  <tr key={ad.id}>
                    <td>
                      <div className="row-main-info">
                        <span className="row-title">{ad.title}</span>
                        <div className="row-subtitle-icon">
                          <Layers size={12} />
                          <span>{ad.position}</span>
                        </div>
                      </div>
                    </td>
                    <td className="hide-mobile">
                      <span className="row-meta">{ad.category || 'General'}</span>
                    </td>
                    <td className="hide-mobile">
                      <span className={`badge-premium ${ad.isActive ? 'active' : 'draft'}`}>
                        {ad.isActive ? 'Activa' : 'Pausada'}
                      </span>
                    </td>
                    <td className="hide-mobile">
                      <div className="row-meta-date-group">
                         <small>Desde: {new Date(ad.startDate).toLocaleDateString()}</small>
                         <small>Hasta: {new Date(ad.endDate).toLocaleDateString()}</small>
                      </div>
                    </td>
                    <td className="text-right">
                      <div className="action-icons-group">
                        <Link to={`/admin/advertisements/edit/${ad.id}`} className="btn-action-premium edit" title="Editar">
                          <Edit3 size={18} />
                        </Link>
                        <button 
                          onClick={() => handleToggleStatus(ad.id, ad.isActive)} 
                          className={`btn-action-premium ${ad.isActive ? 'delete' : 'edit'}`} 
                          title={ad.isActive ? "Pausar" : "Activar"}
                        >
                          {ad.isActive ? <Trash2 size={18} /> : <Activity size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="table-footer-premium">
              <p>Total: {advertisements.length} campañas registradas</p>
              <div className="pagination-group-premium">
                 <button disabled className="btn-page"><ChevronLeft size={20} /></button>
                 <button disabled className="btn-page active">1</button>
                 <button disabled className="btn-page"><ChevronRight size={20} /></button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
      <style>{`
        .hub-empty-state {
          text-align: center;
          padding: 4rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 24px;
          border: 1px dashed rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.4);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }
        .row-meta-date-group {
          display: flex;
          flex-direction: column;
          gap: 2px;
          color: rgba(255, 255, 255, 0.4);
        }
      `}</style>
    </div>
  );
};

export default AdminAdvertisementsPage;
