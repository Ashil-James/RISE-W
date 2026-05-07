import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { Crosshair, Loader2, Search } from 'lucide-react';

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

function MapFocus({ center }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.flyTo(center, Math.max(map.getZoom(), 15), { duration: 0.7 });
    }
  }, [center, map]);

  return null;
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
  } catch {
    setLocationName(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
  }
  setIsLocating(false);
};


const LocationPickerMap = ({ location, setLocation, locationName, setLocationName, onClose }) => {
  const [isLocating, setIsLocating] = useState(false);
  const [mapCenter, setMapCenter] = useState(location ? [location.lat, location.lon] : null);
  const [locationError, setLocationError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const detectCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Location detection is not supported by this browser.");
      setMapCenter((currentCenter) => currentCenter || [11.6, 76.1]);
      return;
    }

    setIsLocating(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setLocation({ lat, lon });
        setMapCenter([lat, lon]);
        reverseGeocode(lat, lon, setLocationName, setIsLocating);
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? "Allow location permission, or search and drop the pin manually."
            : "Could not get a precise GPS fix. Search or tap the map to set it.";
        setLocationError(message);
        setMapCenter((currentCenter) => currentCenter || [11.6, 76.1]);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }, [setLocation, setLocationName]);

  // Attempt to auto-detect if no location exists yet
  useEffect(() => {
    if (!location) {
      detectCurrentLocation();
    }
  }, [detectCurrentLocation, location]);

  const handleSearch = async (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    setLocationError("");
    try {
      const { data } = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: {
          q: query,
          format: "json",
          addressdetails: 1,
          limit: 1,
        },
      });

      const result = Array.isArray(data) ? data[0] : null;
      if (!result) {
        setLocationError("No matching place found. Try a nearby landmark or area name.");
        return;
      }

      const lat = Number(result.lat);
      const lon = Number(result.lon);
      setLocation({ lat, lon });
      setMapCenter([lat, lon]);
      setLocationName(result.display_name?.split(", ").slice(0, 3).join(", ") || query);
    } catch {
      setLocationError("Place search failed. Check your connection and try again.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-wayanad-panel border border-wayanad-border rounded-xl overflow-hidden mt-2">
      <div className="p-3 bg-white/5 dark:bg-black/20 border-b border-wayanad-border">
        <div className="flex justify-between items-start gap-3">
          <div>
            <h4 className="text-sm font-semibold text-wayanad-text">Select Your Area</h4>
            <p className="text-xs text-wayanad-muted">Use GPS, search, or tap anywhere to drop a pin</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={detectCurrentLocation}
              disabled={isLocating}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 disabled:opacity-60 transition-colors"
              title="Use my current location"
            >
              {isLocating ? <Loader2 size={14} className="animate-spin" /> : <Crosshair size={14} />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-xs px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg font-medium hover:bg-emerald-500/20 transition-colors"
            >
              Done
            </button>
          </div>
        </div>

        <form onSubmit={handleSearch} className="mt-3 flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-wayanad-muted" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search for a place or landmark"
              className="w-full rounded-lg border border-wayanad-border bg-wayanad-bg py-2 pl-9 pr-3 text-sm text-wayanad-text outline-none transition-all placeholder:text-wayanad-muted focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="inline-flex min-w-20 items-center justify-center rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSearching ? <Loader2 size={14} className="animate-spin" /> : "Search"}
          </button>
        </form>
        {locationError && <p className="mt-2 text-xs text-amber-500">{locationError}</p>}
      </div>

      <div className="relative min-h-48 flex-1 w-full bg-black/10">
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
            <MapFocus center={mapCenter} />
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
