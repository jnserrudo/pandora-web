import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { createCommerceComment } from '../../services/api';
import { Star, MessageSquare, Info, Send, User, Paintbrush, Award, CircleDollarSign, FileText } from 'lucide-react';
import './CommerceCommentForm.css';

const CommerceCommentForm = ({ commerceId, commerceName, onSuccess }) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    comment: '',
    rating: 5,
    category: 'SERVICIO',
    userName: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createCommerceComment(commerceId, formData);
      showToast('¡Gracias por tu feedback! Tu opinión nos ayuda a mejorar.', 'success');
      
      // Reset form
      setFormData({
        comment: '',
        rating: 5,
        category: 'SERVICIO',
        userName: ''
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      showToast(error.message || 'Error al enviar comentario', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validación en tiempo de ejecución
  const isFormValid = formData.comment.trim() && !isSubmitting;

  return (
    <div className="commerce-comment-form-container">
      <div className="comment-form-header">
        <h3><MessageSquare className="inline-block mr-2 text-primary" /> Comparte tu Experiencia</h3>
        <p>Tu opinión nos ayudará a mejorar el servicio de {commerceName}</p>
      </div>

      <form onSubmit={handleSubmit} className="commerce-comment-form">
        {/* Categoría */}
        <div className="form-group">
          <label htmlFor="category">¿Qué aspecto quieres comentar?</label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="form-select"
          >
            <option value="SERVICIO">Servicio</option>
            <option value="AMBIENTE">Ambiente</option>
            <option value="CALIDAD">Calidad</option>
            <option value="PRECIO">Precio</option>
            <option value="OTRO">Otro</option>
          </select>
        </div>

        {/* Rating */}
        <div className="form-group">
          <label>Tu calificación</label>
          <div className="rating-selector">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={32}
                className={`star ${star <= formData.rating ? 'filled' : ''}`}
                onClick={() => setFormData({ ...formData, rating: star })}
                fill={star <= formData.rating ? '#ffd700' : 'none'}
                stroke={star <= formData.rating ? '#ffd700' : '#ccc'}
              />
            ))}
            <span className="rating-text">{formData.rating}/5</span>
          </div>
        </div>

        {/* Comentario */}
        <div className="form-group">
          <label htmlFor="comment">Cuéntanos tu experiencia *</label>
          <textarea
            id="comment"
            placeholder="Comparte detalles sobre tu visita, qué te gustó, qué podría mejorar, etc..."
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            required
            rows={5}
            className="form-textarea"
          />
        </div>

        {/* Nombre (opcional si no está logueado) */}
        <div className="form-group">
          <label htmlFor="userName">Tu nombre (opcional)</label>
          <input
            type="text"
            id="userName"
            placeholder="Anónimo"
            value={formData.userName}
            onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
            className="form-input"
          />
          <small className="form-hint flex items-center gap-1">
            <Info size={14} /> Este comentario es interno y solo lo verán los administradores de Pandora
          </small>
        </div>

        {/* Botón Submit */}
        <button
          type="submit"
          disabled={!isFormValid}
          className="btn-submit-comment"
        >
          {isSubmitting ? 'Enviando...' : <span className="flex items-center justify-center gap-2"><Send size={18} /> Enviar Feedback</span>}
        </button>
      </form>
    </div>
  );
};

export default CommerceCommentForm;
