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
    className: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  },
  {
    id: "Medium",
    label: "Warning",
    description: "Potential disruption or caution for nearby residents.",
    icon: Zap,
    className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  {
    id: "High",
    label: "Critical",
    description: "Immediate danger or urgent disruption residents should notice quickly.",
    icon: AlertTriangle,
    className: "bg-red-500/10 text-red-400 border-red-500/20",
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

  return (
    <motion.div
      className="w-full max-w-3xl mx-auto pb-20 space-y-6"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 110, damping: 18 }}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 -ml-2 rounded-xl glass-card text-wayanad-muted hover:text-wayanad-text transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-wayanad-text tracking-tight">Create Community Alert</h1>
          <p className="text-sm text-wayanad-muted">
            Community alerts publish immediately and are always labeled separately from official warnings.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="glass-card rounded-[2rem] p-6 md:p-8 space-y-6">
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 mb-2">
            <Info size={20} className="text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-sm text-cyan-100/80 leading-relaxed">
              <span className="font-bold text-cyan-300">Community alerts publish immediately</span> and are marked separately from official warnings. Keep your update factual and use "Critical" only for urgent safety risks.
            </div>
          </div>

          <div className="space-y-3 mt-4">
            <label className="text-xs font-black uppercase tracking-[0.18em] text-wayanad-muted">
              Alert Category
            </label>
            <select
              value={formData.category}
              onChange={(event) => setFormData((previous) => ({ ...previous, category: event.target.value }))}
              className="w-full glass-card rounded-2xl px-4 py-3 text-sm text-wayanad-text bg-transparent outline-none"
            >
              {COMMUNITY_CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="bg-slate-900">
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-[0.18em] text-wayanad-muted">
              Severity
            </label>
            <div className="grid grid-cols-3 gap-3">
              {SEVERITY_OPTIONS.map((option) => {
                const active = formData.severity === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setFormData((previous) => ({ ...previous, severity: option.id }))}
                    className={`flex flex-col items-center justify-center text-center rounded-2xl border p-4 transition-all ${
                      active ? option.className : "border-white/10 bg-white/[0.02] text-wayanad-muted hover:bg-white/[0.05]"
                    }`}
                  >
                    <option.icon size={20} className="mb-2" />
                    <p className="text-sm font-black">{option.label}</p>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-wayanad-muted text-center mt-2 px-4">
              {SEVERITY_OPTIONS.find((o) => o.id === formData.severity)?.description}
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-[0.18em] text-wayanad-muted">
              Alert Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(event) => setFormData((previous) => ({ ...previous, title: event.target.value }))}
              className="w-full glass-card rounded-2xl px-4 py-3 text-sm text-wayanad-text bg-transparent outline-none"
              placeholder="e.g. Water rising near the bus stand"
              required
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-[0.18em] text-wayanad-muted">
              Location
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-wayanad-muted" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(event) => setFormData((previous) => ({ ...previous, location: event.target.value }))}
                  className="w-full glass-card rounded-2xl px-4 py-3 pl-11 text-sm text-wayanad-text bg-transparent outline-none"
                  placeholder="Near the market, Sector B, main road..."
                />
              </div>
              <button
                type="button"
                onClick={detectLocation}
                className="px-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-sm font-bold hover:bg-emerald-500/15 transition-colors"
              >
                Use My Location
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-[0.18em] text-wayanad-muted">
              Details
            </label>
            <textarea
              rows={5}
              value={formData.message}
              onChange={(event) => setFormData((previous) => ({ ...previous, message: event.target.value }))}
              className="w-full glass-card rounded-2xl px-4 py-3 text-sm text-wayanad-text bg-transparent outline-none resize-none"
              placeholder="Describe what is happening, who may be affected, and any immediate advice for residents."
              required
            />
          </div>

          {formError && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {formError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl font-black text-white flex items-center justify-center gap-3 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #0891b2, #06b6d4)" }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Send size={18} />
                Publish Community Alert
              </>
            )}
          </button>
        </form>


      </div>
    </motion.div>
  );
};

export default CreateAlert;
