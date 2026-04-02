// src/Components/pages/AdminAdvertisementFormPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getAdvertisementById, createAdvertisement, updateAdvertisement } from '../../services/AdvertisementService';
import { uploadImage, getCommerces, getAbsoluteImageUrl } from '../../services/api'; 
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { Camera, CheckCircle, Pause, Info, Upload, X } from 'lucide-react';
import './CommerceFormPage.css';
import './AdminAdvertisementFormPage.css';
import { useImageUpload } from '../../hooks/useImageUpload';
import ImageOverlayPreview from '../ui/ImageOverlayPreview';

// Las posiciones definen DÓNDE aparecerá la publicidad en la web
const POSITION_INFO = {
  banner_home: {
    label: 'Banner Home (Principal)',
    description: 'Imagen grande rotativa en la sección central de la página de inicio. Máxima visibilidad para todos los visitantes. Tamaño recomendado: 1200×400px.'
  },
  banner_events: {
    label: 'Banner Eventos',
    description: 'Aparece en la parte superior de la sección de Eventos. Ideal para publicidades de espectáculos, shows o actividades culturales. Tamaño recomendado: 1200×300px.'
  },
  sidebar: {
    label: 'Barra Lateral',
    description: 'Panel visible a la derecha del contenido principal mientras el usuario navega. Perfecto para anuncios más verticales y de lectura secundaria. Tamaño recomendado: 300×600px.'
  }
};

const AdminAdvertisementFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { showToast } = useToast();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    link: '',
    category: 'COMMERCE',
    position: 'banner_home',
    isActive: true,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    commerceId: ''
  });

  const [commerces, setCommerces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const { uploading, fromInputEvent } = useImageUpload();

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    setUploadError(null);
  };

  useEffect(() => {
    const loadCommerces = async () => {
      try {
        const data = await getCommerces();
        setCommerces(data);
      } catch (err) {
        console.error("Error loading commerces list", err);
      }
    };
    loadCommerces();
  }, []);

  useEffect(() => {
    if (isEditMode) {
      const fetchAd = async () => {
        setLoading(true);
        try {
          const data = await getAdvertisementById(id, true); // adminMode=true: puede cargar ads inactivas

          // Normalizar fechas: si la fecha es epoch (año < 2000), tratar como vacía
          // Esto ocurre cuando la ad fue creada sin endDate antes del fix del backend
          const normalizeDate = (dateStr) => {
            if (!dateStr) return '';
            const d = new Date(dateStr);
            if (isNaN(d.getTime()) || d.getFullYear() < 2000) return '';
            return d.toISOString().split('T')[0];
          };

          const start = normalizeDate(data.startDate);
          const end = normalizeDate(data.endDate);

          setFormData({
            title: data.title || '',
            description: data.description || '',
            imageUrl: data.imageUrl || '',
            link: data.link || '',
            category: data.category || 'COMMERCE',
            position: data.position || 'banner_home',
            isActive: data.isActive !== undefined ? data.isActive : true,
            startDate: start,
            endDate: end,
            commerceId: data.commerceId || ''
          });
        } catch (error) {
          console.error("Error loading advertisement:", error);
          showToast("Error cargando publicidad.", 'error');
        } finally {
          setLoading(false);
        }
      };
      fetchAd();
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
                      formData.description.trim() && 
                      formData.imageUrl && 
                      formData.link.trim() && 
                      formData.startDate && 
                      formData.position;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      showToast('La imagen del banner es obligatoria.', 'error');
      return;
    }
    setLoading(true);
    const payload = {
      ...formData,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      commerceId: formData.commerceId ? parseInt(formData.commerceId) : null
    };
    try {
      if (isEditMode) {
        await updateAdvertisement(id, payload, token);
        showToast("Publicidad actualizada correctamente.", 'success');
      } else {
        await createAdvertisement(payload, token);
        showToast("Publicidad creada con éxito.", 'success');
      }
      navigate('/admin/advertisements');
    } catch (error) {
      console.error("Error saving ad:", error);
      const msg = error.message || '';
      showToast((msg === 'Failed to fetch' || msg.includes('NetworkError')) ? 'Error de conexión con el servidor.' : msg || 'Error al guardar la publicidad.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) return <LoadingSpinner />;

  const selectedPositionInfo = POSITION_INFO[formData.position];

  return (
    <div className="commerce-form-wrapper">
      <Navbar />
      <div className="commerce-form-container">
        <div className="form-header">
          <h1>{isEditMode ? 'Editar Publicidad' : 'Nueva Campaña Publicitaria'}</h1>
          <p>{isEditMode ? 'Modificá los datos de la campaña activa.' : 'Completá los datos para lanzar una nueva campaña.'}</p>
        </div>

        <form onSubmit={handleSubmit} className="form-card">

          {/* Título y Categoría */}
          <div className="form-row">
            <div className="form-group">
              <label>Título de la Campaña <span className="required-tag">(Obligatorio)</span></label>
              <input 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                className="form-control" 
                required 
                placeholder="Ej: 20% OFF en Cenas de Verano"
              />
              <small className="field-hint">Aparece como texto alternativo del banner y en reportes internos.</small>
            </div>
            
            <div className="form-group">
              <label>Categoría / Tipo <span className="required-tag">(Obligatorio)</span></label>
              <select name="category" value={formData.category} onChange={handleChange} className="form-control">
                <option value="COMMERCE">Comercio (negocio del ecosistema Pandora)</option>
                <option value="EXTERNAL">Externo (gobierno, ONG, empresa ajena)</option>
                <option value="SPONSOR">Sponsor Oficial (patrocinador especial)</option>
              </select>
            </div>
          </div>

          {/* Comercio asociado (condicional) */}
          {formData.category === 'COMMERCE' && (
            <div className="form-group">
              <label>Vincular a un Comercio de Pandora</label>
              <select name="commerceId" value={formData.commerceId} onChange={handleChange} className="form-control">
                <option value="">-- Sin asociar (publicidad genérica) --</option>
                {commerces.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <small className="field-hint">Si lo vinculás, el banner podrá navegar al perfil del comercio en Pandora.</small>
            </div>
          )}

          {/* Link */}
          <div className="form-group">
            <label>URL de Destino <span className="required-tag">(Obligatorio)</span></label>
            <input 
              type="text" 
              name="link" 
              value={formData.link} 
              onChange={handleChange} 
              className="form-control" 
              placeholder={formData.category === 'COMMERCE' ? '/commerces/25 ó https://sucomercio.com' : 'https://sitioexterno.gov.ar'}
              required
            />
            <small className="field-hint">¿A dónde lleva el banner al hacer click? URL externa (https://...) o ruta interna (/sección).</small>
          </div>

          {/* Descripción */}
          <div className="form-group">
            <label>Texto Promocional <span className="required-tag">(Obligatorio)</span></label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              className="form-control" 
              style={{ minHeight: '100px' }} 
              required
              placeholder="Ej: Descubrí los mejores sabores con 20% de descuento todos los viernes. ¡Reservá tu mesa hoy!"
            />
            <small className="field-hint">Subtítulo o tagline del anuncio visible debajo del banner.</small>
          </div>

          {/* Posición en la web */}
          <div className="form-group">
            <label>Posición en la Web <span className="required-tag">(Obligatorio)</span></label>
            <select name="position" value={formData.position} onChange={handleChange} className="form-control">
              {Object.entries(POSITION_INFO).map(([value, info]) => (
                <option key={value} value={value}>{info.label}</option>
              ))}
            </select>
            {selectedPositionInfo && (
              <div className="position-info-box">
                <Info size={15} />
                <span>{selectedPositionInfo.description}</span>
              </div>
            )}
          </div>

          {/* Imagen del banner */}
          <div className="form-group">
            <label>Imagen del Banner <span className="required-tag">(Obligatorio)</span></label>
            <div className={`image-upload-area ${formData.imageUrl ? 'has-image' : ''} ${uploading ? 'uploading' : ''}`}>
              {!formData.imageUrl ? (
                <>
                  <input 
                    type="file" 
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={(e) => fromInputEvent(e, (url) => setFormData(prev => ({ ...prev, imageUrl: url })))} 
                    style={{display:'none'}} 
                    id="ad-img-upload"
                    disabled={uploading}
                  />
                  <label htmlFor="ad-img-upload" className="upload-label">
                    {uploading ? (
                      <div className="upload-content">
                        <div className="spinner-sm"></div>
                        <span className="upload-text">Subiendo imagen...</span>
                      </div>
                    ) : (
                      <div className="upload-content">
                        <Upload size={32} />
                        <span className="upload-text">Hacé click para seleccionar una imagen</span>
                        <span className="upload-hint">JPG, PNG, GIF, WebP — Máx. 10MB</span>
                      </div>
                    )}
                  </label>
                </>
              ) : (
                <ImageOverlayPreview
                  imageUrl={getAbsoluteImageUrl(formData.imageUrl)}
                  onUploadChange={(e) => fromInputEvent(e, (url) => setFormData(prev => ({ ...prev, imageUrl: url })))}
                  onRemove={handleRemoveImage}
                  uploading={uploading}
                />
              )}
            </div>
            {uploadError && (
              <small style={{color:'#ff6b6b', marginTop:'0.5rem', display:'block'}}>{uploadError}</small>
            )}
          </div>

          {/* Fechas */}
          <div className="form-row">
            <div className="form-group">
              <label>Fecha de Inicio <span className="required-tag">(Obligatorio)</span></label>
              <input 
                type="date" 
                name="startDate" 
                value={formData.startDate} 
                onChange={handleChange} 
                className="form-control" 
                required 
              />
            </div>
            <div className="form-group">
              <label>Fecha de Fin</label>
              <input 
                type="date" 
                name="endDate" 
                value={formData.endDate} 
                onChange={handleChange} 
                className="form-control"
                min={formData.startDate}
              />
              <small className="field-hint">Sin fecha de fin, la campaña no tiene vencimiento automático.</small>
            </div>
          </div>

          {/* Estado */}
          <div className="form-group">
            <label>Estado de la Campaña</label>
            <div className="toggle-row">
              <input 
                type="checkbox" 
                name="isActive" 
                checked={formData.isActive} 
                onChange={handleChange}
                id="isActiveToggle"
                className="toggle-checkbox"
              />
              <label htmlFor="isActiveToggle" className="toggle-label">
                {formData.isActive ? (
                  <><CheckCircle size={18} className="text-green" /> Activa — visible en la web ahora mismo</>
                ) : (
                  <><Pause size={18} className="text-yellow" /> Pausada — no se muestra en la web</>
                )}
              </label>
            </div>
          </div>

          <div className="form-actions">
            <Link to="/admin/advertisements" className="cancel-btn">Cancelar</Link>
            <button 
              type="submit" 
              className="submit-btn" 
              disabled={loading || uploading || !isFormValid}
            >
              {loading ? 'Guardando...' : (isEditMode ? 'Actualizar Campaña' : 'Lanzar Campaña')}
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default AdminAdvertisementFormPage;
