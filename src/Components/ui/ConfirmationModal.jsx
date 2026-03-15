// src/Components/ui/ConfirmationModal.jsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import './ConfirmationModal.css';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, loading }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-icon">
                    <AlertTriangle size={32} />
                </div>
                <h3>{title || '¿Estás seguro?'}</h3>
                <p>{message || 'Esta acción no se puede deshacer.'}</p>
                
                <div className="modal-actions">
                    <button 
                        className="btn-modal-cancel" 
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button 
                        className="btn-modal-confirm" 
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Procesando...' : 'Confirmar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
