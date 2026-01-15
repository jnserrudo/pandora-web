// src/Components/pages/ContactPage.jsx
import React, { useState } from 'react';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import { sendContactRequest } from '../../services/api'; // Importamos el servicio
import './ContactPage.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interestType: 'GENERAL', // Valor por defecto en mayúsculas
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Usamos el servicio real para enviar la solicitud
      await sendContactRequest(formData);
      
      console.log('Contact form submitted:', formData);
      setSubmitStatus('success');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        interestType: 'GENERAL',
        message: ''
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
              <div className="info-icon">🏪</div>
              <h3>Comercios</h3>
              <p>Sumá tu comercio a Pandora y llegá a más clientes.</p>
            </div>

            <div className="contact-info-card">
              <div className="info-icon">📢</div>
              <h3>Publicidad</h3>
              <p>Promocioná tu marca con nuestras campañas.</p>
            </div>

            <div className="contact-info-card">
              <div className="info-icon">⭐</div>
              <h3>Sponsors</h3>
              <p>Auspiciá eventos y formá parte de Pandora.</p>
            </div>

            <div className="contact-info-card">
              <div className="info-icon">💬</div>
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
                <label htmlFor="interestType">Tipo de Interés *</label>
                <select
                  id="interestType"
                  name="interestType"
                  value={formData.interestType}
                  onChange={handleInputChange}
                  required
                  className="form-select"
                >
                  <option value="GENERAL">Consulta General</option>
                  <option value="COMMERCE">Registrar Comercio</option>
                  <option value="ADVERTISING">Publicidad</option>
                  <option value="SPONSOR">Sponsor / Auspicio</option>
                  <option value="PARTNERSHIP">Alianza Estratégica</option>
                  <option value="OTHER">Otro</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message">Mensaje *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows="6"
                  placeholder="Contanos cómo querés ser parte de Pandora..."
                  className="form-textarea"
                />
              </div>

              {submitStatus === 'success' && (
                <div className="form-message success-message">
                  ✅ ¡Mensaje enviado! Nos contactaremos pronto.
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="form-message error-message">
                  ❌ Hubo un error. Por favor, intentá nuevamente.
                </div>
              )}

              <button 
                type="submit" 
                className="form-submit-btn"
                disabled={isSubmitting}
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
