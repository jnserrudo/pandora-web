import React, { useState, useEffect } from 'react';
import { Map, MapMarker, MarkerContent, MapControls } from './map';
import { Search, MapPin } from 'lucide-react';

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
    <div className="w-full h-80 rounded-xl overflow-hidden border border-white/10 relative group">
      <Map
        viewport={viewport}
        onViewportChange={setViewport}
        onClick={handleMapClick}
        className="w-full h-full"
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
            <MarkerContent className="bg-primary p-1.5 rounded-full shadow-lg border-2 border-white">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            </MarkerContent>
          </MapMarker>
        )}
      </Map>

      {!marker && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none transition-opacity group-hover:opacity-0">
          <p className="text-white text-sm bg-black/60 px-4 py-2 rounded-full backdrop-blur-sm flex items-center gap-2">
            <MapPin size={16} className="text-primary" /> Toca en el mapa para marcar la ubicación
          </p>
        </div>
      )}
    </div>
  );
};

export default MapPicker;
