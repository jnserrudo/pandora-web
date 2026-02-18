// src/Components/pages/AdminAdvertisementFormPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getAdvertisementById, createAdvertisement, updateAdvertisement } from '../../services/AdvertisementService';
import { uploadImage, getCommerces } from '../../services/api'; 
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import './CommerceFormPage.css'; // Reutilizamos estilos de formulario

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
    category: 'COMMERCE', // Enum: COMMERCE, EXTERNAL, SPONSOR
    position: 'banner_home', // banner_home, sidebar, etc.
    isActive: true,
    startDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    endDate: '',
    commerceId: '' // Opcional
  });

  const [commerces, setCommerces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Cargar comercios para el dropdown
  useEffect(() => {
    const loadCommerces = async () => {
      try {
        const data = await getCommerces(); // Trae todos
        setCommerces(data);
      } catch (err) {
        console.error("Error loading commerces list", err);
      }
    };
    loadCommerces();
  }, []);

  // Cargar datos si es edición
  useEffect(() => {
    if (isEditMode) {
      const fetchAd = async () => {
        setLoading(true);
        try {
          const data = await getAdvertisementById(id);
          // Ajustar fechas para input type="date"
          const start = data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '';
          const end = data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : '';
          
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadImage(file);
      setFormData(prev => ({ ...prev, imageUrl: result.url }));
    } catch (err) {
      console.error(err);
      showToast("Error subiendo imagen.", 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Preparar objeto para enviar
    const payload = {
      ...formData,
      // Convertir fechas a ISO completo si el backend lo requiere, o dejarlas YYYY-MM-DD
      startDate: new Date(formData.startDate).toISOString(), 
      endDate: new Date(formData.endDate).toISOString(),
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
      showToast(error.message, 'error');
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
           <h1 style={{color: 'var(--color-primary)'}}>
             {isEditMode ? 'Editar Publicidad' : 'Nueva Campaña Publicitaria'}
           </h1>
        </div>

        <form onSubmit={handleSubmit} className="form-card">
          {/* Fila 1 */}
          <div className="form-row">
            <div className="form-group">
              <label>Título de la Campaña</label>
              <input 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                className="form-control" 
                required 
                placeholder="Ej: 20% OFF en Cenas"
              />
            </div>
            
             <div className="form-group">
              <label>Categoría</label>
              <select name="category" value={formData.category} onChange={handleChange} className="form-control">
                <option value="COMMERCE">Comercio (Interno)</option>
                <option value="EXTERNAL">Externo (Gobierno/Otros)</option>
                <option value="SPONSOR">Sponsor Oficial</option>
              </select>
            </div>
          </div>

          {/* Fila 2 - Condicional Comercio */}
          {formData.category === 'COMMERCE' && (
             <div className="form-group">
               <label>Asociar a Comercio (Opcional)</label>
               <select name="commerceId" value={formData.commerceId} onChange={handleChange} className="form-control">
                 <option value="">-- Seleccionar Comercio --</option>
                 {commerces.map(c => (
                   <option key={c.id} value={c.id}>{c.name}</option>
                 ))}
               </select>
               <small style={{color:'rgba(255,255,255,0.5)'}}>Esto vinculará la publicidad al perfil del comercio automáticamente.</small>
             </div>
          )}

          <div className="form-group">
             <label>Link de Redestino</label>
             <input 
               type="text" 
               name="link" 
               value={formData.link} 
               onChange={handleChange} 
               className="form-control" 
               placeholder={formData.category === 'COMMERCE' ? '/commerce/1' : 'https://susitio.com'}
               required
             />
          </div>

          <div className="form-group">
            <label>Descripción / Texto Promocional</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              className="form-control" 
              style={{ minHeight: '100px' }} 
              required 
            />
          </div>

          {/* Fila 3 - Posición e Imagen */}
          <div className="form-row">
             <div className="form-group">
                <label>Posición en la Web</label>
                <select name="position" value={formData.position} onChange={handleChange} className="form-control">
                  <option value="banner_home">Banner Home (Principal)</option>
                  <option value="banner_events">Banner Eventos</option>
                  <option value="sidebar">Barra Lateral</option>
                  <option value="popup">Pop-Up (Invasivo)</option>
                </select>
             </div>
             
             <div className="form-group">
               <label>Estado</label>
               <div className="toggle-container" style={{display:'flex', alignItems:'center', gap:'10px', height: '45px'}}>
                  <input 
                    type="checkbox" 
                    name="isActive" 
                    checked={formData.isActive} 
                    onChange={handleChange}
                    id="isActiveToggle"
                    style={{width:'20px', height:'20px'}}
                  />
                  <label htmlFor="isActiveToggle" style={{margin:0, cursor:'pointer'}}>
                    {formData.isActive ? '✅ Activa (Visible)' : '⏸ Pausada (Oculta)'}
                  </label>
               </div>
             </div>
          </div>

          {/* Fila 4 - Fechas */}
          <div className="form-row">
             <div className="form-group">
               <label>Fecha Inicio</label>
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
               <label>Fecha Fin</label>
               <input 
                 type="date" 
                 name="endDate" 
                 value={formData.endDate} 
                 onChange={handleChange} 
                 className="form-control" 
                 required 
               />
             </div>
          </div>

          <div className="form-group">
            <label>Imagen del Banner/Anuncio</label>
             <div className="image-upload-section">
                <input type="file" onChange={handleImageUpload} style={{display:'none'}} id="ad-img" />
                <label htmlFor="ad-img" style={{cursor:'pointer'}}>
                  {uploading ? 'Subiendo...' : (formData.imageUrl ? 'Cambiar Imagen' : '📸 Seleccionar Foto')}
                </label>
             </div>
             {formData.imageUrl && (
               <div style={{marginTop:'1rem', border:'1px solid rgba(255,255,255,0.2)', padding:'5px', borderRadius:'8px'}}>
                 <img src={formData.imageUrl} alt="Preview" style={{maxWidth:'100%', borderRadius:'4px'}} />
               </div>
             )}
          </div>

          <div className="form-actions">
            <Link to="/admin/advertisements" className="cancel-btn">Cancelar</Link>
            <button type="submit" className="submit-btn" disabled={loading || uploading}>
              {isEditMode ? 'Actualizar Campaña' : 'Lanzar Campaña'}
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default AdminAdvertisementFormPage;
