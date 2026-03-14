import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

// Fix for default Leaflet marker icons turning up missing in some bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map clicks and move the pin
function LocationDragger({ position, setPosition, setLocationName, setIsLocating }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition({ lat, lon: lng });
      reverseGeocode(lat, lng, setLocationName, setIsLocating);
    },
  });

  return position ? <Marker position={[position.lat, position.lon]} /> : null;
}

// Helper to reverse geocode coords -> readable name
const reverseGeocode = async (lat, lon, setLocationName, setIsLocating) => {
  setIsLocating(true);
  try {
    const { data } = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
    );
    if (data && data.display_name) {
      const parts = data.display_name.split(', ');
      setLocationName(parts.slice(0, 3).join(', '));
    } else {
      setLocationName(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
    }
  } catch (err) {
    setLocationName(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
  }
  setIsLocating(false);
};


const LocationPickerMap = ({ location, setLocation, locationName, setLocationName, onClose }) => {
  const [isLocating, setIsLocating] = useState(false);
  const [mapCenter, setMapCenter] = useState(location ? [location.lat, location.lon] : null);

  // Attempt to auto-detect if no location exists yet
  useEffect(() => {
    if (!location && navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setLocation({ lat, lon });
          setMapCenter([lat, lon]);
          reverseGeocode(lat, lon, setLocationName, setIsLocating);
        },
        () => {
          // If denied/fails, fall back to Wayanad default (but don't set it as User's actual location until they click)
          setMapCenter([11.6, 76.1]);
          setIsLocating(false);
        }
      );
    } else if (!location) {
       setMapCenter([11.6, 76.1]);
    }
  }, [location, setLocation, setLocationName]);

  return (
    <div className="flex flex-col h-full bg-wayanad-panel border border-wayanad-border rounded-xl overflow-hidden mt-2">
      <div className="p-3 bg-white/5 dark:bg-black/20 border-b border-wayanad-border flex justify-between items-center">
        <div>
          <h4 className="text-sm font-semibold text-wayanad-text">Select Your Area</h4>
          <p className="text-xs text-wayanad-muted">Tap anywhere to drop a pin</p>
        </div>
        <button 
          type="button"
          onClick={onClose}
          className="text-xs px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg font-medium hover:bg-emerald-500/20 transition-colors"
        >
          Done
        </button>
      </div>

      <div className="relative h-64 w-full bg-black/10">
        {!mapCenter ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-wayanad-muted z-10">
            <Loader2 className="animate-spin mb-2" size={24} />
            <span className="text-sm">Detecting location...</span>
          </div>
        ) : (
          <MapContainer 
            center={mapCenter} 
            zoom={13} 
            className="w-full h-full z-0"
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">Carto</a>'
            />
            <LocationDragger 
              position={location}
              setPosition={setLocation}
              setLocationName={setLocationName}
              setIsLocating={setIsLocating}
            />
          </MapContainer>
        )}
      </div>

      <div className="p-3 bg-white/5 dark:bg-black/20 border-t border-wayanad-border flex items-center justify-between">
        <div className="flex-[2] truncate text-sm text-wayanad-text font-medium pr-2">
          {isLocating ? (
            <span className="flex items-center text-wayanad-muted"><Loader2 size={14} className="animate-spin mr-2"/> Getting place name...</span>
          ) : locationName ? (
            locationName
          ) : (
            <span className="text-wayanad-muted italic">No location selected</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationPickerMap;
