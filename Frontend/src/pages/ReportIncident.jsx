import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap, Droplets, PawPrint, Construction, ArrowLeft,
  Camera, Check, X, MapPin, Loader2,
} from "lucide-react";
import { useReports } from "../context/ReportContext";
import { motion, AnimatePresence } from "framer-motion";

const ReportIncident = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { addReport } = useReports();

  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    specificIssue: "", poleNumber: "", description: "", address: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle");
  const [coords, setCoords] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: "water", label: "Water & Sanitation", icon: Droplets, color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
    { id: "wildlife", label: "Wildlife Intrusion", icon: PawPrint, color: "#f97316", bg: "rgba(249,115,22,0.1)" },
    { id: "power", label: "Power Issue", icon: Zap, color: "#eab308", bg: "rgba(234,179,8,0.1)" },
    { id: "infra", label: "Infrastructure", icon: Construction, color: "#6b7280", bg: "rgba(107,114,128,0.1)" },
  ];

  const handleCategorySelect = (cat) => { setSelectedCategory(cat); setStep(2); };
  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleImagePick = (e) => { const f = e.target.files[0]; if (f) { setImageFile(f); setSelectedImage(URL.createObjectURL(f)); } };

  const handleGetLocation = () => {
    if (!navigator.geolocation) { alert("Geolocation not supported"); return; }
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data.display_name) setFormData(prev => ({ ...prev, address: data.display_name.split(',').slice(0, 4).join(', ') }));
        } catch (e) { console.error("Geocoding failed", e); }
        setLocationStatus("success");
      },
      () => { setLocationStatus("error"); alert("Unable to retrieve location"); },
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    let uploadedImageUrl = null;
    if (imageFile) {
      const fd = new FormData(); fd.append("image", imageFile);
      try {
        const res = await fetch("/api/v1/upload", { method: "POST", body: fd });
        if (!res.ok) throw new Error("Upload failed");
        uploadedImageUrl = (await res.json()).data.url;
      } catch (e) { console.error(e); alert("Image upload failed."); }
    }
    const newReport = {
      id: "#" + Math.floor(10000 + Math.random() * 90000),
      category: selectedCategory.label,
      issue: formData.specificIssue || selectedCategory.label,
      description: formData.description,
      location: formData.address || (coords ? `GPS: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : "Manual Location Entry"),
      address: formData.address || "",
      latitude: coords?.lat || null, longitude: coords?.lng || null,
      image: uploadedImageUrl || null,
      date: "Just now", status: "Open",
      statusColor: "text-orange-500 bg-orange-500/10",
      authorityMessage: null, authorityProof: null,
    };
    addReport(newReport);
    setIsSubmitting(false);
    setTimeout(() => setStep(3), 800);
  };

  const fadeUp = { hidden: { y: 24, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 18 } } };
  const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };

  // ── STEP 1: Category Selection ──
  if (step === 1) return (
    <motion.div className="w-full max-w-3xl mx-auto" variants={stagger} initial="hidden" animate="visible">
      <motion.button variants={fadeUp} className="flex items-center gap-2 text-wayanad-muted mb-8 hover:text-wayanad-text p-2 -ml-2 rounded-xl glass-card transition-colors" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} /> <span className="font-medium">Back</span>
      </motion.button>

      <motion.div variants={fadeUp}>
        <h2 className="text-3xl font-bold text-wayanad-text mb-1">Select Category</h2>
        <p className="text-wayanad-muted text-sm mb-8">Choose the type of issue you want to report</p>
      </motion.div>

      <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4" variants={stagger}>
        {categories.map((cat) => (
          <motion.div key={cat.id} variants={fadeUp}
            onClick={() => handleCategorySelect(cat)}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group flex items-center p-6 rounded-2xl glass-card cursor-pointer relative overflow-hidden"
          >
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-0 blur-2xl group-hover:opacity-25 transition-opacity duration-500" style={{ background: cat.color }}></div>
            <div className="p-4 rounded-xl mr-5 transition-transform group-hover:scale-110"
              style={{ background: cat.bg, color: cat.color, boxShadow: `0 4px 15px -3px ${cat.bg}` }}>
              <cat.icon size={28} />
            </div>
            <h3 className="font-bold text-lg text-wayanad-text">{cat.label}</h3>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );

  // ── STEP 2: Form ──
  if (step === 2) return (
    <motion.div className="w-full max-w-2xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 100 }}>
      <button className="flex items-center gap-2 text-wayanad-muted mb-6 p-2 -ml-2 rounded-xl glass-card hover:text-wayanad-text transition-colors" onClick={() => setStep(1)}>
        <ArrowLeft size={20} /> Back
      </button>

      <div className="glass-card p-8 rounded-3xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 pb-4 border-b border-wayanad-border">
          <div className="p-3 rounded-xl transition-transform"
            style={{ background: selectedCategory.bg, color: selectedCategory.color, boxShadow: `0 4px 15px -3px ${selectedCategory.bg}` }}>
            <selectedCategory.icon size={24} />
          </div>
          <h2 className="text-2xl font-bold text-wayanad-text">{selectedCategory.label}</h2>
        </div>

        {/* Issue Type */}
        <div>
          <label className="text-xs font-bold text-wayanad-muted uppercase mb-2 block">Specific Issue</label>
          <select name="specificIssue" onChange={handleInputChange}
            className="w-full bg-wayanad-bg border border-wayanad-border rounded-xl p-4 text-wayanad-text outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all">
            <option value="">Select Option...</option>
            <option>General Failure</option>
            <option>Critical Emergency</option>
          </select>
        </div>

        {/* Description + GPS */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-wayanad-muted uppercase">Description</label>
            <motion.button
              onClick={handleGetLocation}
              disabled={locationStatus === "success" || locationStatus === "loading"}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all ${locationStatus === "success" ? "text-white" : locationStatus === "error" ? "text-white" : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                }`}
              style={{
                background: locationStatus === "success" ? "linear-gradient(135deg, #10b981, #06b6d4)"
                  : locationStatus === "error" ? "#ef4444"
                    : "var(--glass-bg)",
                border: locationStatus === "success" || locationStatus === "error" ? "none" : "1px solid var(--glass-border)",
                boxShadow: locationStatus === "success" ? "0 4px 12px rgba(16,185,129,0.3)" : undefined,
              }}
            >
              {locationStatus === "loading" && <Loader2 size={12} className="animate-spin" />}
              {locationStatus === "success" ? <><Check size={12} /> Location Attached</> : locationStatus === "error" ? "Retry Location" : <><MapPin size={12} /> Get My Location</>}
            </motion.button>
          </div>

          <div className="mb-4">
            <label className="text-xs font-bold text-wayanad-muted uppercase mb-2 block">Location Address</label>
            <textarea name="address" rows="2" value={formData.address} onChange={handleInputChange}
              className="w-full bg-wayanad-bg border border-wayanad-border rounded-xl p-4 text-wayanad-text outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-none transition-all"
              placeholder="Address will appear here..." />
          </div>

          <textarea name="description" rows="3" onChange={handleInputChange}
            className="w-full bg-wayanad-bg border border-wayanad-border rounded-xl p-4 text-wayanad-text outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-none transition-all"
            placeholder="Details..." />
          {locationStatus === "success" && (
            <p className="text-xs text-emerald-500 mt-2 font-mono">Lat: {coords.lat.toFixed(5)}, Lng: {coords.lng.toFixed(5)}</p>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <label className="text-xs font-bold text-wayanad-muted uppercase mb-2 block">Photo Evidence</label>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImagePick} className="hidden" />
          {!selectedImage ? (
            <motion.div
              onClick={() => fileInputRef.current.click()}
              whileHover={{ scale: 1.01, borderColor: "rgba(16,185,129,0.5)" }}
              className="border-2 border-dashed border-wayanad-border rounded-xl p-8 flex flex-col items-center justify-center text-wayanad-muted cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
              style={{ background: "var(--glass-bg)" }}
            >
              <Camera size={28} className="mb-2" />
              <span className="text-sm font-medium">Tap to upload photo</span>
            </motion.div>
          ) : (
            <div className="relative w-full h-44 rounded-xl overflow-hidden border border-wayanad-border group glass-card">
              <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <button onClick={() => { setSelectedImage(null); setImageFile(null); }}
                className="absolute top-3 right-3 bg-red-500 text-white p-1.5 rounded-xl shadow-lg hover:scale-110 transition-transform">
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Submit */}
        <motion.button
          onClick={handleSubmit}
          disabled={isSubmitting}
          whileHover={!isSubmitting ? { scale: 1.01, y: -2 } : {}}
          whileTap={!isSubmitting ? { scale: 0.99 } : {}}
          className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${isSubmitting ? 'cursor-not-allowed opacity-70' : ''}`}
          style={{
            background: isSubmitting ? "#10b981" : "linear-gradient(135deg, #10b981, #059669)",
            boxShadow: isSubmitting ? undefined : "0 8px 25px -5px rgba(16,185,129,0.4)",
          }}
        >
          {isSubmitting ? <><Loader2 size={20} className="animate-spin" /> Uploading...</> : "Submit Report"}
        </motion.button>
      </div>
    </motion.div>
  );

  // ── STEP 3: Success ──
  if (step === 3) return (
    <motion.div className="h-[60vh] flex flex-col items-center justify-center text-center max-w-md mx-auto"
      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 100 }}>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        className="w-24 h-24 rounded-full flex items-center justify-center text-emerald-500 mb-6"
        style={{ background: "rgba(16,185,129,0.1)", boxShadow: "0 0 40px rgba(16,185,129,0.15)" }}
      >
        <Check size={48} strokeWidth={3} />
      </motion.div>
      <h2 className="text-3xl font-bold text-wayanad-text mb-2">Sent Successfully</h2>
      <p className="text-wayanad-muted mb-8">Your report has been submitted and assigned.</p>
      <div className="w-full grid grid-cols-2 gap-4">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/my-reports")}
          className="py-3 rounded-xl glass-card font-bold text-wayanad-text hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
          View Status
        </motion.button>
        <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
          onClick={() => { setStep(1); navigate("/"); }}
          className="py-3 rounded-xl font-bold text-white"
          style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 15px -3px rgba(16,185,129,0.4)" }}>
          Done
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ReportIncident;
