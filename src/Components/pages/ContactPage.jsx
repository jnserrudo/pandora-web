import React, { useState } from 'react';
import Navbar from '../Navbar/Navbar';
import { useToast } from '../../context/ToastContext';
import { createSubmission, uploadImage } from '../../services/api'; // Importamos el servicio unificado
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { Paperclip, Send, CheckCircle, Store, Megaphone, Star, MessageSquare, XCircle } from 'lucide-react';
import './ContactPage.css';

const ContactPage = () => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'CONTACT', // Mapeado a los tipos del backend
    message: '',
    attachmentUrl: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validación en tiempo de ejecución
  const isFormValid = formData.name.trim() && 
                      formData.email.trim() && 
                      formData.message.trim() &&
                      !isSubmitting &&
                      !isUploading;

  const { token } = useAuth();
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await uploadImage(file, token);
      setFormData(prev => ({ ...prev, attachmentUrl: res.url }));
    } catch (err) {
      showToast("Error al subir archivo.", 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Usamos el servicio unificado
      await createSubmission(formData);
      setSubmitStatus('success');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        type: 'CONTACT',
        message: '',
        attachmentUrl: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page-wrapper">
      <Navbar />
      
      <div className="contact-page-container">
        <div className="contact-page-header">
          <h1 className="contact-title">Contacto</h1>
          <p className="contact-subtitle">
            ¿Querés ser parte del ecosistema Pandora? ¡Escribinos!
          </p>
        </div>

        <div className="contact-content-grid">
          {/* Left side - Information */}
          <div className="contact-info-section">
            <div className="contact-info-card">
              <div className="info-icon"><Store size={24} /></div>
              <h3>Comercios</h3>
              <p>Sumá tu comercio a Pandora y llegá a más clientes.</p>
            </div>

            <div className="contact-info-card">
              <div className="info-icon"><Megaphone size={24} /></div>
              <h3>Publicidad</h3>
              <p>Promocioná tu marca con nuestras campañas.</p>
            </div>

            <div className="contact-info-card">
              <div className="info-icon"><Star size={24} /></div>
              <h3>Sponsors</h3>
              <p>Auspiciá eventos y formá parte de Pandora.</p>
            </div>

            <div className="contact-info-card">
              <div className="info-icon"><MessageSquare size={24} /></div>
              <h3>Consultas Generales</h3>
              <p>¿Tenés dudas? Estamos para ayudarte.</p>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="contact-form-section">
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Nombre Completo *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Tu nombre"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="tu@email.com"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Teléfono</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+54 9 11 1234-5678"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="type">Tipo de Solicitud *</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className="form-select"
                >
                  <option value="CONTACT">Consulta General</option>
                  <option value="AD_PROPOSAL">Propuesta de Publicidad</option>
                  <option value="MAGAZINE_PROPOSAL">Propuesta para Revista</option>
                  <option value="OTHER">Otro / Otros Intereses</option>
                </select>
              </div>

              {/* Adjuntos para Publicidad o Revista */}
              {(formData.type === 'AD_PROPOSAL' || formData.type === 'MAGAZINE_PROPOSAL') && (
                <div className="form-group attachment-section glass-morphism">
                  <label>
                    <Paperclip size={16} /> 
                    Adjuntar Carpeta, Imagen o Documento
                  </label>
                  <input 
                    type="file" 
                    onChange={handleFileUpload}
                    className="form-input-file"
                  />
                  {isUploading && <p className="upload-status">Subiendo archivo...</p>}
                  {formData.attachmentUrl && <p className="upload-success"><CheckCircle size={14} className="inline mr-1" /> Archivo listo para enviar</p>}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="message">Mensaje *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows="6"
                  placeholder="Contanos tu propuesta o consulta detalladamente..."
                  className="form-textarea"
                />
              </div>

              {submitStatus === 'success' && (
                <div className="form-message success-message flex items-center gap-2">
                  <CheckCircle size={18} /> Mensaje enviado. Nos contactaremos pronto.
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="form-message error-message flex items-center gap-2">
                  <XCircle size={18} /> Hubo un error. Por favor, intente nuevamente.
                </div>
              )}

              <button 
                type="submit" 
                className="form-submit-btn"
                disabled={!isFormValid}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
      
      {isSubmitting && <LoadingSpinner fullscreen message="Enviando tu mensaje..." />}
    </div>
  );
};

export default ContactPage;
