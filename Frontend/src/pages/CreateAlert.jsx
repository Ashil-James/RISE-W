import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Info,
  Loader2,
  MapPin,
  Send,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAlerts } from "../context/AlertContext";
import { COMMUNITY_CATEGORY_OPTIONS } from "../utils/alertTracking";

const SEVERITY_OPTIONS = [
  {
    id: "Low",
    label: "Info",
    description: "Useful local update without immediate danger.",
    icon: Info,
    colorClass: "text-blue-500",
  },
  {
    id: "Medium",
    label: "Warning",
    description: "Potential disruption or caution for nearby residents.",
    icon: Zap,
    colorClass: "text-orange-500",
  },
  {
    id: "High",
    label: "Critical",
    description: "Immediate danger or urgent disruption residents should notice quickly.",
    icon: AlertTriangle,
    colorClass: "text-red-500",
  },
];

const CreateAlert = () => {
  const navigate = useNavigate();
  const { addAlert } = useAlerts();

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    category: "SAFETY_ALERT",
    severity: "Low",
    message: "",
    location: "",
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) {
      setFormError("Please add a title and some details before publishing.");
      return;
    }

    setLoading(true);
    setFormError("");

    try {
      await addAlert(formData);
      navigate("/alerts");
    } catch (error) {
      setFormError(error.response?.data?.message || "Failed to publish your community alert.");
    } finally {
      setLoading(false);
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setFormError("Geolocation is not supported by your browser.");
      return;
    }

    const originalLocation = formData.location;
    setFormData((previous) => ({ ...previous, location: "Fetching location..." }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
          );
          const data = await response.json();

          if (data.display_name) {
            const address = data.display_name.split(",").slice(0, 3).join(", ");
            setFormData((previous) => ({ ...previous, location: address }));
          } else {
            setFormData((previous) => ({
              ...previous,
              location: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
            }));
          }
        } catch (error) {
          console.error("Geocoding failed:", error);
          setFormData((previous) => ({ ...previous, location: originalLocation }));
          setFormError("Could not fetch your address details.");
        }
      },
      () => {
        setFormData((previous) => ({ ...previous, location: originalLocation }));
        setFormError("Unable to retrieve your location.");
      },
    );
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <motion.div
      className="w-full max-w-3xl mx-auto pb-24 space-y-8 pt-8 md:pt-16"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
    >
      <motion.div variants={fadeUp} className="flex items-start gap-4 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 -ml-2 rounded-lg text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white bg-neutral-100 dark:bg-neutral-900 border border-black/5 dark:border-white/5 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white tracking-tight">Broadcast Alert</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-md">
            Community alerts publish immediately to the public feed.
          </p>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="max-w-2xl">
        <form onSubmit={handleSubmit} className="w-full">
          <div className="bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-[1.5rem] p-6 md:p-10 shadow-sm space-y-8">
            
            {/* Category */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-neutral-500 dark:text-neutral-400">
                Alert Category
              </label>
              <div className="relative">
                <select
                  value={formData.category}
                  onChange={(event) => setFormData((previous) => ({ ...previous, category: event.target.value }))}
                  className="w-full rounded-xl px-4 py-3.5 text-sm font-medium text-black dark:text-white bg-neutral-50 dark:bg-[#111] border border-black/10 dark:border-white/10 outline-none focus:border-black/30 dark:focus:border-white/30 transition-colors appearance-none"
                >
                  {COMMUNITY_CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>

            {/* Severity */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-neutral-500 dark:text-neutral-400">
                Severity Level
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {SEVERITY_OPTIONS.map((option) => {
                  const active = formData.severity === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setFormData((previous) => ({ ...previous, severity: option.id }))}
                      className={`text-center rounded-xl border py-4 px-3 flex flex-col items-center gap-2 transition-all ${
                        active 
                          ? `bg-neutral-100 dark:bg-neutral-800 border-black/20 dark:border-white/20 shadow-sm ring-1 ring-black/5 dark:ring-white/5` 
                          : "bg-transparent border-black/10 dark:border-white/10 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-[#111]"
                      }`}
                    >
                      <option.icon size={20} className={active ? option.colorClass : "opacity-60"} />
                      <p className={`text-xs font-semibold uppercase tracking-wider ${active ? "text-black dark:text-white" : ""}`}>{option.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-neutral-500 dark:text-neutral-400">
                Headline
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(event) => setFormData((previous) => ({ ...previous, title: event.target.value }))}
                className="w-full rounded-xl px-4 py-3.5 text-sm font-medium text-black dark:text-white bg-neutral-50 dark:bg-[#111] border border-black/10 dark:border-white/10 outline-none focus:border-black/30 dark:focus:border-white/30 transition-colors placeholder:text-neutral-400"
                placeholder="Brief summary of the incident..."
                required
              />
            </div>

            {/* Location */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-neutral-500 dark:text-neutral-400">
                Pinpoint Location
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(event) => setFormData((previous) => ({ ...previous, location: event.target.value }))}
                    className="w-full rounded-xl px-4 py-3.5 pl-11 text-sm font-medium text-black dark:text-white bg-neutral-50 dark:bg-[#111] border border-black/10 dark:border-white/10 outline-none focus:border-black/30 dark:focus:border-white/30 transition-colors placeholder:text-neutral-400"
                    placeholder="Area, distinct landmark..."
                  />
                </div>
                <button
                  type="button"
                  onClick={detectLocation}
                  className="px-6 py-3.5 sm:py-0 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] text-black dark:text-white text-sm font-medium hover:bg-neutral-50 dark:hover:bg-[#111] transition-colors whitespace-nowrap flex items-center justify-center gap-2"
                >
                  <MapPin size={16} /> GPS
                </button>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-neutral-500 dark:text-neutral-400">
                Details & Instructions
              </label>
              <textarea
                rows={5}
                value={formData.message}
                onChange={(event) => setFormData((previous) => ({ ...previous, message: event.target.value }))}
                className="w-full rounded-xl px-4 py-3.5 text-sm font-medium text-black dark:text-white bg-neutral-50 dark:bg-[#111] border border-black/10 dark:border-white/10 outline-none focus:border-black/30 dark:focus:border-white/30 transition-colors placeholder:text-neutral-400 resize-none leading-relaxed"
                placeholder="Elaborate on the situation. Include actionable advice if possible."
                required
              />
            </div>

            {/* Submit */}
            <div className="pt-6 border-t border-black/10 dark:border-white/10">
              {formError && (
                <div className="rounded-xl border border-red-500/20 bg-red-50 dark:bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 mb-6 flex items-start gap-3">
                  <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                  <p>{formError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl font-semibold text-sm text-white dark:text-black bg-black dark:bg-white hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Broadcasting...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Publish Alert
                  </>
                )}
              </button>
              
              <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                <ShieldCheck size={14} />
                <span>Verified Public Feed</span>
              </div>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CreateAlert;
