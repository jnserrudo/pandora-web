import React, { useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
import '../pages/AdminAdvertisementFormPage.css';

export default function ImageOverlayPreview({ 
  imageUrl, 
  onUploadChange, 
  onRemove, 
  uploading = false,
  imageContainerClassName = "image-preview-container",
  imageClassName = ""
}) {
  const fileInputRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  if (!imageUrl) return null;

  return (
    <div 
      className="image-overlay-wrapper"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        width: '100%',
        borderRadius: '12px',
        overflow: 'hidden',
        display: 'block',
        margin: 0,
        padding: 0
      }}
    >
      <style>{`
        .image-overlay-wrapper .force-row-container {
          display: flex !important;
          flex-direction: row !important;
          flex-wrap: nowrap !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 15px !important;
          width: 100% !important;
        }
        .image-overlay-wrapper .btn-overlay-base {
          flex: 0 0 auto !important;
          width: auto !important;
          min-width: fit-content !important;
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 8px !important;
          white-space: nowrap !important;
          padding: 12px 20px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          font-size: 0.85rem !important;
          transition: all 0.2s ease !important;
        }
        .image-overlay-wrapper .btn-overlay-base:hover {
          transform: translateY(-2px) !important;
          filter: brightness(1.2) !important;
        }
        @media (max-width: 600px) {
          .image-overlay-wrapper .force-row-container {
            flex-direction: column !important;
            gap: 10px !important;
          }
          .image-overlay-wrapper .btn-overlay-base {
            width: 130px !important;
            padding: 10px 15px !important;
            font-size: 0.75rem !important;
          }
        }
      `}</style>
      
      {/* 1. Contenedor de la Imagen */}
      <div 
        className={imageContainerClassName} 
        style={{ 
          margin: 0, 
          padding: 0, 
          display: 'block',
          width: '100%',
          position: 'relative'
        }}
      >
        {uploading && (
          <div className="upload-overlay" style={{ zIndex: 30 }}>
            <div className="spinner-sm"></div>
            <span>Subiendo...</span>
          </div>
        )}
        <img 
          src={imageUrl} 
          alt="Preview" 
          className={imageClassName}
          style={{ 
            width: '100%', 
            display: 'block',
            margin: 0,
            borderRadius: '12px',
            transform: isHovered ? 'scale(1.03)' : 'scale(1)',
            transition: 'transform 0.5s ease'
          }} 
        />
      </div>

      {/* 2. Overlay Centrado (Hover detectable por JS) */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 20,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          opacity: isHovered ? 1 : 0,
          visibility: isHovered ? 'visible' : 'hidden',
          transition: 'all 0.3s ease',
          pointerEvents: 'auto'
        }}
      >
        {/* Contenedor de Botones - FUERZA ROW SIEMPRE */}
        <div 
          className="force-row-container"
          style={{
            transform: isHovered ? 'translateY(0)' : 'translateY(15px)',
            transition: 'transform 0.3s ease'
          }}
        >
          {/* Botón CAMBIAR */}
          <div 
            onClick={() => !uploading && fileInputRef.current?.click()}
            className="btn-overlay-base"
            style={{ 
              backgroundColor: 'rgba(138, 43, 226, 0.25)',
              border: '1px solid rgba(138, 43, 226, 0.9)',
              color: '#fff',
              borderRadius: '10px',
              cursor: 'pointer'
            }}
          >
            <Camera size={18} />
            <span>Cambiar imagen</span>
            <input 
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={onUploadChange} 
              accept="image/*" 
              disabled={uploading}
            />
          </div>

          {/* Botón QUITAR */}
          <button 
            type="button" 
            className="btn-overlay-base"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            disabled={uploading}
            style={{ 
              backgroundColor: 'rgba(231, 76, 60, 0.25)',
              border: '1px solid rgba(231, 76, 60, 0.9)',
              color: '#fff',
              borderRadius: '10px',
              cursor: 'pointer'
            }}
          >
            <X size={18} /> 
            <span>Quitar imagen</span>
          </button>
        </div>
      </div>
    </div>
  );
}
