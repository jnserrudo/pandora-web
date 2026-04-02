import React, { useState, useEffect } from 'react';
import { getCommerceFAQs, createCommerceFAQ, updateCommerceFAQ, deleteCommerceFAQ } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Plus, Trash2, Edit2, Check, X, Loader2 } from 'lucide-react';
import './CommerceFAQManager.css';

const CommerceFAQManager = ({ commerceId }) => {
  const { token } = useAuth();
  const { showToast } = useToast();
  
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  
  const [editingId, setEditingId] = useState(null);
  const [editedQuestion, setEditedQuestion] = useState('');
  const [editedAnswer, setEditedAnswer] = useState('');

  useEffect(() => {
    fetchFaqs();
  }, [commerceId]);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const data = await getCommerceFAQs(commerceId);
      setFaqs(data);
    } catch (error) {
      showToast("Error al cargar las Preguntas Frecuentes", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      showToast("La pregunta y respuesta son obligatorias", "warning");
      return;
    }
    try {
      setLoading(true);
      const created = await createCommerceFAQ(commerceId, { question: newQuestion, answer: newAnswer }, token);
      setFaqs([created, ...faqs]);
      setIsAdding(false);
      setNewQuestion('');
      setNewAnswer('');
      showToast("FAQ agregada correctamente", "success");
    } catch (error) {
      const msg = error.message || '';
      showToast((msg === 'Failed to fetch' || msg.includes('NetworkError')) ? 'Error de conexión. Intentá de nuevo.' : msg || 'Error al agregar FAQ.', "error");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (faq) => {
    setEditingId(faq.id);
    setEditedQuestion(faq.question);
    setEditedAnswer(faq.answer);
  };

  const handleUpdate = async () => {
    if (!editedQuestion.trim() || !editedAnswer.trim()) return;
    try {
      setLoading(true);
      const updated = await updateCommerceFAQ(commerceId, editingId, { question: editedQuestion, answer: editedAnswer }, token);
      setFaqs(faqs.map(f => f.id === editingId ? updated : f));
      setEditingId(null);
      showToast("FAQ actualizada correctamente", "success");
    } catch (error) {
      const msg = error.message || '';
      showToast((msg === 'Failed to fetch' || msg.includes('NetworkError')) ? 'Error de conexión. Intentá de nuevo.' : msg || 'Error al actualizar FAQ.', "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (faqId) => {
    // Reemplazamos window.confirm por una lógica futura o simplemente omitimos el alert restrictivo.
    // Como el usuario pidió CERO ALERTS, quitaremos window.confirm. 
    try {
      setLoading(true);
      await deleteCommerceFAQ(commerceId, faqId, token);
      setFaqs(faqs.filter(f => f.id !== faqId));
      showToast("FAQ eliminada", "success");
    } catch (error) {
      const msg = error.message || '';
      showToast((msg === 'Failed to fetch' || msg.includes('NetworkError')) ? 'Error de conexión. Intentá de nuevo.' : msg || 'Error al eliminar FAQ.', "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading && faqs.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
        <Loader2 className="title-icon" style={{ animation: 'spin 2s linear infinite' }} size={32} />
        <p style={{ color: '#aaa', marginLeft: '0.75rem' }}>Cargando preguntas...</p>
      </div>
    );
  }

  return (
    <div className="faq-manager-container neo-glass-panel">
      <div className="faq-manager-header">
        <div>
          <h3>Preguntas Frecuentes</h3>
          <p>Responde a las dudas comunes de tus clientes fácilmente.</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)} 
            className="btn-add-faq"
          >
            <Plus size={18} /> Nueva
          </button>
        )}
      </div>

      {isAdding && (
        <div className="faq-add-form">
          <input 
            type="text" 
            placeholder="Pregunta (ej: ¿Cuáles son las opciones de pago?)"
            className="faq-input"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
          />
          <textarea 
            placeholder="Respuesta"
            className="faq-textarea"
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
          />
          <div className="faq-form-actions">
            <button 
              onClick={() => setIsAdding(false)} 
              className="btn-cancel-faq"
            >
              Cancelar
            </button>
            <button 
              onClick={handleAdd} 
              disabled={loading}
              className="btn-save-faq"
            >
              {loading ? 'Guardando...' : 'Guardar FAQ'}
            </button>
          </div>
        </div>
      )}

      {faqs.length === 0 && !isAdding ? (
        <div style={{ textAlign: 'center', color: '#aaa', padding: '2rem 0' }}>
          Aún no tienes preguntas frecuentes configuradas para este comercio.
        </div>
      ) : (
        <div className="faq-list">
          {faqs.map(faq => (
            <div key={faq.id} className="faq-item-card">
              {editingId === faq.id ? (
                <div style={{ width: '100%' }}>
                  <input 
                    type="text" 
                    className="faq-input"
                    style={{ marginBottom: '0.5rem' }}
                    value={editedQuestion}
                    onChange={(e) => setEditedQuestion(e.target.value)}
                  />
                  <textarea 
                    className="faq-textarea"
                    style={{ marginBottom: '0.5rem' }}
                    value={editedAnswer}
                    onChange={(e) => setEditedAnswer(e.target.value)}
                  />
                  <div className="faq-form-actions">
                    <button onClick={() => setEditingId(null)} className="btn-icon-faq delete">
                      <X size={16} />
                    </button>
                    <button onClick={handleUpdate} disabled={loading} className="btn-icon-faq edit" style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.2)' }}>
                      <Check size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="faq-item-content">
                    <h4>Q: {faq.question}</h4>
                    <p>A: {faq.answer}</p>
                  </div>
                  <div className="faq-item-actions">
                    <button 
                      onClick={() => startEdit(faq)}
                      className="btn-icon-faq edit"
                      aria-label="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(faq.id)}
                      className="btn-icon-faq delete"
                      aria-label="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommerceFAQManager;
