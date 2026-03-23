// src/Components/pages/EventEditPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getEventById, updateEvent, getMyCommerces, getAllCommerces, getAbsoluteImageUrl } from '../../services/api'; 
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { Camera, Upload, X, MapPin, Star } from 'lucide-react';
import './CommerceFormPage.css';
import './EventFormPage.css';
import './AdminAdvertisementFormPage.css';
import { useImageUpload } from '../../hooks/useImageUpload';
import MapPicker from '../ui/MapPicker';
import ImageOverlayPreview from '../ui/ImageOverlayPreview';

const EventEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    commerceId: '',
    organizerName: '',
    startDate: '',
    endDate: '',
    location: '',
    address: '',
    latitude: null,
    longitude: null,
    coverImage: '',
    featured: false,
  });

  const [commerces, setCommerces] = useState([]);
  const [commerceSearch, setCommerceSearch] = useState('');
  const [showCommerceDropdown, setShowCommerceDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { uploading, fromInputEvent } = useImageUpload();
  const handleRemoveImage = () => setFormData(prev => ({ ...prev, coverImage: '' }));

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Cargar evento
        const eventData = await getEventById(id);
        
        // Convertir fechas ISO a formato datetime-local
        const startDate = eventData.startDate ? new Date(eventData.startDate).toISOString().slice(0, 16) : '';
        const endDate = eventData.endDate ? new Date(eventData.endDate).toISOString().slice(0, 16) : '';
        
        setFormData({
          name: eventData.name || '',
          description: eventData.description || '',
          commerceId: eventData.commerceId || '',
          organizerName: eventData.organizerName || '',
          startDate,
          endDate,
          location: eventData.location || '',
          address: eventData.address || '',
          latitude: eventData.latitude,
          longitude: eventData.longitude,
          coverImage: eventData.coverImage || '',
          featured: eventData.featured || false,
        });

        // Cargar comercios según rol
        const commercesData = isAdmin 
          ? await getAllCommerces(token)
          : await getMyCommerces(token);
        setCommerces(commercesData);

      } catch (err) {
        console.error("Error cargando evento:", err);
        setError(err.message || "Error al cargar el evento.");
      } finally {
        setLoading(false);
      }
    };

    if (token && id) fetchData();
  }, [token, id, isAdmin]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const isFormValid = formData.name.trim() && 
                      formData.description.trim() && 
                      formData.startDate && 
                      formData.endDate && 
                      formData.address.trim() &&
                      (formData.commerceId || formData.organizerName.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.commerceId && !formData.organizerName.trim()) {
      showToast("Debes seleccionar un comercio o ingresar un nombre de organizador.", 'warning');
      return;
    }

    const startMs = new Date(formData.startDate).getTime();
    const endMs = new Date(formData.endDate).getTime();

    if (endMs <= startMs) {
      showToast("La fecha de fin debe ser posterior al inicio.", 'warning');
      return;
    }

    setLoading(true);
    try {
      const fullAddress = formData.location ? `${formData.address} (${formData.location})` : formData.address;

      const payload = {
        name: formData.name,
        description: formData.description,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        address: fullAddress,
        latitude: formData.latitude,
        longitude: formData.longitude,
        coverImage: formData.coverImage,
        featured: formData.featured,
      };

      if (formData.commerceId) payload.commerceId = formData.commerceId;
      if (formData.organizerName.trim()) payload.organizerName = formData.organizerName.trim();

      await updateEvent(id, payload, token);
      showToast('Evento actualizado correctamente.', 'success');
      
      if (isAdmin) {
        navigate('/admin/events');
      } else {
        navigate('/events');
      }
    } catch (err) {
      console.error("Error updating event:", err);
      setError(err.message || "Error al actualizar el evento.");
      setLoading(false);
    }
  };

  if (loading && !error) {
     return <div className="event-form-wrapper"><LoadingSpinner message="Cargando evento..." /></div>;
  }

  if (error) {
    return (
      <div className="event-form-wrapper">
        <Navbar />
        <div className="event-form-container">
          <div className="error-message" style={{marginTop:'2rem', color:'#ff6b6b', textAlign:'center'}}>
            {error}
          </div>
          <div style={{textAlign:'center', marginTop:'1rem'}}>
            <Link to="/admin/events" className="cancel-btn">Volver</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="event-form-wrapper">
      <Navbar />
      
      <div className="event-form-container">
        <div className="event-header">
          <h1>Editar Evento</h1>
          <p>Modificá los datos del evento y guardá los cambios.</p>
        </div>

        <form onSubmit={handleSubmit} className="form-card">
            {/* Organizador */}
            <div className="form-group">
              <label>Organizador</label>
              {isAdmin && commerces.length > 0 ? (
                <>
                  {/* Admin: buscador de TODOS los comercios */}
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Buscar comercio por nombre..."
                      value={commerceSearch}
                      onChange={(e) => {
                        setCommerceSearch(e.target.value);
                        setShowCommerceDropdown(true);
                      }}
                      onFocus={() => setShowCommerceDropdown(true)}
                      className="form-control"
                      style={{ marginBottom: '0.5rem' }}
                    />
                    {showCommerceDropdown && commerceSearch && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        maxHeight: '200px',
                        overflowY: 'auto',
                        backgroundColor: 'rgba(20, 20, 35, 0.95)',
                        border: '1px solid rgba(138, 43, 226, 0.3)',
                        borderRadius: '8px',
                        marginTop: '-0.5rem',
                        zIndex: 1000,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                      }}>
                        {commerces
                          .filter(c => c.name.toLowerCase().includes(commerceSearch.toLowerCase()))
                          .map(c => (
                            <div
                              key={c.id}
                              onClick={() => {
                                setFormData(prev => ({ ...prev, commerceId: c.id }));
                                setCommerceSearch(c.name);
                                setShowCommerceDropdown(false);
                              }}
                              style={{
                                padding: '0.75rem 1rem',
                                cursor: 'pointer',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                transition: 'background 0.2s ease'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(138, 43, 226, 0.2)'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <div style={{ color: '#fff', fontWeight: 500 }}>{c.name}</div>
                              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                                {c.category || 'Sin categoría'}
                              </div>
                            </div>
                          ))}
                        {commerces.filter(c => c.name.toLowerCase().includes(commerceSearch.toLowerCase())).length === 0 && (
                          <div style={{ padding: '1rem', color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
                            No se encontraron comercios
                          </div>
                        )}
                      </div>
                    )}
                    {formData.commerceId && (
                      <div style={{
                        padding: '0.75rem',
                        background: 'rgba(138, 43, 226, 0.1)',
                        border: '1px solid rgba(138, 43, 226, 0.3)',
                        borderRadius: '8px',
                        marginBottom: '0.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{ color: '#fff' }}>
                          Comercio seleccionado: <strong>{commerces.find(c => c.id === formData.commerceId)?.name}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, commerceId: '' }));
                            setCommerceSearch('');
                          }}
                          style={{
                            background: 'rgba(255,70,70,0.2)',
                            border: '1px solid rgba(255,70,70,0.3)',
                            color: '#ff6b6b',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                          }}
                        >
                          Quitar
                        </button>
                      </div>
                    )}
                  </div>
                  {!formData.commerceId && (
                    <div className="form-group" style={{ marginTop: '0.75rem' }}>
                      <label>Nombre del organizador <span className="required-tag">(Obligatorio si no hay comercio)</span></label>
                      <input
                        type="text"
                        name="organizerName"
                        value={formData.organizerName}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Ej. Festival Cultural Salta"
                      />
                    </div>
                  )}
                </>
              ) : commerces.length > 0 ? (
                <>
                  {/* Owner: select simple de sus comercios */}
                  <select 
                    name="commerceId" 
                    value={formData.commerceId} 
                    onChange={handleChange} 
                    className="form-control"
                  >
                    <option value="">— Sin comercio asociado —</option>
                    {commerces.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {!formData.commerceId && (
                    <div className="form-group" style={{ marginTop: '0.75rem' }}>
                      <label>Nombre del organizador <span className="required-tag">(Obligatorio si no hay comercio)</span></label>
                      <input
                        type="text"
                        name="organizerName"
                        value={formData.organizerName}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Ej. Festival Cultural Salta"
                      />
                    </div>
                  )}
                </>
              ) : (
                <input
                  type="text"
                  name="organizerName"
                  value={formData.organizerName}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Ej. Festival Cultural Salta"
                  required
                />
              )}
              <small className="field-hint">
                {isAdmin ? 'Como admin, podés asociarlo a cualquier comercio o indicar el organizador.' : 'Podés asociarlo a uno de tus comercios o indicar el nombre del organizador.'}
              </small>
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
                  min={formData.startDate}
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
                  <ImageOverlayPreview
                    imageUrl={getAbsoluteImageUrl(formData.coverImage)}
                    onUploadChange={(e) => fromInputEvent(e, (url) => setFormData(prev => ({ ...prev, coverImage: url })))}
                    onRemove={handleRemoveImage}
                    uploading={uploading}
                  />
                )}
              </div>
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.15)', borderRadius: '10px' }}>
              <input
                type="checkbox"
                id="featured-check"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#FFD700' }}
              />
              <label htmlFor="featured-check" style={{ cursor: 'pointer', color: '#FFD700', fontWeight: 600, fontSize: '0.95rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Star size={16} fill="#FFD700" /> Marcar como Evento Destacado
              </label>
            </div>

            <div className="form-actions">
              <Link to={isAdmin ? "/admin/events" : "/events"} className="cancel-btn">Cancelar</Link>
              <button 
                type="submit" 
                className="submit-btn" 
                disabled={loading || uploading || !isFormValid}
              >
                {loading ? 'Guardando cambios...' : 'Guardar Cambios'}
              </button>
            </div>

          </form>
      </div>
      <Footer />
    </div>
  );
};

export default EventEditPage;
