import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { createCommerceComment } from '../../services/api';
import { Star, MessageSquare, Info, Send, User, Settings, ShieldCheck, Heart, Headphones } from 'lucide-react';
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
      showToast('Feedback enviado correctamente.', 'success');
      
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
      showToast(error.message || 'Error al enviar feedback', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validación en tiempo de ejecución
  const isFormValid = formData.comment.trim() && !isSubmitting;

  const categoryIcons = {
    SERVICIO: <Headphones size={18} />,
    AMBIENTE: <Heart size={18} />,
    CALIDAD: <Star size={18} />,
    PRECIO: <ShieldCheck size={18} />,
    OTRO: <Settings size={18} />
  };

  return (
    <div className="commerce-comment-form-container glass-panel">
      <div className="comment-form-header">
        <div className="header-icon-badge">
          <MessageSquare size={24} className="text-primary" />
        </div>
        <h3>Compártenos tu Feedback</h3>
        <p>Tu opinión nos ayuda a mejorar la experiencia en {commerceName}</p>
      </div>

      <form onSubmit={handleSubmit} className="commerce-comment-form">
        {/* Categoría */}
        <div className="form-group">
          <label htmlFor="category">¿Qué aspecto deseas comentar?</label>
          <div className="category-select-wrapper">
             <div className="category-icon-indicator">
                {categoryIcons[formData.category]}
             </div>
             <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="form-select custom-select"
              >
                <option value="SERVICIO">Atención y Servicio</option>
                <option value="AMBIENTE">Ambiente y Decoración</option>
                <option value="CALIDAD">Calidad de Productos</option>
                <option value="PRECIO">Relación Precio/Valor</option>
                <option value="OTRO">Otros comentarios</option>
              </select>
          </div>
        </div>

        {/* Rating */}
        <div className="form-group">
          <label>Calificación general</label>
          <div className="rating-selector-premium">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={32}
                className={`star-premium ${star <= formData.rating ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, rating: star })}
                fill={star <= formData.rating ? 'var(--color-primary)' : 'none'}
                stroke={star <= formData.rating ? 'var(--color-primary)' : 'rgba(255,255,255,0.2)'}
              />
            ))}
            <div className="rating-indicator-text">
                <span className="current-rating">{formData.rating}</span>
                <span className="max-rating">/ 5</span>
            </div>
          </div>
        </div>

        {/* Comentario */}
        <div className="form-group field-focus-effect">
          <label htmlFor="comment">Comentarios detallados</label>
          <textarea
            id="comment"
            placeholder="Dinos qué te pareció el lugar..."
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            required
            rows={5}
            className="form-textarea-premium"
          />
        </div>

        {/* Nombre (opcional) */}
        <div className="form-group">
          <label htmlFor="userName">Tu nombre (opcional)</label>
          <div className="input-with-icon">
            <User size={18} className="input-icon" />
            <input
                type="text"
                id="userName"
                placeholder="Permanecer anónimo"
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                className="form-input-premium"
            />
          </div>
          <div className="privacy-badge">
             <Info size={14} /> 
             <span>Feedback de uso interno exclusivo para administradores</span>
          </div>
        </div>

        {/* Botón Submit */}
        <div className="form-actions-comment">
            <button
                type="submit"
                disabled={!isFormValid}
                className="btn-submit-premium"
            >
                {isSubmitting ? (
                    <div className="btn-loader"></div>
                ) : (
                    <span className="btn-content">
                        <Send size={18} />
                        Enviar Feedback
                    </span>
                )}
            </button>
        </div>
      </form>
    </div>
  );
};

export default CommerceCommentForm;
