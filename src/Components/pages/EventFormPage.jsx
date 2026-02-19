// src/Components/pages/EventFormPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createEvent, getMyCommerces, uploadImage, API_URL, getAbsoluteImageUrl } from '../../services/api'; 
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { Camera, Upload, X, MapPin } from 'lucide-react';
import './CommerceFormPage.css';
import './EventFormPage.css';
import './AdminAdvertisementFormPage.css';
import { useImageUpload } from '../../hooks/useImageUpload';
import MapPicker from '../ui/MapPicker';

const EventFormPage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { showToast } = useToast();

  // Estado del formulario
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    commerceId: '', // Debe seleccionarse de los comercios del usuario
    startDate: '',
    endDate: '',
    location: '', // Referencia visual (ej: Planta Alta)
    address: '',  // Dirección física (ej: Belgrano 123)
    latitude: null,
    longitude: null,
    coverImage: ''
  });

  const [myCommerces, setMyCommerces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { uploading, fromInputEvent } = useImageUpload();
  const handleRemoveImage = () => setFormData(prev => ({ ...prev, coverImage: '' }));

  // Cargar comercios del usuario para el selector
  useEffect(() => {
    const fetchCommerces = async () => {
      try {
        const data = await getMyCommerces(token);
        setMyCommerces(data);
        if (data.length > 0) {
          // Pre-seleccionar el primer comercio
          setFormData(prev => ({ ...prev, commerceId: data[0].id }));
        }
      } catch (err) {
        console.error("Error cargando comercios:", err);
        setError("Necesitas tener un comercio registrado para crear eventos.");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchCommerces();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Validación en tiempo de ejecución para el botón
  const isFormValid = formData.name.trim() && 
                      formData.description.trim() && 
                      formData.startDate && 
                      formData.endDate && 
                      formData.address.trim() &&
                      formData.commerceId;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.commerceId) {
      showToast("Debes seleccionar un comercio.", 'warning');
      return;
    }
    
    // Validación fechas
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      showToast("La fecha de fin debe ser posterior al inicio.", 'warning');
      return;
    }

    setLoading(true);
    try {
      // Normalización de fechas para Prisma (ISO-8601)
      // Fusionamos "location" (referencia visual) con "address" para evitar errores de schema si no está migrado
      const fullAddress = formData.location ? `${formData.address} (${formData.location})` : formData.address;
      
      const payload = {
        ...formData,
        address: fullAddress,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };

      // Quitamos 'location' explícitamente del payload para evitar el error "Unknown argument location"
      delete payload.location;

      await createEvent(payload, token);
      showToast('¡Evento creado con éxito!', 'success');
      navigate('/events'); 
    } catch (err) {
      console.error("Error creating event:", err);
      setError(err.message || "Error al crear el evento.");
      setLoading(false);
    }
  };

  if (loading && myCommerces.length === 0 && !error) {
     return <div className="event-form-wrapper"><LoadingSpinner message="Verificando permisos..." /></div>;
  }

  return (
    <div className="event-form-wrapper">
      <Navbar />
      
      <div className="event-form-container">
        <div className="event-header">
          <h1>Crear Nuevo Evento</h1>
          <p>Publica tus actividades en la Agenda Cultural</p>
        </div>

        {myCommerces.length === 0 && !loading ? (
           <div className="empty-state">
             <h3>No tienes comercios registrados</h3>
             <p>Para crear un evento, primero debes registrar un comercio.</p>
             <Link to="/commerces/create" className="create-commerce-btn">Registrar Comercio</Link>
           </div>
        ) : (
          <form onSubmit={handleSubmit} className="form-card">
            {error && <div className="error-message" style={{marginBottom:'1rem', color:'#ff6b6b'}}>{error}</div>}

            <div className="form-group">
              <label>Organizador (Tu Comercio)</label>
              <select 
                name="commerceId" 
                value={formData.commerceId} 
                onChange={handleChange} 
                className="form-control"
                required
              >
                {myCommerces.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Nombre del Evento <span className="required-tag">(Obligatorio)</span></label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                className="form-control" 
                required 
                placeholder="Ej. Noche de Jazz"
              />
            </div>

            <div className="date-inputs-row">
              <div className="form-group">
                <label>Fecha y Hora Inicio <span className="required-tag">(Obligatorio)</span></label>
                <input 
                  type="datetime-local" 
                  name="startDate" 
                  value={formData.startDate} 
                  onChange={handleChange} 
                  className="form-control" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Fecha y Hora Fin <span className="required-tag">(Obligatorio)</span></label>
                <input 
                  type="datetime-local" 
                  name="endDate" 
                  value={formData.endDate} 
                  onChange={handleChange} 
                  className="form-control" 
                  required 
                />
              </div>
            </div>

            <div className="grid-2-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Dirección Física <span className="required-tag">(Obligatorio)</span></label>
                <input 
                  type="text" 
                  name="address" 
                  value={formData.address} 
                  onChange={handleChange} 
                  className="form-control" 
                  placeholder="Ej. Av. Belgrano 1234, Salta"
                  required
                />
              </div>

              <div className="form-group">
                <label>Ubicación Específica</label>
                <input 
                  type="text" 
                  name="location" 
                  value={formData.location} 
                  onChange={handleChange} 
                  className="form-control" 
                  placeholder="Ej. Planta Alta, Escenario Principal"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Punto en el Mapa (Opcional)</label>
              <div className="event-map-container" style={{ position: 'relative', borderRadius: '15px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                <MapPicker 
                  initialLat={formData.latitude}
                  initialLng={formData.longitude}
                  onChange={(coords) => setFormData(prev => ({ 
                    ...prev, 
                    latitude: coords.lat, 
                    longitude: coords.lng 
                  }))}
                />
                {(formData.latitude && formData.longitude) && (
                  <div className="coords-badge" style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', padding: '5px 10px', borderRadius: '20px', fontSize: '0.7rem', color: '#2ecc71', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <MapPin size={10} /> Ubicación capturada
                  </div>
                )}
              </div>
              <small className="field-hint">Marcá en el mapa si el evento es en un lugar distinto a la sede principal.</small>
            </div>

            <div className="form-group">
              <label>Descripción <span className="required-tag">(Obligatorio)</span></label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                className="form-control" 
                required 
                placeholder="Detalla de qué trata el evento..."
              />
            </div>

            <div className="form-group">
              <label>Flyer / Imagen de Portada</label>
              <div className={`image-upload-area ${formData.coverImage ? 'has-image' : ''} ${uploading ? 'uploading' : ''}`}>
                {!formData.coverImage ? (
                  <>
                    <input 
                      type="file" 
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={(e) => fromInputEvent(e, (url) => setFormData(prev => ({ ...prev, coverImage: url })))} 
                      style={{display:'none'}} 
                      id="event-cover-upload"
                      disabled={uploading}
                    />
                    <label htmlFor="event-cover-upload" className="upload-label">
                      {uploading ? (
                        <div className="upload-content">
                          <div className="spinner-sm"></div>
                          <span className="upload-text">Subiendo flyer...</span>
                        </div>
                      ) : (
                        <div className="upload-content">
                          <Upload size={32} />
                          <span className="upload-text">Hacé click para subir el flyer del evento</span>
                          <span className="upload-hint">JPG, PNG, GIF, WebP — Máx. 10MB</span>
                        </div>
                      )}
                    </label>
                  </>
                ) : (
                  <div className="image-preview-container">
                    {uploading && (
                      <div className="upload-overlay">
                        <div className="spinner-sm"></div>
                        <span>Subiendo flyer...</span>
                      </div>
                    )}
                    <img 
                      src={getAbsoluteImageUrl(formData.coverImage)} 
                      alt="Flyer preview"
                    />
                    <div className="image-preview-actions">
                      <input 
                        type="file" 
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={(e) => fromInputEvent(e, (url) => setFormData(prev => ({ ...prev, coverImage: url })))} 
                        style={{display:'none'}} 
                        id="event-cover-change"
                        disabled={uploading}
                      />
                      <label htmlFor="event-cover-change" className="btn-change-image">
                        <Camera size={16} /> Cambiar flyer
                      </label>
                      <button 
                        type="button" 
                        className="btn-remove-image"
                        onClick={handleRemoveImage}
                        disabled={uploading}
                      >
                        <X size={16} /> Quitar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <Link to="/" className="cancel-btn">Cancelar</Link>
              <button 
                type="submit" 
                className="submit-btn" 
                disabled={loading || uploading || !isFormValid}
              >
                {loading ? 'Publicando...' : 'Publicar Evento'}
              </button>
            </div>

          </form>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default EventFormPage;
