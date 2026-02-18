import React, { useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info, 
  X 
} from 'lucide-react';
import './Toast.css';

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle className="toast-icon success" />;
      case 'error': return <XCircle className="toast-icon error" />;
      case 'warning': return <AlertCircle className="toast-icon warning" />;
      default: return <Info className="toast-icon info" />;
    }
  };

  return (
    <div className={`toast-item glass-morphism ${type}`}>
      <div className="toast-content">
        {getIcon()}
        <span className="toast-message">{message}</span>
      </div>
      <button className="toast-close" onClick={onClose}>
        <X size={16} />
      </button>
      <div className="toast-progress" />
    </div>
  );
};

export default Toast;
