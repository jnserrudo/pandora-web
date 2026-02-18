// src/Components/pages/CommerceFormPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createCommerce, updateCommerce, getCommerceById, uploadImage } from '../../services/api'; 
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import './CommerceFormPage.css';

const CommerceFormPage = () => {
  const { id } = useParams(); // Si existe ID, estamos editando
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const { showToast } = useToast();
  
  const isEditMode = !!id;

  // Estado del formulario
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'GASTRONOMIA',
    address: '',
    phone: '',
    instagram: '',
    coverImage: '',
    galleryImages: [],
    planLevel: 1
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
            coverImage: data.coverImage || '',
            galleryImages: data.galleryImages || [],
            planLevel: data.planLevel || 1
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

  // Manejador de subida de imágenes
  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      // Subir cada archivo seleccionado
      const uploadPromises = Array.from(files).map(file => uploadImage(file));
      const results = await Promise.all(uploadPromises);
      
      // Asumimos que results es un array de objetos { url: '...' }
      const newImages = results.map(res => res.url);

      // Si no hay coverImage, usamos la primera como cover
      setFormData(prev => ({
        ...prev,
        coverImage: prev.coverImage || newImages[0],
        galleryImages: [...prev.galleryImages, ...newImages]
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
    setLoading(true);

    try {
      if (isEditMode) {
        await updateCommerce(id, formData, token);
        showToast('Comercio actualizado correctamente!', 'success');
      } else {
        await createCommerce(formData, token);
        showToast('Comercio creado con éxito!', 'success');
      }
      navigate('/my-commerces');
    } catch (err) {
      console.error("Error saving commerce:", err);
      setError(err.message || "Error al guardar el comercio.");
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
          <h1>{isEditMode ? 'Editar Comercio' : 'Registrar Nuevo Comercio'}</h1>
          <p>{isEditMode ? 'Actualiza la información visible' : 'Completa los datos para aparecer en Pandora'}</p>
        </div>

        <form onSubmit={handleSubmit} className="form-card">
          {error && <div className="error-message" style={{marginBottom:'1rem', color:'#ff6b6b'}}>{error}</div>}

          <div className="form-group">
            <label>Nombre del Comercio</label>
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
            <label>Categoría</label>
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
              <label>Comprobante de Pago (Obligatorio para Planes PRO)</label>
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
                      const res = await uploadImage(file);
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
                  {formData.paymentProof ? '✅ Comprobante Cargado' : '📄 Subir Ticket de Transferencia / Voucher'}
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
            <label>Descripción</label>
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
            <label>Dirección</label>
            <input 
              type="text" 
              name="address" 
              value={formData.address} 
              onChange={handleChange} 
              className="form-control" 
              placeholder="Ej. Av. Belgrano 123"
            />
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
              <label htmlFor="file-upload" style={{cursor:'pointer', width:'100%', height:'100%'}}>
                 {uploading ? 'Subiendo...' : '📸 Haz click para subir fotos'}
              </label>
            </div>
            
            <div className="image-preview-grid">
              {formData.galleryImages.map((img, index) => (
                <div key={index} className="image-preview-item">
                  <img src={img} alt={`Preview ${index}`} />
                  <button 
                    type="button" 
                    className="remove-image-btn" 
                    onClick={() => removeImage(index)}
                  >
                    ×
                  </button>
                  {img === formData.coverImage && (
                    <span style={{
                      position:'absolute', bottom:0, background:'rgba(138,43,226,0.8)', 
                      width:'100%', fontSize:'10px', textAlign:'center', padding:'2px'
                    }}>Portada</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <Link to="/my-commerces" className="cancel-btn">Cancelar</Link>
            <button type="submit" className="submit-btn" disabled={loading || uploading}>
              {loading ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Crear Comercio')}
            </button>
          </div>

        </form>
      </div>
      <Footer />
    </div>
  );
};

export default CommerceFormPage;
