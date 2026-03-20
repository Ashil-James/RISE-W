import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Sun, Cloud, CloudRain, CloudLightning, CloudSnow, 
  Wind, Droplets, MapPin, Loader2, ThermometerSun
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { motion } from 'framer-motion';

const API_BASE = "https://api.open-meteo.com/v1/forecast";

const WeatherWidget = () => {
  const { user } = useUser();
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Default to Wayanad if user has no location saved
  const lat = user?.location?.coordinates?.[1] || 11.605;
  const lon = user?.location?.coordinates?.[0] || 76.083;

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `${API_BASE}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,showers,snowfall,weather_code,cloud_cover,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;
        const { data } = await axios.get(url);
        setWeatherData(data);
      } catch (err) {
        console.error("Failed to fetch weather data", err);
        setError("Unable to load weather data at this time.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [lat, lon]);

  const getWeatherIcon = (code, size = 24, className = "") => {
    // WMO Weather interpretation codes
    if (code === 0) return <Sun size={size} className={`text-yellow-500 dark:text-yellow-400 ${className}`} />; // Clear
    if ([1, 2, 3].includes(code)) return <Cloud size={size} className={`text-slate-400 dark:text-gray-300 ${className}`} />; // Partly cloudy, overcast
    if ([45, 48].includes(code)) return <Cloud className={`text-slate-400 dark:text-gray-400 ${className}`} size={size} />; // Fog
    if ([51, 53, 55, 56, 57].includes(code)) return <CloudRain className={`text-blue-500 dark:text-blue-300 ${className}`} size={size} />; // Drizzle
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return <CloudRain className={`text-emerald-600 dark:text-emerald-400 ${className}`} size={size} />; // Rain/Showers
    if ([71, 73, 75, 77, 85, 86].includes(code)) return <CloudSnow className={`text-slate-600 dark:text-white ${className}`} size={size} />; // Snow
    if ([95, 96, 99].includes(code)) return <CloudLightning className={`text-yellow-600 dark:text-yellow-500 ${className}`} size={size} />; // Thunderstorm
    return <Sun size={size} className={`text-yellow-500 dark:text-yellow-400 ${className}`} />;
  };

  const getWeatherDescription = (code) => {
    if (code === 0) return "Clear sky";
    if ([1, 2, 3].includes(code)) return "Partly cloudy";
    if ([45, 48].includes(code)) return "Foggy";
    if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rain showers";
    if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snowfall";
    if ([95, 96, 99].includes(code)) return "Thunderstorm";
    return "Unknown";
  };

  const getDayName = (dateStr) => {
    const today = new Date().toISOString().split('T')[0];
    if (dateStr === today) return "Today";
    
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  if (loading) {
    return (
      <div className="inline-flex items-center justify-center py-2 px-6 rounded-full bg-white/5 border border-wayanad-border backdrop-blur-md min-h-[44px]">
        <Loader2 className="animate-spin text-emerald-500" size={16} />
      </div>
    );
  }

  if (error || !weatherData) return null;

  const { current, daily } = weatherData;

  const todayMax = Math.round(daily.temperature_2m_max[0]);
  const todayMin = Math.round(daily.temperature_2m_min[0]);
  const todayPrecip = daily.precipitation_sum[0];

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="inline-flex items-center gap-4 py-2.5 px-6 rounded-full bg-slate-900/5 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 shadow-sm dark:shadow-lg backdrop-blur-xl transition-all cursor-default"
    >
      {/* Temp and Icon */}
      <div className="flex items-center gap-2.5">
        {getWeatherIcon(current.weather_code, 22)}
        <span className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
          {Math.round(current.temperature_2m)}°
        </span>
      </div>

      <div className="w-px h-6 bg-slate-900/10 dark:bg-white/10"></div>

      {/* Description and Location Info */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-700 dark:text-gray-100 leading-none">
            {getWeatherDescription(current.weather_code)}
          </span>
          {todayPrecip > 0 && (
            <span className="text-[10px] font-black bg-blue-500/20 text-blue-600 dark:text-blue-300 px-1.5 py-0.5 rounded uppercase tracking-wider">
              {todayPrecip}mm Rain
            </span>
          )}
        </div>
        <span className="text-xs text-slate-500 dark:text-gray-400 font-medium mt-1 leading-none flex items-center gap-1.5">
          <MapPin size={10} className="text-emerald-600 dark:text-emerald-500" />
          {user?.location ? "My Location" : "Wayanad"}
          <span className="mx-0.5 opacity-50">•</span>
          H:{todayMax}° L:{todayMin}°
        </span>
      </div>
    </motion.div>
  );
};

export default WeatherWidget;
