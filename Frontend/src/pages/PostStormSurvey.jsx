import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, CloudRain, Droplets, TreePine, Zap, Construction,
  CheckCircle, MapPin, Loader2, AlertTriangle, Send,
} from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import { useUser } from "../context/UserContext";

const SURVEY_ISSUES = [
  {
    key: "waterlogging",
    label: "Waterlogging",
    description: "Standing water on roads, flooded areas, or drainage overflow",
    icon: Droplets,
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.15)",
  },
  {
    key: "tree_fallen",
    label: "Tree Fallen",
    description: "Fallen trees blocking roads, power lines, or property",
    icon: TreePine,
    color: "#22c55e",
    bg: "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.15)",
  },
  {
    key: "power_outage",
    label: "Power Outage",
    description: "No electricity, exposed wiring, or damaged transformers",
    icon: Zap,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.15)",
  },
  {
    key: "road_damage",
    label: "Road Damage",
    description: "Potholes, cracks, landslides, or road erosion",
    icon: Construction,
    color: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.15)",
  },
];

const PostStormSurvey = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [activeSurvey, setActiveSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  const [selectedIssues, setSelectedIssues] = useState([]);
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [coords, setCoords] = useState(null);

  // Fetch active survey
  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user?.token}` } };
        const { data } = await axios.get("/api/v1/weather/active-survey", config);
        if (data.success && data.data) {
          setActiveSurvey(data.data);
        }
      } catch (err) {
        console.error("Error fetching active survey:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchSurvey();
    else setLoading(false);
  }, [user?.token]);

  const toggleIssue = (key) => {
    setSelectedIssues((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ latitude, longitude });
        try {
          const resp = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          if (resp.data?.display_name) {
            setAddress(resp.data.display_name);
          }
        } catch {
          setAddress(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        }
        setDetectingLocation(false);
      },
      () => setDetectingLocation(false),
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async () => {
    if (selectedIssues.length === 0) return;
    setSubmitting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const payload = {
        issues: selectedIssues,
        address: address || undefined,
        description: description || undefined,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
      };
      const { data } = await axios.post("/api/v1/weather/batch-survey", payload, config);
      if (data.success) {
        setSubmitted(true);
        setSubmitResult(data.data);
      }
    } catch (err) {
      console.error("Survey submission failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } } };
  const fadeUp = { hidden: { y: 24, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 18 } } };

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={28} className="animate-spin text-emerald-500" />
      </div>
    );
  }

  // ── No active survey ──
  if (!activeSurvey) {
    return (
      <motion.div className="max-w-lg mx-auto text-center pt-16 px-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="glass-card rounded-3xl p-10">
          <CloudRain size={56} className="mx-auto text-wayanad-muted opacity-30 mb-5" />
          <h2 className="text-2xl font-black text-wayanad-text mb-3">No Active Survey</h2>
          <p className="text-wayanad-muted mb-8 leading-relaxed">
            There's no post-storm survey active right now. Surveys are automatically triggered when a storm passes through your area.
          </p>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl font-bold text-white"
            style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)", boxShadow: "0 8px 25px -5px rgba(16,185,129,0.4)" }}>
            Go Back
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // ── Success ──
  if (submitted) {
    return (
      <motion.div className="max-w-lg mx-auto text-center pt-16 px-4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 100 }}>
        <div className="glass-card rounded-3xl p-10 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-20" style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }} />
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }}>
            <CheckCircle size={64} className="mx-auto text-emerald-500 mb-5" />
          </motion.div>
          <h2 className="text-2xl font-black text-wayanad-text mb-3">Survey Submitted!</h2>
          <p className="text-wayanad-muted mb-2 leading-relaxed">
            Thank you for your report. We've created{" "}
            <span className="text-emerald-500 font-black">{submitResult?.count || 0}</span>{" "}
            incident ticket{submitResult?.count !== 1 ? "s" : ""} from your survey.
          </p>
          <p className="text-wayanad-muted text-sm mb-8">
            The relevant authorities have been notified and will respond promptly.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/my-reports")}
              className="px-6 py-3 rounded-xl font-bold text-white"
              style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)", boxShadow: "0 8px 25px -5px rgba(16,185,129,0.4)" }}>
              View My Reports
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/")}
              className="px-6 py-3 rounded-xl font-bold text-wayanad-muted glass-card">
              Home
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  // ── Survey expiry countdown ──
  const expiresAt = activeSurvey.expiresAt ? new Date(activeSurvey.expiresAt) : null;
  const hoursLeft = expiresAt ? Math.max(0, Math.round((expiresAt - Date.now()) / 3600000)) : null;

  // ── Active survey form ──
  return (
    <motion.div className="max-w-2xl mx-auto pb-24 px-2" variants={stagger} initial="hidden" animate="visible">

      {/* Header */}
      <motion.div className="flex items-center gap-4 mb-8" variants={fadeUp}>
        <motion.button onClick={() => navigate(-1)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          className="p-2.5 -ml-2 rounded-xl glass-card text-wayanad-muted hover:text-wayanad-text transition-colors">
          <ArrowLeft size={20} />
        </motion.button>
        <div>
          <h1 className="text-2xl font-black text-wayanad-text flex items-center gap-2">
            <CloudRain size={24} className="text-blue-500" />
            Post-Storm Survey
          </h1>
          <p className="text-sm text-wayanad-muted">Tap the issues you've observed after the storm</p>
        </div>
      </motion.div>

      {/* Timer banner */}
      {hoursLeft !== null && (
        <motion.div variants={fadeUp} className="glass-card rounded-2xl p-4 mb-6 flex items-center gap-3" style={{ borderLeft: "3px solid #f59e0b" }}>
          <AlertTriangle size={18} className="text-yellow-500 flex-shrink-0" />
          <p className="text-sm text-wayanad-muted">
            This survey expires in <span className="text-yellow-500 font-black">{hoursLeft}h</span>. Submit your responses before it closes.
          </p>
        </motion.div>
      )}

      {/* Issue Cards */}
      <motion.div className="space-y-3 mb-8" variants={fadeUp}>
        <p className="text-xs font-bold text-wayanad-muted uppercase tracking-widest mb-2">Select all that apply</p>
        {SURVEY_ISSUES.map((issue) => {
          const Icon = issue.icon;
          const isSelected = selectedIssues.includes(issue.key);

          return (
            <motion.button
              key={issue.key}
              onClick={() => toggleIssue(issue.key)}
              whileHover={{ scale: 1.01, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className="w-full text-left glass-card rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 relative overflow-hidden group"
              style={{
                borderLeft: isSelected ? `3px solid ${issue.color}` : "3px solid transparent",
                background: isSelected ? issue.bg : undefined,
              }}
            >
              {isSelected && (
                <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-30" style={{ background: issue.color }} />
              )}

              <div className="p-3 rounded-xl flex-shrink-0 relative z-10 transition-all duration-300"
                style={{
                  background: isSelected ? issue.bg : "rgba(255,255,255,0.03)",
                  border: `1px solid ${isSelected ? issue.border : "rgba(255,255,255,0.06)"}`,
                  boxShadow: isSelected ? `0 4px 15px ${issue.border}` : "none",
                }}>
                <Icon size={22} style={{ color: isSelected ? issue.color : "#6b7280" }} />
              </div>

              <div className="flex-1 min-w-0 relative z-10">
                <h3 className="font-bold text-sm transition-colors" style={{ color: isSelected ? issue.color : "var(--wayanad-text, #e2e8f0)" }}>
                  {issue.label}
                </h3>
                <p className="text-xs text-wayanad-muted mt-0.5">{issue.description}</p>
              </div>

              <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 relative z-10 transition-all duration-300"
                style={{
                  background: isSelected ? issue.color : "transparent",
                  border: isSelected ? "none" : "2px solid rgba(255,255,255,0.1)",
                  boxShadow: isSelected ? `0 2px 10px ${issue.border}` : "none",
                }}>
                {isSelected && <CheckCircle size={14} className="text-white" />}
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Optional Details */}
      <motion.div variants={fadeUp} className="space-y-4 mb-8">
        <p className="text-xs font-bold text-wayanad-muted uppercase tracking-widest">Additional Details (Optional)</p>

        {/* Location */}
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-bold text-wayanad-text flex items-center gap-2">
              <MapPin size={14} className="text-emerald-500" /> Location
            </label>
            <button onClick={detectLocation} disabled={detectingLocation}
              className="text-xs text-emerald-500 hover:text-emerald-400 font-bold transition-colors flex items-center gap-1">
              {detectingLocation ? (<><Loader2 size={12} className="animate-spin" /> Detecting...</>) : "Auto-detect"}
            </button>
          </div>
          <input type="text" placeholder="Enter your location or use auto-detect" value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-transparent border rounded-xl px-4 py-3 text-sm text-wayanad-text placeholder:text-wayanad-muted/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            style={{ borderColor: "rgba(255,255,255,0.08)" }} />
        </div>

        {/* Description */}
        <div className="glass-card rounded-2xl p-4">
          <label className="text-sm font-bold text-wayanad-text mb-3 block">Notes</label>
          <textarea placeholder="Any additional details about the damage..." value={description}
            onChange={(e) => setDescription(e.target.value)} rows={3}
            className="w-full bg-transparent border rounded-xl px-4 py-3 text-sm text-wayanad-text placeholder:text-wayanad-muted/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none"
            style={{ borderColor: "rgba(255,255,255,0.08)" }} />
        </div>
      </motion.div>

      {/* Submit */}
      <motion.div variants={fadeUp}>
        <motion.button onClick={handleSubmit}
          disabled={selectedIssues.length === 0 || submitting}
          whileHover={selectedIssues.length > 0 ? { scale: 1.02, y: -2 } : {}}
          whileTap={selectedIssues.length > 0 ? { scale: 0.98 } : {}}
          className="w-full h-14 rounded-2xl font-bold text-lg text-white flex items-center justify-center gap-3 transition-all duration-300 relative overflow-hidden group disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: selectedIssues.length > 0 ? "linear-gradient(135deg, #10b981, #06b6d4)" : "rgba(255,255,255,0.05)",
            boxShadow: selectedIssues.length > 0 ? "0 10px 40px -10px rgba(16,185,129,0.5)" : "none",
          }}>
          {selectedIssues.length > 0 && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
          )}
          {submitting ? (
            <Loader2 size={22} className="animate-spin" />
          ) : (
            <>
              <Send size={20} className="relative z-10" />
              <span className="relative z-10">
                Submit Survey{selectedIssues.length > 0 && <span className="ml-1 opacity-80">({selectedIssues.length})</span>}
              </span>
            </>
          )}
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default PostStormSurvey;
