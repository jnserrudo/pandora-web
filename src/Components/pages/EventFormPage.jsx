// src/Components/pages/EventFormPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createEvent, getMyCommerces, getAllCommerces, uploadImage, API_URL, getAbsoluteImageUrl } from '../../services/api'; 
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { Camera, Upload, X, MapPin, Star, Zap, Crown, CheckCircle, FileText, ExternalLink, Video } from 'lucide-react';
import './CommerceFormPage.css';
import './EventFormPage.css';
import './AdminAdvertisementFormPage.css';
import { useImageUpload } from '../../hooks/useImageUpload';
import MapPicker from '../ui/MapPicker';
import ImageOverlayPreview from '../ui/ImageOverlayPreview';

const EVENT_TIERS = [
  {
    level: 1,
    name: 'Básico',
    price: 'Gratuito',
    color: '#a0a0c0',
    icon: null,
    features: ['Publicación en calendario', 'Nombre, fecha y lugar', 'Descripción breve', '1 imagen de portada', 'Aprobación en 72hs'],
  },
  {
    level: 2,
    name: 'Plus',
    price: 'Consultar precio',
    color: '#38bdf8',
    icon: 'zap',
    features: ['Todo lo de Básico', 'Badge PLUS distintivo', 'Hasta 5 imágenes extra', 'Enlace externo (entradas)', 'Prioridad en listados', 'Sección destacada en home'],
  },
  {
    level: 3,
    name: 'Premium',
    price: 'Consultar precio',
    color: '#FFD700',
    icon: 'crown',
    features: ['Todo lo de Plus', 'Badge PREMIUM dorado', 'Video promocional', 'Máxima prioridad siempre', 'Carrusel exclusivo en home', 'Publicidad en redes Pandora'],
  },
];

