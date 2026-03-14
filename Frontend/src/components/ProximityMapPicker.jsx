import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Crosshair, Search, Loader2 } from 'lucide-react';
import axios from 'axios';

// Fix for default Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map clicks to drop the center pin
function LocationSelector({ center, setCenter }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setCenter({ lat, lng });
    },
  });

  return center ? (
    <Marker position={[center.lat, center.lng]} />
  ) : null;
}

// Component to handle programmatic map panning when search completes
function MapSearchController({ searchCoords }) {
  const map = useMap();
  useEffect(() => {
    if (searchCoords) {
      map.flyTo([searchCoords.lat, searchCoords.lng], 12);
    }
  }, [searchCoords, map]);
  return null;
}

const ProximityMapPicker = ({ center, setCenter, radiusKm, setRadiusKm }) => {
  const defaultCenter = [11.6, 76.1];
  const mapCenter = center ? [center.lat, center.lng] : defaultCenter;

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchCoords, setSearchCoords] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const { data } = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`
      );
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setCenter({ lat, lng });
        setSearchCoords({ lat, lng });
        setSearchQuery('');
      } else {
        alert("Location not found. Try a different search term.");
      }
    } catch (error) {
      console.error("Geocoding failed:", error);
      alert("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="w-full bg-black/20 border border-white/10 rounded-2xl overflow-hidden shadow-inner flex flex-col">
      {/* Map Header / Controls */}
      <div className="p-4 bg-black/40 border-b border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Crosshair size={16} className="text-emerald-500" />
            Target Area Selection
          </h4>
          
          <div className="mt-3 relative flex items-center">
            <div className="absolute left-3 text-gray-500">
              {isSearching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            </div>
            <input 
              type="text"
              placeholder="Search city, sector, or landmark..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch(e);
                }
              }}
              className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-20 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-colors placeholder-gray-600"
            />
            <button 
              type="button" 
              onClick={handleSearch}
              disabled={isSearching}
              className="absolute right-1 top-1 bottom-1 px-3 bg-emerald-500 hover:bg-emerald-400 text-white text-[10px] font-bold rounded-md transition-colors disabled:opacity-50"
            >
              LOCATE
            </button>
          </div>
        </div>
        
        {/* Radius Slider */}
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-gray-300">
            <span>Blast Radius</span>
            <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded animate-pulse">{radiusKm} km</span>
          </div>
          <input 
            type="range" 
            min="0.5" 
            max="100" 
            step="0.5" 
            value={radiusKm}
            onChange={(e) => setRadiusKm(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-[10px] text-gray-500 font-medium">
            <span>0.5km (Local)</span>
            <span>100km (Regional)</span>
          </div>
        </div>
      </div>

      {/* Map View */}
      <div className="relative h-[300px] w-full z-0">
        <MapContainer 
          center={mapCenter} 
          zoom={11} 
          className="w-full h-full"
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">Carto</a>'
          />
          <MapSearchController searchCoords={searchCoords} />
          <LocationSelector center={center} setCenter={setCenter} />
          {center && (
            <Circle 
              center={[center.lat, center.lng]} 
              radius={radiusKm * 1000} // Leaflet uses meters
              pathOptions={{
                color: '#10b981',
                fillColor: '#10b981',
                fillOpacity: 0.2,
                weight: 2,
                dashArray: '4, 8'
              }}
            />
          )}
        </MapContainer>
        {!center && (
          <div className="absolute inset-0 z-[400] bg-black/40 flex items-center justify-center pointer-events-none">
            <div className="bg-black/80 text-emerald-500 border border-emerald-500/30 px-4 py-2 rounded-full text-sm font-bold shadow-2xl backdrop-blur-md flex items-center gap-2 animate-bounce">
              <Crosshair size={18} />
              Tap map to drop target epicenter
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProximityMapPicker;
