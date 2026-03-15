import React, { useState } from 'react';
import { Map, MapMarker, MarkerContent, MapControls } from './map';
import { MapPin, Move, ZoomIn } from 'lucide-react';

const MapView = ({ latitude, longitude, height = '450px', showHelper = true }) => {
  const [viewport, setViewport] = useState({
    center: [longitude, latitude],
    zoom: 14
  });

  if (!latitude || !longitude) return null;

  return (
    <div style={{ width: '100%' }}>
      <div style={{ 
        width: '100%', 
        height, 
        borderRadius: '16px', 
        overflow: 'hidden', 
        border: '1px solid rgba(255,255,255,0.1)', 
        position: 'relative',
        minHeight: '400px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}>
        {/* Forzamos height inline en el div del Map para que maplibre lo tome */}
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <Map
            viewport={viewport}
            onViewportChange={setViewport}
            style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
          >
            <MapControls showZoom showFullscreen />
            
            <MapMarker
              latitude={latitude}
              longitude={longitude}
            >
              <MarkerContent style={{ 
                background: '#8a2be2', 
                padding: '5px', 
                borderRadius: '50%', 
                boxShadow: '0 0 20px rgba(138, 43, 226, 0.6), 0 0 0 2px white', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
              }}>
                <div style={{ width: '10px', height: '10px', background: 'white', borderRadius: '50%' }} />
              </MarkerContent>
            </MapMarker>
          </Map>
        </div>
      </div>
      
      {showHelper && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem', 
          marginTop: '0.75rem', 
          padding: '0.6rem 1rem',
          background: 'rgba(139, 92, 246, 0.08)',
          border: '1px solid rgba(139, 92, 246, 0.15)',
          borderRadius: '10px',
          color: 'rgba(255,255,255,0.6)',
          fontSize: '0.8rem'
        }}>
          <Move size={14} style={{ flexShrink: 0, color: 'var(--color-primary, #8b5cf6)' }} />
          <span>Arrastrá el mapa para explorar la zona. Usá los botones <strong>+/-</strong> o pellizco para hacer zoom.</span>
        </div>
      )}
    </div>
  );
};

export default MapView;

