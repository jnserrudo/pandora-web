// src/Components/pages/AdminArticlesPage.jsx
import React, { useState, useEffect } from 'react';
import { getCategoryDisplayName } from '../../utils/categoryUtils.js';
import { Link } from 'react-router-dom';
import { getAdminArticles } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  ChevronLeft, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  X,
  FileText,
  Eye,
  EyeOff
} from 'lucide-react';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import AdminTablePagination, { useAdminPagination } from '../admin/AdminTablePagination';
import AdminRowActionsMenu from '../admin/AdminRowActionsMenu';
import './AdminArticlesPage.css';

const AdminArticlesPage = () => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const data = await getAdminArticles(token);
        const items = Array.isArray(data) ? data : (data.articles || []);
        setArticles(items);
      } catch (err) {
        setError("Error cargando artículos. Verifica que tengas permisos de administrador.");
        showToast("No se pudieron cargar las noticias.", 'error');
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchArticles();
  }, [token]);

  const handleToggleStatus = async (id, currentStatus) => {
    // if (!window.confirm(`¿Seguro que deseas ${currentStatus ? 'desactivar' : 'reactivar'} esta noticia?`)) return;
    try {
      // isActive is for logical deletion
      const { toggleArticleStatus } = await import('../../services/api');
      await toggleArticleStatus(id, !currentStatus, token);
      
      setArticles(prev => prev.map(a => 
        (a.id === id) ? { ...a, isActive: !currentStatus } : a
      ));
      showToast("Estado de visibilidad actualizado.", 'success');
    } catch (err) {
      const msg = err.message || '';
      showToast(msg === 'Failed to fetch' || msg.includes('Network') ? 'Error de red.' : msg, 'error');
    }
  };

  const handleTogglePublishStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    const actionText = newStatus === 'PUBLISHED' ? 'publicar' : 'pasar a borrador';
    
    // if (!window.confirm(`¿Seguro que deseas ${actionText} esta noticia?`)) return;
    
    try {
      const { updateArticle } = await import('../../services/api');
      await updateArticle(id, { status: newStatus }, token);
      
      setArticles(prev => prev.map(a => 
        (a.id === id) ? { ...a, status: newStatus } : a
      ));
      showToast(`Noticia ${newStatus === 'PUBLISHED' ? 'publicada' : 'movida a borradores'}.`, 'success');
    } catch (err) {
      const msg = err.message || '';
      showToast(msg === 'Failed to fetch' || msg.includes('Network') ? 'Error de red.' : msg, 'error');
    }
  };

  const filteredArticles = articles.filter((article) => {
    const term = searchTerm.toLowerCase();
    if (!term) return true;
    const categoryName = (article.category && typeof article.category === 'object')
      ? article.category.name
      : (typeof article.category === 'string' ? article.category : '');
    return article.title?.toLowerCase().includes(term) || String(categoryName).toLowerCase().includes(term);
  });

  const pagination = useAdminPagination(filteredArticles, 10);

  return (
    <div className="admin-wrapper">
      <Navbar />
      
      <div className="admin-container">
        <header className="admin-header-premium">
          <div className="admin-title-group">
            <Link to="/admin/dashboard" className="back-link">
              <ChevronLeft size={20} />
              <span>Volver al Panel</span>
            </Link>
            <h1>Gestión de Magazine</h1>
            <p>Redacción y gestión de artículos digitales.</p>
          </div>
          <Link to="/admin/articles/create" className="btn-create-premium">
            <Plus size={20} />
            <span>Nueva Noticia</span>
          </Link>
        </header>

        {loading ? (
          <LoadingSpinner message="Abriendo el archivo de prensa..." />
        ) : error ? (
           <div className="error-message-premium">{error}</div>
        ) : articles.length === 0 ? (
          <div className="empty-state-premium">
            <h3>No hay noticias publicadas</h3>
            <p>Crea el primer artículo para la sección Magazine.</p>
          </div>
        ) : (
          <div className="admin-table-wrapper-premium">
            <div className="table-filters-premium">
              <div className="search-bar-premium">
                 <Search size={18} />
                 <input
                   type="text"
                   placeholder="Buscar por título o categoría..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
            </div>
            <table className="admin-table-premium">
              <thead>
                <tr>
                  <th className="col-main">Título</th>
                  <th className="hide-tablet col-meta">Categoría</th>
                  <th className="col-status">Estado</th>
                  <th className="hide-mobile col-date">Fecha</th>
                  <th className="col-actions text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredArticles.length === 0 ? (
                  <tr>
                    <td colSpan={5}>No hay noticias con esa búsqueda. Probá otro título o categoría.</td>
                  </tr>
                ) : pagination.pageItems.map((article) => {
                  const categoryName = getCategoryDisplayName(
                    (article.category && typeof article.category === 'object') 
                    ? article.category.name 
                    : (typeof article.category === 'string' ? article.category : 'General')
                  );

                  return (
                    <tr key={article._id || article.id}>
                      <td className="col-main">
                        <div className="article-row-title">{article.title}</div>
                      </td>
                      <td className="hide-tablet col-meta">
                        <span className="category-tag">
                          {categoryName}
                        </span>
                      </td>
                      <td className="col-status">
                        <span className={`badge-premium ${article.status === 'PUBLISHED' ? 'active' : 'draft'}`}>
                          {article.status === 'PUBLISHED' ? 'Publicado' : 'Borrador'}
                        </span>
                      </td>
                      <td className="hide-mobile col-date">
                        {new Date(article.createdAt).toLocaleDateString()}
                      </td>
                      <td className="col-actions text-right">
                        <AdminRowActionsMenu
                          label={`Acciones de ${article.title}`}
                          items={[
                            {
                              key: 'publish',
                              label: article.status === 'PUBLISHED' ? 'Pasar a borrador' : 'Publicar',
                              icon: article.status === 'PUBLISHED' ? EyeOff : Eye,
                              tone: article.status === 'PUBLISHED' ? 'info' : 'success',
                              onClick: () => handleTogglePublishStatus(article.id, article.status),
                            },
                            {
                              key: 'edit',
                              label: 'Editar',
                              icon: Edit3,
                              to: `/admin/articles/edit/${article.id}`,
                            },
                            {
                              key: 'delete',
                              label: 'Eliminar',
                              icon: Trash2,
                              tone: 'danger',
                              onClick: () => handleToggleStatus(article.id, article.isActive),
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <AdminTablePagination {...pagination} onPageSizeChange={pagination.setPageSize} />
          </div>
        )}
      </div>

      <style>{`
        .category-tag {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--color-primary);
          background: rgba(138, 43, 226, 0.1);
          padding: 4px 10px;
          border-radius: 6px;
          text-transform: uppercase;
        }
        .error-message-premium {
          padding: 2rem;
          background: rgba(231, 76, 60, 0.1);
          border: 1px solid rgba(231, 76, 60, 0.3);
          color: #e74c3c;
          border-radius: 12px;
          text-align: center;
        }
        .empty-state-premium {
          text-align: center;
          padding: 4rem 2rem;
          background: rgba(255,255,255,0.02);
          border-radius: 20px;
          border: 1px dashed rgba(255,255,255,0.1);
        }
      `}</style>
      <Footer />
    </div>
  );
};

export default AdminArticlesPage;
