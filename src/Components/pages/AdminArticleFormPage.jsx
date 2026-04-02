// src/Components/pages/AdminArticleFormPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { uploadImage, API_URL, getAbsoluteImageUrl } from '../../services/api';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { Camera, Upload, X } from 'lucide-react';
import './CommerceFormPage.css';
import './AdminAdvertisementFormPage.css';
import { useImageUpload } from '../../hooks/useImageUpload';
import ImageOverlayPreview from '../ui/ImageOverlayPreview';

const AdminArticleFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const { showToast } = useToast();
  const isEditMode = !!id;

  // El Article schema requiere: title, content, coverImage, categoryId, status, isActive, authorName
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '',
    coverImage: '',
    authorName: '',
    status: 'DRAFT',
    isActive: true,
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const { uploading, fromInputEvent } = useImageUpload();

  const handleRemoveImage = () => setFormData(prev => ({ ...prev, coverImage: '' }));

  // Cargar categorías desde el backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_URL}/articles/categories`);
        setCategories(res.data);
        // Pre-seleccionar primera categoría si no hay ninguna seleccionada
        if (res.data.length > 0 && !formData.categoryId) {
          setFormData(prev => ({ ...prev, categoryId: res.data[0].id }));
        }
      } catch (err) {
        console.error('Error loading categories:', err);
        showToast('No se pudieron cargar las categorías.', 'error');
      }
    };
    fetchCategories();
  }, []);

  // Cargar datos del artículo en modo edición
  useEffect(() => {
    if (isEditMode) {
      const fetchArticle = async () => {
        setLoading(true);
        try {
          const res = await axios.get(`${API_URL}/articles/manage/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = res.data;
          setFormData({
            title: data.title || '',
            content: data.content || '',
            categoryId: data.categoryId || '',
            coverImage: data.coverImage || '',
            authorName: data.authorName || '',
            status: data.status || 'DRAFT',
            isActive: data.isActive !== undefined ? data.isActive : true,
          });
        } catch (error) {
          console.error('Error loading article:', error);
          showToast('Error cargando noticia.', 'error');
        } finally {
          setLoading(false);
        }
      };
      fetchArticle();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Validación en tiempo de ejecución para el botón
  const isFormValid = formData.title.trim() && 
                      formData.content.trim() && 
                      formData.categoryId;


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.categoryId) {
      showToast('Seleccioná una categoría.', 'warning');
      return;
    }
    if (!formData.title.trim()) {
      showToast('El título es obligatorio.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Serializar con los campos correctos del schema
      const payload = {
        title: formData.title,
        content: formData.content,
        categoryId: parseInt(formData.categoryId),
        coverImage: formData.coverImage || '',
        authorName: formData.authorName || (user?.name || 'Pandora Editorial'),
        status: formData.status,         // 'PUBLISHED' | 'DRAFT'
        isActive: formData.isActive,
      };

      if (isEditMode) {
        await axios.put(`${API_URL}/articles/${id}`, payload, { headers });
        showToast('Noticia actualizada correctamente.', 'success');
      } else {
        await axios.post(`${API_URL}/articles`, payload, { headers });
        showToast('Noticia publicada con éxito.', 'success');
      }
      navigate('/admin/articles');
    } catch (error) {
      console.error('Error saving article:', error);
      const msg = error.response?.data?.message || error.message || '';
      const isNetworkError = msg === 'Failed to fetch' || msg.includes('NetworkError') || msg.includes('ERR_CONNECTION');
      showToast(isNetworkError ? 'Error de conexión con el servidor. Intentá de nuevo.' : msg || 'Error al guardar.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) return <LoadingSpinner />;

  return (
    <div className="commerce-form-wrapper">
      <Navbar />
      <div className="commerce-form-container">
        <div className="form-header">
          <h1>{isEditMode ? 'Editar Noticia' : 'Redactar Nueva Noticia'}</h1>
          <p>{isEditMode ? 'Modificá los datos del artículo.' : 'Completá los campos para publicar una nueva nota.'}</p>
        </div>

        <form onSubmit={handleSubmit} className="form-card">

          {/* Título */}
          <div className="form-group">
            <label>Título <span className="required-tag">(Obligatorio)</span></label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="form-control"
              required
              placeholder="Ej: Las mejores novedades culturales de febrero"
            />
          </div>

          {/* Categoría */}
          <div className="form-group">
            <label>Categoría <span className="required-tag">(Obligatorio)</span></label>
            <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="form-control" required>
              <option value="">— Seleccioná una categoría —</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <small className="field-hint">Las categorías disponibles se cargan desde el sistema.</small>
          </div>

          {/* Autor */}
          <div className="form-group">
            <label>Autor</label>
            <input
              type="text"
              name="authorName"
              value={formData.authorName}
              onChange={handleChange}
              className="form-control"
              placeholder="Ej: Pandora Editorial, Juan Pérez..."
            />
            <small className="field-hint">Si se deja vacío, se usará tu nombre de usuario.</small>
          </div>

          {/* Contenido */}
          <div className="form-group">
            <label>Contenido <span className="required-tag">(Obligatorio)</span></label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              className="form-control"
              style={{ minHeight: '300px' }}
              required
              placeholder="Escribí el contenido completo del artículo..."
            />
            <small className="field-hint">Podés usar formato Markdown o HTML simple.</small>
          </div>

          {/* Imagen de Portada */}
          <div className="form-group">
            <label>Imagen de Portada</label>
            <div className={`image-upload-area ${formData.coverImage ? 'has-image' : ''} ${uploading ? 'uploading' : ''}`}>
              {!formData.coverImage ? (
                <>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={(e) => fromInputEvent(e, (url) => setFormData(prev => ({ ...prev, coverImage: url })))}
                    style={{ display: 'none' }}
                    id="news-img"
                    disabled={uploading}
                  />
                  <label htmlFor="news-img" className="upload-label">
                    {uploading ? (
                      <div className="upload-content">
                        <div className="spinner-sm"></div>
                        <span className="upload-text">Subiendo imagen...</span>
                      </div>
                    ) : (
                      <div className="upload-content">
                        <Upload size={32} />
                        <span className="upload-text">Hacé click para seleccionar una imagen de portada</span>
                        <span className="upload-hint">JPG, PNG, GIF, WebP — Máx. 10MB</span>
                      </div>
                    )}
                  </label>
                </>
              ) : (
                <ImageOverlayPreview
                  imageUrl={getAbsoluteImageUrl(formData.coverImage)}
                  onUploadChange={(e) => fromInputEvent(e, (url) => setFormData(prev => ({ ...prev, coverImage: url })))}
                  onRemove={handleRemoveImage}
                  uploading={uploading}
                />
              )}
            </div>
          </div>

          {/* Estado de Publicación */}
          <div className="form-group">
            <label>Estado de Publicación</label>
            <select name="status" value={formData.status} onChange={handleChange} className="form-control">
              <option value="DRAFT">Borrador — no visible públicamente</option>
              <option value="PUBLISHED">Publicado — visible en la Revista</option>
            </select>
            <small className="field-hint">Solo las notas con estado "Publicado" aparecen en la Revista.</small>
          </div>

          <div className="form-actions">
            <Link to="/admin/articles" className="cancel-btn">Cancelar</Link>
            <button 
              type="submit" 
              className="submit-btn" 
              disabled={loading || uploading || !isFormValid}
            >
              {loading ? 'Guardando...' : (isEditMode ? 'Actualizar Noticia' : 'Publicar Noticia')}
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default AdminArticleFormPage;
