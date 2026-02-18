import React, { useState } from 'react';
import { Send, BarChart2 } from 'lucide-react';
import './AdvisoryForm.css';

const AdvisoryForm = ({ commerceId, metrics, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    recommendations: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
        await onSubmit(commerceId, formData);
        setFormData({ title: '', content: '', recommendations: '' });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="advisory-form-container glass-panel">
      <div className="advisory-header">
        <h3><BarChart2 size={20}/> Nueva Asesoría</h3>
        <p>Envía recomendaciones basadas en métricas reales</p>
      </div>

      <div className="metrics-snapshot">
        <span className="snapshot-label">Snapshot de Métricas (se adjuntará):</span>
        <div className="snapshot-data">
            <span>CTR: {metrics?.ctr}%</span> • 
            <span> Rating: {metrics?.averageRating?.toFixed(1) || 'N/A'}</span> • 
            <span> Comentarios: {metrics?.totalComments}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="advisory-form">
        <div className="form-group">
            <label>Título de la Asesoría</label>
            <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Ej: Optimización de Imágenes de Portada"
                required
                className="form-input"
            />
        </div>

        <div className="form-group">
            <label>Análisis de Situación</label>
            <textarea 
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                placeholder="Explica qué observas en las métricas y comentarios..."
                required
                className="form-textarea"
                rows={4}
            />
        </div>

        <div className="form-group">
            <label>Recomendaciones Accionables</label>
            <textarea 
                value={formData.recommendations}
                onChange={(e) => setFormData({...formData, recommendations: e.target.value})}
                placeholder="Lista pasos concretos para mejorar..."
                required
                className="form-textarea"
                rows={4}
            />
        </div>

        <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-cancel">
                Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-submit-advisory">
                <Send size={16} />
                {isSubmitting ? 'Enviando...' : 'Enviar Asesoría'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default AdvisoryForm;
