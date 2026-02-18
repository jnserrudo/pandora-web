// src/Components/pages/EventFormPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createEvent, getMyCommerces, uploadImage } from '../../services/api'; 
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import './CommerceFormPage.css'; // Reutilizamos estilos base
import './EventFormPage.css';    // Estilos específicos

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
    location: '',
    coverImage: ''
  });

  const [myCommerces, setMyCommerces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadImage(file);
      setFormData(prev => ({ ...prev, coverImage: result.url }));
    } catch (err) {
      console.error("Error uploading image:", err);
      showToast("Error al subir imagen.", 'error');
    } finally {
      setUploading(false);
    }
  };

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
      await createEvent(formData, token);
      showToast('Evento creado con éxito!', 'success');
      navigate('/events'); // O redirigir a mis eventos si existiera
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
              <label>Nombre del Evento</label>
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
                <label>Fecha y Hora Inicio</label>
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
                <label>Fecha y Hora Fin</label>
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

            <div className="form-group">
              <label>Ubicación (Dirección o Nombre detalla)</label>
              <input 
                type="text" 
                name="location" 
                value={formData.location} 
                onChange={handleChange} 
                className="form-control" 
                placeholder="Ej. Planta Alta, Escenario Principal"
                required
              />
            </div>

            <div className="form-group">
              <label>Descripción</label>
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
              <div className="image-upload-section">
                 <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  style={{display: 'none'}} 
                  id="event-cover-upload"
                />
                <label htmlFor="event-cover-upload" style={{cursor:'pointer', width:'100%', height:'100%'}}>
                   {uploading ? 'Subiendo...' : (formData.coverImage ? 'Cambiar Imagen' : '📸 Subir Flyer')}
                </label>
              </div>
              {formData.coverImage && (
                <div className="image-preview-item" style={{maxWidth:'200px', margin:'1rem auto'}}>
                  <img src={formData.coverImage} alt="Preview" />
                </div>
              )}
            </div>

            <div className="form-actions">
              <Link to="/" className="cancel-btn">Cancelar</Link>
              <button type="submit" className="submit-btn" disabled={loading || uploading}>
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
