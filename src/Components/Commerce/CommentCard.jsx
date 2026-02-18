import React, { useState } from 'react';
import { Star, Clock, Trash2, CheckCircle, Edit, User, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import './CommentCard.css';

const CommentCard = ({ comment, onMarkAsRead, onDelete, onUpdateNotes }) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(comment.adminNotes || '');
  const [priority, setPriority] = useState(comment.priority || 'NORMAL');

  const handleSaveNotes = () => {
    onUpdateNotes(comment.id, { adminNotes: notes, priority });
    setIsEditingNotes(false);
  };

  const getPriorityColor = (p) => {
    switch(p) {
        case 'URGENT': return '#ef4444';
        case 'HIGH': return '#f97316';
        case 'LOW': return '#3b82f6';
        default: return '#64748b';
    }
  };

  return (
    <div className={`comment-card ${comment.isRead ? 'read' : 'unread'} priority-${priority.toLowerCase()}`}>
      <div className="comment-header">
        <div className="user-info">
          <div className="avatar-placeholder">
            <User size={18} />
          </div>
          <div>
            <h4 className="user-name">{comment.userName || comment.user?.name || 'Anónimo'}</h4>
            <span className="comment-date">
              <Clock size={12} />
              {format(new Date(comment.createdAt), "d 'de' MMMM, yyyy - HH:mm", { locale: es })}
            </span>
          </div>
        </div>
        
        <div className="comment-actions">
           {!comment.isRead && (
            <button 
                onClick={() => onMarkAsRead(comment.id)} 
                className="btn-icon btn-mark-read"
                title="Marcar como leído"
            >
                <CheckCircle size={18} />
            </button>
           )}
           <button 
                onClick={() => onDelete(comment.id)} 
                className="btn-icon btn-delete"
                title="Eliminar comentario"
            >
                <Trash2 size={18} />
            </button>
        </div>
      </div>

      <div className="comment-rating-category">
        <div className="rating-stars">
            {[...Array(5)].map((_, i) => (
                <Star 
                    key={i} 
                    size={14} 
                    fill={i < comment.rating ? "#fbbf24" : "none"} 
                    stroke={i < comment.rating ? "#fbbf24" : "#cbd5e1"}
                />
            ))}
        </div>
        <span className="category-badge">{comment.category}</span>
        {priority !== 'NORMAL' && (
             <span className="priority-badge" style={{ backgroundColor: getPriorityColor(priority) }}>
                {priority}
             </span>
        )}
      </div>

      <p className="comment-text">"{comment.comment}"</p>

      {/* Admin Section */}
      <div className="admin-notes-section">
        <div className="notes-header" onClick={() => setIsEditingNotes(!isEditingNotes)}>
            <div className="notes-header-title">
                <AlertCircle size={14} className="icon-gray"/>
                <span className="notes-label">Notas Internas</span>
            </div>
            {!isEditingNotes && (
                <button className="btn-icon-small">
                    <Edit size={12} />
                </button>
            )}
        </div>

        {isEditingNotes ? (
            <div className="notes-editor">
                <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Escribe notas para otros admins..."
                    className="notes-textarea"
                />
                <div className="notes-controls">
                    <select 
                        value={priority} 
                        onChange={(e) => setPriority(e.target.value)}
                        className="priority-select"
                    >
                        <option value="LOW">Baja</option>
                        <option value="NORMAL">Normal</option>
                        <option value="HIGH">Alta</option>
                        <option value="URGENT">Urgente</option>
                    </select>
                    <div className="notes-buttons">
                        <button onClick={() => setIsEditingNotes(false)} className="btn-cancel">Cancelar</button>
                        <button onClick={handleSaveNotes} className="btn-save">Guardar</button>
                    </div>
                </div>
            </div>
        ) : (
            notes && <p className="admin-notes-display">{notes}</p>
        )}
      </div>
    </div>
  );
};

export default CommentCard;
