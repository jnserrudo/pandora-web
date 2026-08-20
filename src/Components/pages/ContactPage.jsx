import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { createSubmission, uploadImage } from '../../services/api';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import {
  ArrowRight,
  CheckCircle,
  Mail,
  Megaphone,
  MessageSquare,
  Newspaper,
  Paperclip,
  Send,
  Store,
  XCircle,
} from 'lucide-react';
import './ContactPage.css';

const CONTACT_OPTIONS = [
  {
    id: 'CONTACT',
    label: 'Consulta general',
    title: 'Consulta general',
    icon: MessageSquare,
    summary: 'Dudas, comentarios o necesidades puntuales sobre Pandora.',
    hint: 'Explica que queres resolver y desde que pagina o flujo llegaste.',
    placeholder: 'Contanos tu consulta, que queres resolver y si hay algun comercio, evento o nota involucrada.',
  },
  {
    id: 'AD_PROPOSAL',
    label: 'Propuesta de publicidad',
    title: 'Publicidad y campanas',
    icon: Megaphone,
    summary: 'Promociones, pauta y visibilidad para tu marca o propuesta.',
    hint: 'Sumar objetivo, fechas estimadas y material ayuda a responder mas rapido.',
    placeholder: 'Contanos que queres promocionar, para cuando y que objetivo te gustaria cumplir.',
  },
  {
    id: 'MAGAZINE_PROPOSAL',
    label: 'Propuesta para revista',
    title: 'Revista y contenidos',
    icon: Newspaper,
    summary: 'Notas, entrevistas, coberturas o colaboraciones editoriales.',
    hint: 'Podes adjuntar material de referencia o explicar por que la historia encaja con la revista.',
    placeholder: 'Describi la nota, historia o cobertura que queres proponer y por que seria relevante.',
  },
  {
    id: 'OTHER',
    label: 'Otro interes',
    title: 'Sumar comercio o proyecto',
    icon: Store,
    summary: 'Nuevos espacios, experiencias o ideas que queres mostrar en Pandora.',
    hint: 'Si queres sumar un lugar, conta que ofrece, donde esta y que tipo de visibilidad buscas.',
    placeholder: 'Contanos sobre tu comercio o proyecto, donde funciona y que informacion queres mostrar.',
  },
];

const ContactPage = () => {
  const { showToast } = useToast();
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'CONTACT',
    message: '',
    attachmentUrl: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const selectedOption = useMemo(
    () => CONTACT_OPTIONS.find((option) => option.id === formData.type) || CONTACT_OPTIONS[0],
    [formData.type]
  );

  const isFormValid = formData.name.trim() &&
    formData.email.trim() &&
    formData.message.trim() &&
    !isSubmitting &&
    !isUploading;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadImage(file, token);
      setFormData((prev) => ({ ...prev, attachmentUrl: res.url }));
    } catch (err) {
      showToast('Error al subir archivo.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await createSubmission(formData);
      setSubmitStatus('success');
      showToast('Mensaje enviado. Te respondemos por aca o por mail.', 'success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        type: 'CONTACT',
        message: '',
        attachmentUrl: '',
      });
    } catch (error) {
      setSubmitStatus('error');
      showToast(error.message || 'No se pudo enviar el mensaje.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page-wrapper">
      <Navbar />

      <div className="contact-page-container">
        <div className="contact-page-header">
          <div className="contact-kicker">Contacto Pandora</div>
          <h1 className="contact-title">Hablemos</h1>
          <p className="contact-subtitle">
            Elegi el motivo y te guiamos para que el pedido llegue con mejor contexto desde el inicio.
          </p>
          <div className="contact-header-pills">
            <span>Comercios</span>
            <span>Publicidad</span>
            <span>Revista</span>
            <span>Consultas</span>
          </div>
        </div>

        <div className="contact-content-grid">
          <div className="contact-info-section">
            <div className="contact-side-intro">
              <h2>Para que sirve este canal</h2>
              <p>
                Pandora recibe propuestas, altas y consultas desde un solo lugar para que cada pedido
                entre con informacion clara y accionable.
              </p>
            </div>

            <div className="contact-info-cards">
              {CONTACT_OPTIONS.map(({ id, title, summary, icon: Icon }) => (
                <button
                  type="button"
                  key={id}
                  className={`contact-info-card ${formData.type === id ? 'is-active' : ''}`}
                  onClick={() => setFormData((prev) => ({ ...prev, type: id }))}
                >
                  <div className="info-icon"><Icon size={22} /></div>
                  <div className="contact-card-copy">
                    <h3>{title}</h3>
                    <p>{summary}</p>
                  </div>
                  <ArrowRight size={16} className="contact-card-arrow" />
                </button>
              ))}
            </div>

            <div className="contact-mini-panel">
              <Mail size={18} />
              <div>
                <strong>Consejo rapido</strong>
                <p>Mientras mas preciso sea el mensaje, mas rapido puede responder el equipo.</p>
              </div>
            </div>
          </div>

          <div className="contact-form-section">
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-context-banner">
                <selectedOption.icon size={18} />
                <div>
                  <strong>{selectedOption.title}</strong>
                  <p>{selectedOption.hint}</p>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="name">Nombre completo *</label>
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

              <div className="form-row">
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
                  <label htmlFor="phone">Telefono</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+54 9 11 1234 5678"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="type">Tipo de solicitud *</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className="form-select"
                >
                  {CONTACT_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>{option.label}</option>
                  ))}
                </select>
              </div>

              {(formData.type === 'AD_PROPOSAL' || formData.type === 'MAGAZINE_PROPOSAL') && (
                <div className="form-group attachment-section">
                  <label>
                    <Paperclip size={16} />
                    Adjuntar imagen o documento
                  </label>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="form-input-file"
                  />
                  {isUploading && <p className="upload-status">Subiendo archivo...</p>}
                  {formData.attachmentUrl && (
                    <p className="upload-success">
                      <CheckCircle size={14} /> Archivo listo para enviar
                    </p>
                  )}
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
                  placeholder={selectedOption.placeholder}
                  className="form-textarea"
                />
              </div>

              {submitStatus === 'success' && (
                <div className="form-message success-message">
                  <CheckCircle size={18} /> Mensaje enviado. Nos contactaremos pronto.
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="form-message error-message">
                  <XCircle size={18} /> Hubo un error. Por favor, intenta nuevamente.
                </div>
              )}

              <button
                type="submit"
                className="form-submit-btn"
                disabled={!isFormValid}
              >
                {isSubmitting ? 'Enviando...' : <><Send size={16} /> Enviar mensaje</>}
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
