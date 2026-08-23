// src/Components/pages/AdminAdvertisementsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Megaphone, 
  Search, 
  Filter, 
  ChevronLeft, 
  Plus,
  Edit3,
  Trash2,
  Layers,
  Activity
} from 'lucide-react';
import { getAdvertisements, toggleAdvertisementStatus } from '../../services/AdvertisementService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import AdminTablePagination, { useAdminPagination } from '../admin/AdminTablePagination';
import AdminRowActionsMenu from '../admin/AdminRowActionsMenu';
import { formatEnumLabel } from '../../utils/enumLabels.js';
import './AdminArticlesPage.css';

const AdminAdvertisementsPage = () => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);

  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      // adminMode=true: bypasses date filters and shows ALL ads
      const data = await getAdvertisements({}, true);
      setAdvertisements(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError("Error cargando publicidades.");
      setAdvertisements([]);
      showToast("No se pudieron cargar las campañas.", 'error');
    } finally {
      setLoading(false);
    }
  };

  const visibleAds = advertisements.filter((ad) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term
      || ad.title?.toLowerCase().includes(term)
      || ad.position?.toLowerCase().includes(term);
    return matchesSearch && (!activeOnly || ad.isActive);
  });

  const pagination = useAdminPagination(visibleAds, 10);

  useEffect(() => {
    fetchAdvertisements();
  }, [token]);

  const handleToggleStatus = async (id, currentStatus) => {
    // if (!window.confirm(`¿Seguro que deseas ${currentStatus ? 'pausar' : 'activar'} esta campaña?`)) return;
    try {
      await toggleAdvertisementStatus(id, !currentStatus, token);
      fetchAdvertisements();
      showToast(`Campaña ${!currentStatus ? 'activada' : 'pausada'} correctamente.`, 'info');
    } catch (err) {
      const msg = err.message || '';
      showToast(msg === 'Failed to fetch' || msg.includes('Network') ? 'Error de red.' : msg, 'error');
    }
  };

  return (
    <div className="admin-wrapper hub-theme">
      <Navbar />
      <div className="admin-container">
        <div className="admin-sticky-back">
          <Link to="/admin/dashboard" className="back-link">
            <ChevronLeft size={20} />
            <span>Volver al Panel</span>
          </Link>
        </div>
        <header className="admin-header-premium">
          <div className="admin-title-group">
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
            <p>Publicá banners y campañas para comercios y eventos en Pandora.</p>
            <Link to="/admin/advertisements/create" className="btn-create-premium">Crear Primera Publicidad</Link>
          </div>
        ) : (
          <div className="admin-table-wrapper-premium">
            <div className="table-filters-premium">
              <div className="search-bar-premium">
                 <Search size={18} />
                 <input
                   type="text"
                   placeholder="Buscar por título o posición..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
              <button
                type="button"
                className="btn-filter-premium"
                onClick={() => setActiveOnly((prev) => !prev)}
                aria-pressed={activeOnly}
              >
                <Filter size={18} />
                <span>{activeOnly ? 'Todas' : 'Activas'}</span>
              </button>
            </div>

            <table className="admin-table-premium">
              <thead>
                <tr>
                  <th className="col-main">TÍTULO Y POSICIÓN</th>
                  <th className="hide-tablet col-meta">TIPO</th>
                  <th className="hide-mobile col-status">ESTADO</th>
                  <th className="hide-tablet col-date">VIGENCIA</th>
                  <th className="col-actions text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {visibleAds.length === 0 ? (
                  <tr>
                    <td colSpan={5}>No hay campañas con ese filtro. Cambiá la búsqueda o mirá todas.</td>
                  </tr>
                ) : pagination.pageItems.map((ad) => (
                  <tr key={ad.id}>
                    <td className="col-main">
                      <div className="row-main-info">
                        <span className="row-title">{ad.title}</span>
                        <div className="row-subtitle-icon">
                          <Layers size={12} />
                          <span>{formatEnumLabel(ad.position, ad.position)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="hide-tablet col-meta">
                      <span className="row-meta">{formatEnumLabel(ad.category, 'General')}</span>
                    </td>
                    <td className="hide-mobile col-status">
                      <span className={`badge-premium ${ad.isActive ? 'active' : 'draft'}`}>
                        {ad.isActive ? 'Activa' : 'Pausada'}
                      </span>
                    </td>
                    <td className="hide-tablet col-date">
                      <div className="row-meta-date-group">
                         <small>Desde: {new Date(ad.startDate).toLocaleDateString()}</small>
                         <small>Hasta: {
                           ad.endDate && new Date(ad.endDate).getFullYear() >= 2000
                             ? new Date(ad.endDate).toLocaleDateString()
                             : 'Sin vencimiento'
                         }</small>
                      </div>
                    </td>
                      <td className="col-actions text-right">
                        <AdminRowActionsMenu
                          label={`Acciones de ${ad.title || ad.id}`}
                          items={[
                            {
                              key: 'edit',
                              label: 'Editar',
                              icon: Edit3,
                              to: `/admin/advertisements/edit/${ad.id}`,
                            },
                            {
                              key: 'toggle',
                              label: ad.isActive ? 'Pausar' : 'Activar',
                              icon: ad.isActive ? Trash2 : Activity,
                              tone: ad.isActive ? 'danger' : 'success',
                              onClick: () => handleToggleStatus(ad.id, ad.isActive),
                            },
                          ]}
                        />
                      </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <AdminTablePagination {...pagination} onPageSizeChange={pagination.setPageSize} />
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
