import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { Loader2, Search } from 'lucide-react';

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

function MapNavigator({ target }) {
  const map = useMap();

  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lon], 15, { duration: 0.8 });
    }
  }, [map, target]);

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
  } catch (err) {
    setLocationName(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
  }
  setIsLocating(false);
};


const LocationPickerMap = ({ location, setLocation, locationName, setLocationName, onClose }) => {
  const [isLocating, setIsLocating] = useState(false);
  const [mapCenter, setMapCenter] = useState(location ? [location.lat, location.lon] : null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [navigationTarget, setNavigationTarget] = useState(null);

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

  const handleSearch = async (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    setSearchError("");

    try {
      const { data } = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: {
          q: query,
          format: "json",
          limit: 1,
          addressdetails: 1,
        },
      });

      if (!data?.length) {
        setSearchError("Location not found. Try a nearby landmark or area name.");
        return;
      }

      const lat = Number.parseFloat(data[0].lat);
      const lon = Number.parseFloat(data[0].lon);
      const nextLocation = { lat, lon };
      const displayName = data[0].display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;

      setLocation(nextLocation);
      setMapCenter([lat, lon]);
      setNavigationTarget(nextLocation);
      setLocationName(displayName.split(", ").slice(0, 3).join(", "));
      setSearchQuery("");
    } catch (err) {
      console.error("Location search failed:", err);
      setSearchError("Search failed. Move the map manually or try again.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-wayanad-panel border border-wayanad-border rounded-xl overflow-hidden mt-2">
      <div className="p-3 bg-white/5 dark:bg-black/20 border-b border-wayanad-border space-y-3">
        <div className="flex justify-between items-start gap-3">
          <div>
            <h4 className="text-sm font-semibold text-wayanad-text">Select Your Area</h4>
            <p className="text-xs text-wayanad-muted">Search, then tap the map to fine tune the pin</p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-xs px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg font-medium hover:bg-emerald-500/20 transition-colors"
          >
            Done
          </button>
        </div>
        <form onSubmit={handleSearch} className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-wayanad-muted">
            {isSearching ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              if (searchError) setSearchError("");
            }}
            placeholder="Search area, road, or landmark..."
            className="w-full bg-wayanad-bg border border-wayanad-border rounded-xl py-2.5 pl-9 pr-20 text-sm text-wayanad-text outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-wayanad-muted"
          />
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Search
          </button>
        </form>
        {searchError && (
          <p className="text-xs text-amber-500">{searchError}</p>
        )}
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
            <MapNavigator target={navigationTarget} />
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
