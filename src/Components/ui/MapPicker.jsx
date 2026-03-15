import React, { useState } from 'react';
import { Map, MapMarker, MarkerContent, MapControls } from './map';
import { MapPin, Move } from 'lucide-react';

const MapPicker = ({ initialLat, initialLng, onChange }) => {
  const [marker, setMarker] = useState(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );

  // Coordenadas iniciales por defecto (ej. Salta, Argentina)
  const defaultCenter = { lng: -65.4117, lat: -24.7859 };
  const [viewport, setViewport] = useState({
    center: marker ? [marker.lng, marker.lat] : [defaultCenter.lng, defaultCenter.lat],
    zoom: 13
  });

  const handleMapClick = (e) => {
    const { lng, lat } = e.lngLat;
    const newMarker = { lat, lng };
    setMarker(newMarker);
    if (onChange) {
      onChange(newMarker);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ 
        width: '100%', 
        height: '450px', 
        borderRadius: '16px', 
        overflow: 'hidden', 
        border: '1px solid rgba(255,255,255,0.1)', 
        position: 'relative',
        minHeight: '400px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}>
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <Map
            viewport={viewport}
            onViewportChange={setViewport}
            onClick={handleMapClick}
            style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
          >
            <MapControls showZoom showLocate showFullscreen />
            
            {marker && (
              <MapMarker
                latitude={marker.lat}
                longitude={marker.lng}
                draggable
                onDragEnd={(newPos) => {
                  setMarker(newPos);
                  if (onChange) onChange(newPos);
                }}
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
                  <div style={{ 
                    width: '10px', height: '10px', 
                    background: 'white', borderRadius: '50%',
                    animation: 'pulse 2s infinite'
                  }} />
                </MarkerContent>
              </MapMarker>
            )}
          </Map>
        </div>

        {!marker && (
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: 'rgba(0,0,0,0.4)', 
            pointerEvents: 'none',
            zIndex: 5
          }}>
            <p style={{ 
              color: 'white', 
              fontSize: '0.9rem', 
              background: 'rgba(0,0,0,0.6)', 
              padding: '10px 20px', 
              borderRadius: '50px', 
              backdropFilter: 'blur(4px)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px' 
            }}>
              <MapPin size={16} style={{ color: 'var(--color-primary, #8b5cf6)' }} /> Tocá en el mapa para marcar la ubicación
            </p>
          </div>
        )}
      </div>

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
        <span>
          {marker 
            ? <>Ubicación marcada. Podés <strong>arrastrar el pin</strong> para ajustar o tocar otro punto del mapa.</>
            : <>Tocá en el mapa para colocar el pin de ubicación de tu comercio. Usá <strong>+/-</strong> para hacer zoom.</>
          }
        </span>
      </div>
    </div>
  );
};

export default MapPicker;

