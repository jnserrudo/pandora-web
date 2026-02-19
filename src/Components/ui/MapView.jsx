import React, { useState } from 'react';
import { Map, MapMarker, MarkerContent, MapControls } from './map';
import { MapPin } from 'lucide-react';

const MapView = ({ latitude, longitude, height = '300px' }) => {
  const [viewport, setViewport] = useState({
    center: [longitude, latitude],
    zoom: 14
  });

  if (!latitude || !longitude) return null;

  return (
    <div className="w-full rounded-xl overflow-hidden border border-white/10 relative" style={{ height }}>
      <Map
        viewport={viewport}
        onViewportChange={setViewport}
        className="w-full h-full"
      >
        <MapControls showZoom showFullscreen />
        
        <MapMarker
          latitude={latitude}
          longitude={longitude}
        >
          <MarkerContent className="bg-primary p-1.5 rounded-full shadow-lg border-2 border-white">
            <div className="w-3 h-3 bg-white rounded-full" />
          </MarkerContent>
        </MapMarker>
      </Map>
    </div>
  );
};

export default MapView;
