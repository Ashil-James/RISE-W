import axios from "axios";

/**
 * Open-Meteo API — completely free, no API key required.
 * Returns hourly precipitation and weather codes for the next 24 hours.
 */
export const getForecast = async (lat, lon) => {
    try {
        const response = await axios.get(
            `https://api.open-meteo.com/v1/forecast`, {
                params: {
                    latitude: lat,
                    longitude: lon,
                    hourly: "precipitation,weather_code",
                    forecast_days: 1,
                    timezone: "auto",
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching weather forecast:", error.message);
        return null;
    }
};

/**
 * Check if heavy rain is expected in the next 6 hours.
 * 
 * WMO Weather codes for heavy/dangerous precipitation:
 *   65 = Heavy rain, 67 = Heavy freezing rain,
 *   75 = Heavy snow, 77 = Snow grains,
 *   82 = Violent rain showers,
 *   95 = Thunderstorm, 96 = Thunderstorm with slight hail,
 *   99 = Thunderstorm with heavy hail
 * 
 * Also triggers if precipitation > 10mm/hour in any of the next 6 hours.
 */
const HEAVY_WEATHER_CODES = [65, 67, 75, 77, 82, 95, 96, 99];

export const checkHeavyRain = (forecastData) => {
    if (!forecastData?.hourly) return false;

    const { precipitation, weather_code, time } = forecastData.hourly;
    if (!precipitation || !weather_code || !time) return false;

    const now = new Date();
    const sixHoursLater = new Date(now.getTime() + 6 * 60 * 60 * 1000);

    for (let i = 0; i < time.length; i++) {
        const forecastTime = new Date(time[i]);
        if (forecastTime < now || forecastTime > sixHoursLater) continue;

        // Check for dangerous weather codes
        if (HEAVY_WEATHER_CODES.includes(weather_code[i])) return true;

        // Check for heavy precipitation (> 10mm/hour)
        if (precipitation[i] > 10) return true;
    }

    return false;
};

/**
 * Get a human-readable location name for a coordinate pair.
 * Uses Nominatim (OpenStreetMap) reverse geocoding — free, no API key.
 */
export const getLocationName = async (lat, lon) => {
    try {
        const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse`, {
                params: { lat, lon, format: "json", zoom: 10 },
                headers: { "User-Agent": "RISE-W-WeatherMonitor/1.0" },
            }
        );
        if (response.data?.display_name) {
            // Return a shortened version (first 2-3 parts)
            const parts = response.data.display_name.split(", ");
            return parts.slice(0, 3).join(", ");
        }
    } catch {
        // Fallback silently
    }
    return `Area (${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E)`;
};
