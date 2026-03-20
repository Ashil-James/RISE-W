import i18n from "./i18n";

/**
 * Detects the appropriate language based on GPS coordinates.
 * Uses OpenStreetMap's Nominatim reverse geocoding API (free, no key required).
 *
 * State-to-Language mapping:
 * - Kerala → Malayalam (ml)
 * - Hindi-belt states → Hindi (hi)
 * - Everything else → English (en)
 */

const HINDI_STATES = new Set([
  "uttar pradesh", "madhya pradesh", "bihar", "rajasthan", "jharkhand",
  "chhattisgarh", "haryana", "himachal pradesh", "uttarakhand",
  "delhi", "new delhi", "chandigarh",
]);

const STATE_LANGUAGE_MAP = {
  kerala: "ml",
};

export const detectLanguageFromCoordinates = async (lat, lng) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      { headers: { "Accept-Language": "en" } }
    );

    if (!res.ok) return "en";

    const data = await res.json();
    const state = (data.address?.state || "").toLowerCase().trim();

    if (STATE_LANGUAGE_MAP[state]) {
      const lang = STATE_LANGUAGE_MAP[state];
      i18n.changeLanguage(lang);
      return lang;
    }

    if (HINDI_STATES.has(state)) {
      i18n.changeLanguage("hi");
      return "hi";
    }

    // Fallback to English
    i18n.changeLanguage("en");
    return "en";
  } catch (err) {
    console.error("Language detection failed:", err);
    return "en";
  }
};

/**
 * Manually switch language.
 */
export const switchLanguage = (langCode) => {
  if (["en", "hi", "ml"].includes(langCode)) {
    i18n.changeLanguage(langCode);
  }
};
