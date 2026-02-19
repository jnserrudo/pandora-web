// src/Components/pages/CommerceFormPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createCommerce, updateCommerce, getCommerceById, uploadImage, API_URL, getAbsoluteImageUrl } from '../../services/api'; 
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import MapPicker from '../ui/MapPicker';
import { Camera, Upload, CheckCircle, FileText, X } from 'lucide-react';
import './CommerceFormPage.css';

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
    if (!formData.category) return "Debes seleccionar una categoría.";
    if (!formData.description.trim()) return "La descripción es obligatoria para los usuarios.";
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
    description: '',
    category: 'GASTRONOMIA',
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
    longitude: null
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar datos si estamos en modo edición
  useEffect(() => {
    if (isEditMode) {
      const fetchCommerce = async () => {
        try {
          setLoading(true);
          const data = await getCommerceById(id);
          // Rellenar formulario (ajustar según estructura de BD)
          setFormData({
            name: data.name || '',
            description: data.description || '',
            category: data.category || 'GASTRONOMIA',
            address: data.address || '',
            phone: data.phone || '',
            instagram: data.instagram || '',
            facebook: data.facebook || '',
            website: data.website || '',
            openingHours: typeof data.openingHours === 'object' ? JSON.stringify(data.openingHours) : (data.openingHours || ''),
            coverImage: data.coverImage || '',
            galleryImages: data.galleryImages || [],
            planLevel: data.planLevel || 1,
            latitude: data.latitude || null,
            longitude: data.longitude || null
          });
        } catch (err) {
          console.error("Error cargando comercio:", err);
          setError("No se pudo cargar el comercio para editar.");
        } finally {
          setLoading(false);
        }
      };
      fetchCommerce();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Validación en tiempo de ejecución para el botón
  const isFormValid = formData.name.trim() && 
                      formData.description.trim() && 
                      formData.category && 
                      formData.address.trim() && 
                      formData.openingHours.trim() &&
                      (formData.planLevel === 1 || !!formData.paymentProof);

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
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      showToast(validationError, 'error');
      return;
    }

    setLoading(true);

    try {
      if (isEditMode) {
        const payload = {
          ...formData,
          openingHours: formData.openingHours ? (isValidJson(formData.openingHours) ? JSON.parse(formData.openingHours) : formData.openingHours) : null
        };
        await updateCommerce(id, payload, token);
        showToast('Comercio actualizado correctamente!', 'success');
      } else {
        const payload = {
          ...formData,
          openingHours: formData.openingHours ? (isValidJson(formData.openingHours) ? JSON.parse(formData.openingHours) : formData.openingHours) : null
        };
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
              className="form-control" 
              required 
              placeholder="Ej. Café Martínez"
            />
          </div>

          <div className="form-group">
            <label>Categoría <span className="required-tag">(Obligatorio)</span></label>
            <select 
              name="category" 
              value={formData.category} 
              onChange={handleChange} 
              className="form-control"
            >
              <option value="GASTRONOMIA">Gastronomía</option>
              <option value="VIDA_NOCTURNA">Vida Nocturna</option>
              <option value="SALAS_Y_TEATRO">Salas y Teatro</option>
              {/* Agregar más categorías según enum del backend */}
            </select>
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
              className="form-control" 
              placeholder="Ej. Lun-Vie: 09:00-21:00&#10;Sab: 10:00-14:00"
              rows="3"
            />
            <small style={{color: '#a0a0c0', fontSize: '0.8rem'}}>Especifica los días y horas que atiendes al público.</small>
          </div>

          <div className="form-group">
            <label>Nivel de Plan Deseado</label>
            <div className="plan-selector">
              {[1, 2, 3, 4].map(level => (
                <div 
                  key={level} 
                  className={`plan-option ${formData.planLevel === level ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, planLevel: level }))}
                >
                  <span className="plan-number">{level}</span>
                  <span className="plan-label">
                    {level === 1 ? 'Free' : level === 2 ? 'Plus' : level === 3 ? 'Premium' : 'Diamond'}
                  </span>
                  {level > 1 && <span className="premium-tag">PRO</span>}
                </div>
              ))}
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
            <label>Descripción <span className="required-tag">(Obligatorio)</span></label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              className="form-control" 
              required 
              placeholder="Describe tu propuesta..."
            />
          </div>

          <div className="form-group">
            <label>Dirección Física <span className="required-tag">(Obligatorio)</span></label>
            <input 
              type="text" 
              name="address" 
              value={formData.address} 
              onChange={handleChange} 
              className="form-control" 
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
                  <div key={index} className="image-preview-item">
                    <img src={imageUrl} alt={`Preview ${index}`} />
                    <button 
                      type="button" 
                      className="remove-image-btn" 
                      onClick={() => removeImage(index)}
                      aria-label="Eliminar imagen"
                    >
                      <X size={14} />
                    </button>
                    {img === formData.coverImage && (
                      <div className="cover-badge">
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
              disabled={loading || uploading || !isFormValid}
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
