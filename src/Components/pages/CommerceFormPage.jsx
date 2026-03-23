// src/Components/pages/CommerceFormPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createCommerce, updateCommerce, getCommerceById, getCategories, uploadImage, API_URL, getAbsoluteImageUrl } from '../../services/api'; 
import { commerceAttributes } from '../../constants/commerceAttributes';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import MapPicker from '../ui/MapPicker';
import { Camera, Upload, CheckCircle, FileText, X, Plus } from 'lucide-react';
import './CommerceFormPage.css';
import ImageOverlayPreview from '../ui/ImageOverlayPreview';

const CommerceFormPage = () => {
  const { id } = useParams(); // Si existe ID, estamos editando
  const navigate = useNavigate();
  const { token, refreshProfile } = useAuth();
  const { showToast } = useToast();
  
  const isEditMode = !!id;


  const isValidJson = (str) => {
    try {
      JSON.parse(str);
      return true;
    } catch (_e) {
      return false;
    }
  };

  const validateForm = () => {
    // Regex Patterns
    const phoneRegex = /^[\d\s+\-()]{6,20}$/;
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

    if (!formData.name.trim()) return "El nombre comercial es obligatorio.";
    if (formData.categoryIds.length === 0) return "Debes seleccionar al menos una categoría.";
    if (!formData.shortDescription.trim()) return "La descripción breve es obligatoria (máximo 150 caracteres).";
    if (!formData.description.trim()) return "La descripción completa es obligatoria para los usuarios.";
    if (!formData.address.trim()) return "La dirección física es necesaria para el mapa.";
    
    // Validar Teléfono si está presente
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      return "El formato del teléfono no es válido (mínimo 6 caracteres, solo números, +, -, espacios).";
    }

    // Validar Website si está presente
    if (formData.website && !urlRegex.test(formData.website)) {
      return "La dirección del sitio web no es válida (ej: https://tusitio.com).";
    }

    // Validar Horarios
    if (!formData.openingHours.trim()) return "Los horarios de atención son obligatorios.";

    // Validar comprobante para planes pagos
    if (formData.planLevel > 1 && !formData.paymentProof) {
      return "Como seleccionaste un plan PRO, debes adjuntar el comprobante de pago.";
    }

    if (!formData.latitude || !formData.longitude) {
      showToast("Aviso: No has marcado la ubicación exacta en el mapa.", 'warning');
    }

    return null;
  };

  // Estado del formulario
  const [formData, setFormData] = useState({
    name: '',
    shortDescription: '',
    description: '',
    categoryIds: [], // Nuevo formato
    category: '',    // Fallback retrocompatibilidad
    address: '',
    phone: '',
    instagram: '',
    facebook: '',
    website: '',
    openingHours: '',
    coverImage: '',
    galleryImages: [],
    planLevel: 1,
    latitude: null,
    longitude: null,
    attributes: [],
    externalLink: ''
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const [availableCategories, setAvailableCategories] = useState([]);

  // Cargar datos iniciales (Categorías y Comercio si es edición)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        // 1. Obtener categorías disponibles del servidor
        const cats = await getCategories();
        setAvailableCategories(cats);

        // 2. Si estamos en edición, obtener datos del comercio
        if (isEditMode) {
          const data = await getCommerceById(id);
          setFormData({
            name: data.name || '',
            shortDescription: data.shortDescription || '',
            description: data.description || '',
            categoryIds: data.categories ? data.categories.map(c => c.id) : [],
            category: data.category || '',
            address: data.address || '',
            phone: data.phone || '',
            instagram: data.instagram || '',
            facebook: data.facebook || '',
            website: data.website || '',
            openingHours: typeof data.openingHours === 'object' ? JSON.stringify(data.openingHours, null, 2) : (data.openingHours || ''),
            coverImage: data.coverImage || '',
            galleryImages: data.galleryImages || [],
            planLevel: data.planLevel || 1,
            latitude: data.latitude || null,
            longitude: data.longitude || null,
            attributes: data.attributes || [],
            paymentProof: data.paymentProof || '',
            externalLink: data.externalLink || '',
            videoUrl: data.videoUrl || ''
          });
        }
      } catch (err) {
        console.error("Error cargando datos iniciales:", err);
        setError("Error al conectar con el servidor. Verifica las categorías.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAttributeToggle = (attrId) => {
    setFormData(prev => {
      const current = prev.attributes || [];
      return {
        ...prev,
        attributes: current.includes(attrId) 
          ? current.filter(id => id !== attrId) 
          : [...current, attrId]
      };
    });
  };

  const handleCategoryToggle = (categoryId) => {
    const current = formData.categoryIds || [];
    const isSelected = current.includes(categoryId);
    const limit = formData.planLevel >= 2 ? 3 : 1;

    if (!isSelected && current.length >= limit) {
      showToast(`Tu plan permite máximo ${limit} categoría(s).`, 'warning');
      return;
    }

    setFormData(prev => {
      const currentIds = prev.categoryIds || [];
      const isSelectedNow = currentIds.includes(categoryId);
      let newIds;
      
      if (isSelectedNow) {
        newIds = currentIds.filter(id => id !== categoryId);
      } else {
        newIds = [...currentIds, categoryId];
      }

      return {
        ...prev,
        categoryIds: newIds,
        category: newIds.length > 0 ? String(newIds[0]) : ''
      };
    });
  };

  // Agrupar atributos por categoría para la UI
  const groupedAttributes = Object.values(commerceAttributes).reduce((acc, attr) => {
    if (!acc[attr.category]) acc[attr.category] = [];
    acc[attr.category].push(attr);
    return acc;
  }, {});

  // Manejador de subida de imágenes
  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      // Subir cada archivo seleccionado
      const uploadPromises = Array.from(files).map(file => uploadImage(file, token));
      const results = await Promise.all(uploadPromises);
      
      // El backend puede devolver { url: '...' } o la URL directamente como string
      const newImages = results.map(res => {
        if (!res) return null;
        return typeof res === 'string' ? res : (res.url || res.imageUrl);
      });
      
      // Filtrar posibles undefined por fallos silenciosos
      const validImages = newImages.filter(img => !!img);

      // Si no hay coverImage, usamos la primera como cover
      setFormData(prev => ({
        ...prev,
        coverImage: prev.coverImage || validImages[0],
        galleryImages: [...prev.galleryImages, ...validImages]
      }));

    } catch (err) {
      console.error("Error uploading images:", err);
      showToast("Error al subir imágenes. Intenta de nuevo.", 'error');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitted(true);
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      showToast(validationError, 'error');
      // Hacer scroll al primer error visualmente (opcional)
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);

    try {
      // Limpiar payload: remover 'category' (Enum viejo) para usar solo 'categoryIds' (Relacional)
      const { category: _, ...cleanFormData } = formData;
      const openingHoursFormatted = formData.openingHours ? (isValidJson(formData.openingHours) ? JSON.parse(formData.openingHours) : formData.openingHours) : null;
      
      const payload = {
        ...cleanFormData,
        openingHours: openingHoursFormatted
      };

      if (isEditMode) {
        await updateCommerce(id, payload, token);
        showToast('Comercio actualizado correctamente!', 'success');
      } else {
        await createCommerce(payload, token);
        await refreshProfile(); // Actualizar rol de USER a OWNER
        showToast('¡Solicitud enviada! Nuestro equipo revisará tu propuesta pronto.', 'success');
      }
      navigate('/my-commerces');
    } catch (err) {
      console.error("Error saving commerce:", err);
      const msg = err.message || "Error al guardar el comercio.";
      setError(msg);
      showToast(msg, 'error');
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="commerce-form-wrapper">
         <div style={{height: '100vh', display:'flex', justifyContent:'center', alignItems:'center'}}>
            <LoadingSpinner message="Cargando datos..." />
         </div>
      </div>
    );
  }

  return (
    <div className="commerce-form-wrapper">
      <Navbar />
      
      <div className="commerce-form-container">
        <div className="form-header">
          {isEditMode && (
            <Link to="/my-commerces" className="btn-back-neo" style={{ marginBottom: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
              <Plus size={20} style={{ transform: 'rotate(45deg)' }} /> Volver a mis comercios
            </Link>
          )}
          <h1>{isEditMode ? 'Editar Comercio' : 'Publicar mi Comercio'}</h1>
          <p>{isEditMode ? 'Actualiza la información visible' : 'Completa los datos para enviar tu propuesta a revisión'}</p>
        </div>

        <form onSubmit={handleSubmit} className="form-card">
          {error && <div className="error-message" style={{marginBottom:'1rem', color:'#ff6b6b'}}>{error}</div>}

          <div className="form-group">
            <label>Nombre del Comercio <span className="required-tag">(Obligatorio)</span></label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              className={`form-control ${submitted && !formData.name.trim() ? 'error-input' : ''}`} 
              required 
              placeholder="Ej. Café Martínez"
            />
          </div>

          <div className="form-group">
            <label>Categorías <span className="required-tag">(Selecciona hasta {formData.planLevel >= 2 ? '3' : '1'} opciones)</span></label>
            <div className="categories-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.8rem' }}>
              {availableCategories.map(cat => {
                const isSelected = formData.categoryIds.includes(cat.id);
                return (
                  <div 
                    key={cat.id}
                    onClick={() => handleCategoryToggle(cat.id)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', 
                      borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s',
                      backgroundColor: isSelected ? 'rgba(255, 0, 200, 0.15)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isSelected ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)'}`,
                      color: isSelected ? '#fff' : '#aaa',
                      fontWeight: isSelected ? '500' : 'normal'
                    }}
                  >
                    {cat.name}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="form-group">
            <label>Descripción Breve <span className="required-tag">(Obligatoria - Máx 150 caracteres)</span></label>
            <input 
              type="text" 
              name="shortDescription" 
              value={formData.shortDescription} 
              onChange={(e) => { if (e.target.value.length <= 150) handleChange(e); }}
              className={`form-control ${submitted && !formData.shortDescription.trim() ? 'error-input' : ''}`} 
              required 
              placeholder="Ej. Especialistas en parrilla argentina y pastas artesanales."
              maxLength={150}
            />
            <small style={{color: '#a0a0c0', fontSize: '0.8rem'}}>{formData.shortDescription.length}/150 caracteres</small>
          </div>

          <div className="form-group">
            <label>Descripción Completa <span className="required-tag">(Obligatoria)</span></label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              className={`form-control ${submitted && !formData.description.trim() ? 'error-input' : ''}`} 
              required 
              placeholder="Contá con detalle qué ofrece tu negocio, tu propuesta de valor, la experiencia que brindás, etc."
              rows="5"
            />
          </div>

          <div className="grid-2-cols" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
            <div className="form-group">
              <label>Teléfono de Contacto</label>
              <input 
                type="text" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                className="form-control" 
                placeholder="Ej. +54 387 1234567"
              />
            </div>

            <div className="form-group">
              <label>Sitio Web</label>
              <input 
                type="text" 
                name="website" 
                value={formData.website} 
                onChange={handleChange} 
                className="form-control" 
                placeholder="www.tucomercio.com"
              />
            </div>
            {formData.planLevel >= 2 && (
              <div className="form-group">
                <label>Enlace Externo (Opcional - Nivel 2+)</label>
                <input 
                  type="text" 
                  name="externalLink" 
                  value={formData.externalLink} 
                  onChange={handleChange} 
                  className="form-control" 
                  placeholder="Ej. Menú PDF, Linktree, Reservas"
                />
              </div>
            )}
          </div>

          <div className="grid-2-cols" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
            <div className="form-group">
              <label>Instagram</label>
              <input 
                type="text" 
                name="instagram" 
                value={formData.instagram} 
                onChange={handleChange} 
                className="form-control" 
                placeholder="@tu_usuario"
              />
            </div>

            <div className="form-group">
              <label>Facebook</label>
              <input 
                type="text" 
                name="facebook" 
                value={formData.facebook} 
                onChange={handleChange} 
                className="form-control" 
                placeholder="fb.com/tucomercio"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Horarios de Atención <span className="required-tag">(Obligatorio)</span></label> 
            <textarea 
              name="openingHours" 
              value={formData.openingHours} 
              onChange={handleChange} 
              className={`form-control ${submitted && !formData.openingHours.trim() ? 'error-input' : ''}`} 
              placeholder="Ej. Lun-Vie: 09:00-21:00&#10;Sab: 10:00-14:00"
              rows="3"
            />
            <small style={{color: '#a0a0c0', fontSize: '0.8rem'}}>Especifica los días y horas que atiendes al público.</small>
          </div>

          <div className="form-group">
            <label>Nivel de Plan Deseado</label>
            <div className="plan-selector">
              {[1, 2, 3, 4].map(level => {
                const isLocked = level === 4;
                const labels = { 1: 'Free', 2: 'Plus', 3: 'Premium', 4: 'Diamond' };
                return (
                  <div 
                    key={level} 
                    className={`plan-option ${formData.planLevel === level ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                    onClick={() => !isLocked && setFormData(prev => ({ ...prev, planLevel: level }))}
                    title={isLocked ? 'Próximamente — Plan no disponible aún' : ''}
                    style={isLocked ? { opacity: 0.45, cursor: 'not-allowed', filter: 'grayscale(0.6)' } : {}}
                  >
                    <span className="plan-number">{level}</span>
                    <span className="plan-label">{labels[level]}</span>
                    {level > 1 && !isLocked && <span className="premium-tag">PRO</span>}
                    {isLocked && <span className="premium-tag" style={{ background: 'rgba(255,255,255,0.1)', color: '#888' }}>PRONTO</span>}
                  </div>
                );
              })}
            </div>
            <p className="plan-info-text">
              {formData.planLevel === 1 
                ? 'El nivel 1 es gratuito y permite visibilidad básica.' 
                : 'Este nivel requiere validación del comprobante de pago por parte de administración.'}
            </p>
          </div>

          {/* Sección de Comprobante de Pago - Solo visible si Plan > 1 */}
          {formData.planLevel > 1 && (
            <div className="form-group plan-payment-proof glass-morphism">
              {/* Datos bancarios para transferir */}
              <div style={{
                background: 'rgba(138, 43, 226, 0.08)',
                border: '1px solid rgba(138, 43, 226, 0.25)',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                marginBottom: '1.25rem'
              }}>
                <p style={{ color: '#c084fc', fontWeight: 700, marginBottom: '0.6rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  📤 Datos para la transferencia
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1.5rem', fontSize: '0.88rem', color: 'rgba(255,255,255,0.8)' }}>
                  <span><strong style={{ color: '#fff' }}>Banco:</strong> Banco Macro</span>
                  <span><strong style={{ color: '#fff' }}>Titular:</strong> Pandora S.A.S.</span>
                  <span><strong style={{ color: '#fff' }}>CBU:</strong> 2850590940090418135201</span>
                  <span><strong style={{ color: '#fff' }}>Alias:</strong> PANDORA.SALTA</span>
                  <span><strong style={{ color: '#fff' }}>CUIT:</strong> 30-71234567-8</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', marginTop: '0.75rem' }}>
                  Realizá la transferencia y luego adjuntá el comprobante a continuación. El equipo validará tu solicitud dentro de las 48 hs hábiles.
                </p>
              </div>

              <label>Comprobante de Pago <span className="required-tag">(Obligatorio para Planes PRO)</span></label>
              <div className="proof-upload-zone">
                <input 
                  type="file" 
                  accept="image/*,.pdf" 
                  id="payment-proof-upload" 
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setUploading(true);
                    try {
                      const res = await uploadImage(file, token);
                      setFormData(prev => ({ ...prev, paymentProof: res.url }));
                    } catch (err) {
                      showToast("Error al subir comprobante.", 'error');
                    } finally {
                      setUploading(false);
                    }
                  }}
                  style={{display:'none'}}
                />
                <label htmlFor="payment-proof-upload" className="proof-label">
                  {formData.paymentProof ? (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle className="size-4" /> Comprobante Cargado
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <FileText className="size-4" /> Subir Ticket de Transferencia / Voucher
                    </span>
                  )}
                </label>
                {formData.paymentProof && (
                  <div className="proof-preview">
                    <a href={formData.paymentProof} target="_blank" rel="noreferrer">Ver archivo subido</a>
                  </div>
                )}
              </div>
            </div>
          )}


          <div className="form-group">
            <label>Dirección Física <span className="required-tag">(Obligatorio)</span></label>
            <input 
              type="text" 
              name="address" 
              value={formData.address} 
              onChange={handleChange} 
              className={`form-control ${submitted && !formData.address.trim() ? 'error-input' : ''}`} 
              required 
              placeholder="Ej. Av. Belgrano 1234, Salta"
            />
          </div>

          <div className="form-group">
            <label>Ubicación en Mapa (Opcional)</label>
            <MapPicker 
              initialLat={formData.latitude}
              initialLng={formData.longitude}
              onChange={(coords) => setFormData(prev => ({ 
                ...prev, 
                latitude: coords.lat, 
                longitude: coords.lng 
              }))}
            />
            {formData.latitude && (
              <p className="text-xs text-muted-foreground mt-2">
                Coordenadas capturadas: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
              </p>
            )}
          </div>

          <div className="form-group">
            <label>Atributos Destacados</label>
            <p style={{fontSize: '0.85rem', color: '#a0a0c0', marginBottom: '1rem'}}>
              Selecciona las características que hacen destacar a tu comercio.
            </p>
            <div className="attributes-grid" style={{ display: 'grid', gap: '1.5rem' }}>
              {Object.entries(groupedAttributes).map(([category, attributes]) => (
                <div key={category} className="attribute-category-block">
                  <h4 style={{ fontSize: '1rem', color: 'var(--color-accent)', marginBottom: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.3rem' }}>
                    {category}
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.8rem' }}>
                    {attributes.map(attr => {
                      const Icon = attr.icon;
                      const isSelected = formData.attributes?.includes(attr.id);
                      return (
                        <div 
                          key={attr.id}
                          onClick={() => handleAttributeToggle(attr.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', 
                            borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s',
                            backgroundColor: isSelected ? 'rgba(255, 0, 200, 0.15)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${isSelected ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)'}`
                          }}
                        >
                          <Icon size={18} color={isSelected ? 'var(--color-accent)' : '#aaa'} />
                          <span style={{ fontSize: '0.85rem', color: isSelected ? '#fff' : '#aaa' }}>{attr.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Galería de Imágenes</label>
            <div className="image-upload-section">
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleImageUpload} 
                style={{display: 'none'}} 
                id="file-upload"
              />
              <label htmlFor="file-upload" className="upload-label-content" style={{cursor:'pointer', width:'100%', height:'100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                 {uploading ? (
                   <span className="animate-pulse">Subiendo...</span>
                 ) : (
                   <>
                     <Camera className="size-6 mb-2 opacity-70" />
                     <span>Haz click para subir fotos</span>
                   </>
                 )}
              </label>
            </div>
            
            <div className="image-preview-grid">
              {formData.galleryImages.map((img, index) => {
                if (!img) return null; // Evitar crash si por alguna razón llega undefined
                const imageUrl = getAbsoluteImageUrl(img);
                
                return (
                  <div key={index} className="relative">
                    <ImageOverlayPreview
                      imageUrl={imageUrl}
                      onUploadChange={null}
                      onRemove={() => removeImage(index)}
                      uploading={false}
                      imageContainerClassName="image-preview-item"
                    />
                    {img === formData.coverImage && (
                      <div className="cover-badge mt-2 absolute top-2 right-2">
                        Portada
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="form-actions">
            <Link to="/my-commerces" className="cancel-btn">Cancelar</Link>
            <button 
              type="submit" 
              className="submit-btn" 
              disabled={loading || uploading}
            >
              {loading ? 'Enviando...' : (isEditMode ? 'Guardar Cambios' : 'Enviar Solicitud')}
            </button>
          </div>

        </form>
      </div>
      <Footer />
    </div>
  );
};

export default CommerceFormPage;