const EventFormPage = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const { showToast } = useToast();

  const isAdmin = user?.role === 'ADMIN';

  // Estado del formulario
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
    eventTier: 1,
    paymentProof: '',
    videoUrl: '',
    externalLink: '',
  });

  const [myCommerces, setMyCommerces] = useState([]);
  const [allCommerces, setAllCommerces] = useState([]);
  const [commerceSearch, setCommerceSearch] = useState('');
  const [showCommerceDropdown, setShowCommerceDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { uploading, fromInputEvent } = useImageUpload();
  const handleRemoveImage = () => setFormData(prev => ({ ...prev, coverImage: '' }));

  // Cargar comercios según rol
  useEffect(() => {
    const fetchCommerces = async () => {
      try {
        if (isAdmin) {
          // Admin: cargar TODOS los comercios
          const data = await getAllCommerces(token);
          setAllCommerces(data);
        } else {
          // Owner/User: solo sus comercios
          const data = await getMyCommerces(token);
          setMyCommerces(data);
          if (data.length > 0) {
            setFormData(prev => ({ ...prev, commerceId: data[0].id }));
          }
        }
      } catch (err) {
        console.error("Error cargando comercios:", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchCommerces();
    else setLoading(false);
  }, [token, isAdmin]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // Fecha mínima: 72 horas desde ahora
  const minStartDate = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString().slice(0, 16);

  // Validación en tiempo de ejecución para el botón
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

    // Validación fechas
    const startMs = new Date(formData.startDate).getTime();
    const endMs = new Date(formData.endDate).getTime();
    const minMs = Date.now() + 72 * 60 * 60 * 1000;

    if (startMs < minMs) {
      showToast("La fecha de inicio debe ser al menos 72 horas desde ahora.", 'warning');
      return;
    }
    if (endMs <= startMs) {
      showToast("La fecha de fin debe ser posterior al inicio.", 'warning');
      return;
    }

    if (formData.eventTier > 1 && !formData.paymentProof) {
      showToast("Para planes Plus y Premium debés adjuntar el comprobante de pago.", 'warning');
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
        featured: formData.featured || formData.eventTier === 3,
        eventTier: formData.eventTier,
        paymentProof: formData.paymentProof || null,
        videoUrl: formData.videoUrl || null,
        externalLink: formData.externalLink || null,
      };

      if (formData.commerceId) payload.commerceId = formData.commerceId;
      if (formData.organizerName.trim()) payload.organizerName = formData.organizerName.trim();

      await createEvent(payload, token);
      
      if (isAdmin) {
        showToast('Evento creado y publicado correctamente.', 'success');
        navigate('/admin/events');
      } else {
        const tierName = EVENT_TIERS.find(t => t.level === formData.eventTier)?.name || 'Básico';
        showToast(`¡Solicitud de evento ${tierName} enviada! El equipo Pandora la revisará pronto.`, 'success');
        navigate('/events');
      } 
    } catch (err) {
      console.error("Error creating event:", err);
      const msg = err.message || '';
      setError(msg === 'Failed to fetch' || msg.includes('Network') ? 'Error de conexión con el servidor.' : msg || "Error al enviar la solicitud.");
      setLoading(false);
    }
  };

  if (loading && !error) {
     return <div className="event-form-wrapper"><LoadingSpinner message="Cargando..." /></div>;
  }

  return (
    <div className="event-form-wrapper">
      <Navbar />
      
      <div className="event-form-container">
        <div className="event-header">
          <h1>{isAdmin ? 'Crear Nuevo Evento' : 'Solicitar Nuevo Evento'}</h1>
          <p>{isAdmin ? 'Completá el formulario para publicar el evento directamente.' : 'Completá el formulario y el equipo Pandora revisará tu solicitud antes de publicarla.'}</p>
        </div>

        <form onSubmit={handleSubmit} className="form-card">
            {error && <div className="error-message" style={{marginBottom:'1rem', color:'#ff6b6b'}}>{error}</div>}

            {/* Organizador: comercio propio o nombre libre */}
            <div className="form-group">
              <label>Organizador</label>
              {isAdmin ? (
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
                        {allCommerces
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
                        {allCommerces.filter(c => c.name.toLowerCase().includes(commerceSearch.toLowerCase())).length === 0 && (
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
                          Comercio seleccionado: <strong>{allCommerces.find(c => c.id === formData.commerceId)?.name}</strong>
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
                  <small className="field-hint">Como admin, podés asociarlo a cualquier comercio o indicar el organizador.</small>
                </>
              ) : myCommerces.length > 0 ? (
                <>
                  {/* Owner/User: solo sus comercios */}
                  <select 
                    name="commerceId" 
                    value={formData.commerceId} 
                    onChange={handleChange} 
                    className="form-control"
                  >
                    <option value="">— Sin comercio asociado —</option>
                    {myCommerces.map(c => (
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
                  <small className="field-hint">Podés asociarlo a uno de tus comercios o indicar el nombre del organizador.</small>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    name="organizerName"
                    value={formData.organizerName}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Ej. Festival Cultural Salta"
                    required
                  />
                  <small className="field-hint">Indicá el nombre del organizador del evento.</small>
                </>
              )}
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
                <label>Fecha y Hora Inicio <span className="required-tag">(mín. 72hs desde hoy)</span></label>
                <input 
                  type="datetime-local" 
                  name="startDate" 
                  value={formData.startDate} 
                  onChange={handleChange} 
                  className="form-control" 
                  required
                  min={minStartDate}
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
                  min={formData.startDate || minStartDate}
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

            {/* Selector de Categoría / Tier */}
            {!isAdmin && (
              <div className="form-group">
                <label>Categoría del Evento</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '0.5rem' }}>
                  {EVENT_TIERS.map(tier => {
                    const isSelected = formData.eventTier === tier.level;
                    const tierIcon = tier.icon === 'zap' ? <Zap size={20} /> : tier.icon === 'crown' ? <Crown size={20} /> : null;
                    return (
                      <div
                        key={tier.level}
                        onClick={() => setFormData(prev => ({ ...prev, eventTier: tier.level }))}
                        style={{
                          border: `2px solid ${isSelected ? tier.color : 'rgba(255,255,255,0.1)'}`,
                          borderRadius: '14px',
                          padding: '1rem 0.75rem',
                          cursor: 'pointer',
                          background: isSelected ? `${tier.color}15` : 'rgba(255,255,255,0.02)',
                          transition: 'all 0.25s ease',
                          boxShadow: isSelected ? `0 0 15px ${tier.color}30` : 'none',
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        {isSelected && (
                          <span style={{ position: 'absolute', top: '8px', right: '8px' }}>
                            <CheckCircle size={14} style={{ color: tier.color }} />
                          </span>
                        )}
                        <div style={{ color: tier.color, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {tierIcon}
                          <strong style={{ fontSize: '0.95rem' }}>{tier.name}</strong>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: isSelected ? tier.color : 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: '0.5rem' }}>
                          {tier.price}
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                          {tier.features.map((f, i) => (
                            <li key={i} style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)', padding: '2px 0', display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
                              <span style={{ color: tier.color, flexShrink: 0 }}>✓</span> {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
                <small className="field-hint">
                  {formData.eventTier === 1 && 'Publicación estándar, sin costo. Aprobación en 72hs.'}
                  {formData.eventTier === 2 && 'Requiere pago previo. Adjuntá el comprobante al finalizar el formulario.'}
                  {formData.eventTier === 3 && 'Máxima visibilidad con video y publicidad en redes. Requiere pago previo.'}
                </small>
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

            {/* Campos adicionales para Plus y Premium */}
            {!isAdmin && formData.eventTier >= 2 && (
              <div className="form-group">
                <label><ExternalLink size={15} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />Enlace Externo <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>(Entradas, reservas, web)</span></label>
                <input
                  type="url"
                  name="externalLink"
                  value={formData.externalLink}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="https://entradas.com/mi-evento"
                />
              </div>
            )}

            {!isAdmin && formData.eventTier === 3 && (
              <div className="form-group">
                <label><Video size={15} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />Video Promocional <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>(YouTube o Vimeo)</span></label>
                <input
                  type="url"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            )}

            {/* Comprobante de pago para Plus y Premium */}
            {!isAdmin && formData.eventTier > 1 && (
              <div className="form-group plan-payment-proof glass-morphism">
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
                    <span><strong style={{ color: '#fff' }}>Titular:</strong> Pandora Salta</span>
                    <span><strong style={{ color: '#fff' }}>CBU:</strong> 0850123456789012345678</span>
                    <span><strong style={{ color: '#fff' }}>Alias:</strong> PANDORA.SALTA.PAY</span>
                    <span><strong style={{ color: '#fff' }}>CUIT:</strong> 30-71234567-8</span>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', marginTop: '0.75rem' }}>
                    Realizá la transferencia y luego adjuntá el comprobante. El equipo validará tu solicitud dentro de las 48hs hábiles.
                  </p>
                </div>
                <label>Comprobante de Pago <span className="required-tag">(Obligatorio para Planes Plus y Premium)</span></label>
                <div className="proof-upload-zone">
                  <input
                    type="file"
                    id="event-payment-proof"
                    accept="image/*,application/pdf"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      try {
                        const res = await uploadImage(file, token);
                        setFormData(prev => ({ ...prev, paymentProof: res.url }));
                        showToast('Comprobante cargado correctamente.', 'success');
                      } catch {
                        showToast('Error al subir el comprobante.', 'error');
                      }
                    }}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="event-payment-proof" className="proof-label">
                    {formData.paymentProof ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4ade80' }}>
                        <CheckCircle size={16} /> Comprobante Cargado
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={16} /> Subir Comprobante (JPG, PNG, PDF)
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

            {isAdmin && (
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
            )}

            <div className="form-actions">
              <Link to="/" className="cancel-btn">Cancelar</Link>
              <button 
                type="submit" 
                className="submit-btn" 
                disabled={loading || uploading || !isFormValid}
              >
                {loading ? 'Enviando solicitud...' : isAdmin ? 'Crear Evento' : `Enviar Solicitud ${formData.eventTier > 1 ? EVENT_TIERS.find(t=>t.level===formData.eventTier)?.name : ''}`}
              </button>
            </div>

          </form>
      </div>
      <Footer />
    </div>
  );
};

export default EventFormPage;
