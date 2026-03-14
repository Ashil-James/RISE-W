import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap, Droplets, PawPrint, Construction, ArrowLeft,
  Camera, Check, X, MapPin, Loader2, ThumbsUp, AlertTriangle, Users, Map as MapIcon
} from "lucide-react";
import { useReports } from "../context/ReportContext";
import { useUser } from "../context/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import LocationPickerMap from "../components/LocationPickerMap";

const ReportIncident = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { addReport } = useReports();
  const { user } = useUser();

  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    specificIssue: "", poleNumber: "", description: "", address: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [coords, setCoords] = useState(null); // {lat, lon}
  const [locationName, setLocationName] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Incident DNA state ──
  const [nearbyIncidents, setNearbyIncidents] = useState([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [pendingReport, setPendingReport] = useState(null);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);

  const categories = [
    { id: "water", label: "Water & Sanitation", icon: Droplets, color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
    { id: "wildlife", label: "Wildlife Intrusion", icon: PawPrint, color: "#f97316", bg: "rgba(249,115,22,0.1)" },
    { id: "power", label: "Power Issue", icon: Zap, color: "#eab308", bg: "rgba(234,179,8,0.1)" },
    { id: "infra", label: "Infrastructure", icon: Construction, color: "#6b7280", bg: "rgba(107,114,128,0.1)" },
  ];

  const handleCategorySelect = (cat) => { setSelectedCategory(cat); setStep(2); };
  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleImagePick = (e) => { const f = e.target.files[0]; if (f) { setImageFile(f); setSelectedImage(URL.createObjectURL(f)); } };

  // Native geolocating handled in LocationPickerMap component now.

  // ── Upload image (shared between flows) ──
  const uploadImage = async () => {
    if (!imageFile) return null;
    const fd = new FormData(); fd.append("image", imageFile);
    try {
      const res = await fetch("/api/v1/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      return (await res.json()).data.url;
    } catch (e) { console.error(e); alert("Image upload failed."); return null; }
  };

  // ── Build report object ──
  const buildReport = (imgUrl) => ({
    id: "#" + Math.floor(10000 + Math.random() * 90000),
    category: selectedCategory.label,
    issue: formData.specificIssue || selectedCategory.label,
    description: formData.description,
    location: formData.address || locationName || (coords ? `GPS: ${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}` : "Manual Location Entry"),
    address: formData.address || locationName || "",
    latitude: coords?.lat || null, longitude: coords?.lon || null,
    image: imgUrl || null,
    date: "Just now", status: "Open",
    statusColor: "text-orange-500 bg-orange-500/10",
    authorityMessage: null, authorityProof: null,
  });

  // ── Submit with duplicate check ──
  const handleSubmit = async () => {
    setIsSubmitting(true);
    const imgUrl = await uploadImage();
    setUploadedImageUrl(imgUrl);

    // If we have GPS coords, check for nearby duplicates first
    if (coords) {
      try {
        const res = await fetch("/api/v1/incidents/check-nearby", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user?.token}`,
          },
          body: JSON.stringify({
            latitude: coords.lat,
            longitude: coords.lon,
            category: selectedCategory.label,
          }),
        });

        if (res.ok) {
          const result = await res.json();
          if (result.data && result.data.length > 0) {
            // Nearby duplicates found — show modal
            setNearbyIncidents(result.data);
            const report = buildReport(imgUrl);
            setPendingReport(report);
            setShowDuplicateModal(true);
            setIsSubmitting(false);
            return;
          }
        }
      } catch (e) {
        console.error("Nearby check failed, proceeding with submission:", e);
      }
    }

    // No duplicates found — create normally
    const newReport = buildReport(imgUrl);
    addReport(newReport);
    setIsSubmitting(false);
    setTimeout(() => setStep(3), 800);
  };

  // ── Upvote an existing incident instead of creating duplicate ──
  const handleUpvote = async (incidentId) => {
    setIsUpvoting(true);
    try {
      const res = await fetch(`/api/v1/incidents/${incidentId}/upvote`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${user?.token}`,
        },
      });
      if (!res.ok) throw new Error("Upvote failed");
      setShowDuplicateModal(false);
      setStep(4); // upvote success step
    } catch (e) {
      console.error(e);
      alert("Failed to upvote. Please try again.");
    } finally {
      setIsUpvoting(false);
    }
  };

  // ── Submit anyway (user says "no, mine is different") ──
  const handleSubmitAnyway = () => {
    setShowDuplicateModal(false);
    if (pendingReport) {
      addReport(pendingReport);
      setTimeout(() => setStep(3), 800);
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
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
          <label className="text-xs font-bold text-wayanad-muted uppercase mb-2 block">Location</label>
          
          {!showMap ? (
            <div className="flex gap-3 mb-4">
              <button
                type="button"
                onClick={() => setShowMap(true)}
                className="flex-[1.5] flex items-center justify-center gap-2 py-3 px-4 bg-white/5 dark:bg-black/20 border border-wayanad-border rounded-xl text-wayanad-text hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 transition-all focus:ring-2 focus:ring-emerald-500/50"
              >
                <MapIcon size={18} className="text-emerald-500" />
                <span className="font-medium whitespace-nowrap text-sm">
                  {coords ? "Adjust Pin" : "Pick on Map"}
                </span>
              </button>
              {locationName && (
                <div className="flex-[2] flex items-center px-4 py-3 bg-white/5 dark:bg-black/10 border border-emerald-500/30 rounded-xl text-sm text-wayanad-text truncate">
                  {locationName}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-[360px] animate-fade-up mb-4">
              <LocationPickerMap 
                location={coords}
                setLocation={setCoords}
                locationName={locationName}
                setLocationName={setLocationName}
                onClose={() => setShowMap(false)}
              />
            </div>
          )}

          <div className="mb-4">
            <label className="text-xs font-bold text-wayanad-muted uppercase mb-2 block">Additional Address Details <span className="text-wayanad-muted/60 font-normal lowercase">(optional)</span></label>
            <textarea name="address" rows="1" value={formData.address} onChange={handleInputChange}
              className="w-full bg-wayanad-bg border border-wayanad-border rounded-xl p-4 text-wayanad-text outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-none transition-all"
              placeholder="E.g. Near the old banyan tree..." />
          </div>

          <label className="text-xs font-bold text-wayanad-muted uppercase mb-2 block">Description</label>
          <textarea name="description" rows="3" onChange={handleInputChange}
            className="w-full bg-wayanad-bg border border-wayanad-border rounded-xl p-4 text-wayanad-text outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-none transition-all"
            placeholder="Details of the issue..." />
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
          {isSubmitting ? <><Loader2 size={20} className="animate-spin" /> Checking & Uploading...</> : "Submit Report"}
        </motion.button>
      </div>

      {/* ── SIMILAR ISSUE FOUND MODAL ── */}
      <AnimatePresence>
        {showDuplicateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ backdropFilter: "blur(12px)", background: "rgba(0,0,0,0.6)" }}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              transition={{ type: "spring", stiffness: 200, damping: 22 }}
              className="w-full max-w-md rounded-3xl overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(15,23,42,0.98), rgba(15,23,42,0.95))",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
            >
              {/* Modal Header */}
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-xl" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.15)" }}>
                    <AlertTriangle size={20} className="text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Similar Issue Found</h3>
                    <p className="text-xs text-gray-400">A report near your location already exists</p>
                  </div>
                </div>
              </div>

              {/* Nearby Incidents List */}
              <div className="px-6 space-y-3 max-h-64 overflow-y-auto">
                {nearbyIncidents.map((inc) => (
                  <motion.div
                    key={inc._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-2xl p-4 group"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white line-clamp-1">{inc.title}</p>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">{inc.reportId}</p>
                      </div>
                      <span className="text-[10px] text-gray-500 whitespace-nowrap ml-2">{timeAgo(inc.createdAt)}</span>
                    </div>

                    {inc.address && (
                      <div className="flex items-center gap-1.5 text-gray-400 mb-3">
                        <MapPin size={12} className="text-emerald-500 shrink-0" />
                        <span className="text-xs line-clamp-1">{inc.address}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Users size={12} />
                        <span className="font-bold">{inc.upvotes || 0}</span> citizens reported this
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleUpvote(inc._id)}
                        disabled={isUpvoting}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all"
                        style={{
                          background: "linear-gradient(135deg, #f59e0b, #f97316)",
                          boxShadow: "0 4px 12px -2px rgba(245,158,11,0.4)",
                        }}
                      >
                        {isUpvoting ? <Loader2 size={12} className="animate-spin" /> : <ThumbsUp size={12} />}
                        Me Too
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Modal Footer */}
              <div className="p-6 space-y-3">
                <div className="h-px w-full" style={{ background: "rgba(255,255,255,0.06)" }}></div>
                <p className="text-center text-xs text-gray-500">Not the same issue?</p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmitAnyway}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all"
                  style={{
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    boxShadow: "0 4px 15px -3px rgba(16,185,129,0.4)",
                  }}
                >
                  No, Submit My Report
                </motion.button>
                <button
                  onClick={() => setShowDuplicateModal(false)}
                  className="w-full py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  // ── STEP 3: Success (New Report) ──
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

  // ── STEP 4: Upvote Success ──
  if (step === 4) return (
    <motion.div className="h-[60vh] flex flex-col items-center justify-center text-center max-w-md mx-auto"
      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 100 }}>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
        style={{ background: "rgba(245,158,11,0.1)", boxShadow: "0 0 40px rgba(245,158,11,0.15)" }}
      >
        <ThumbsUp size={42} className="text-amber-500" strokeWidth={2.5} />
      </motion.div>
      <h2 className="text-3xl font-bold text-wayanad-text mb-2">Upvote Recorded!</h2>
      <p className="text-wayanad-muted mb-2">Your voice has been counted. The more citizens report this, the higher its priority.</p>
      <p className="text-xs text-wayanad-muted/60 mb-8">Authorities can see the total citizen impact for this issue.</p>
      <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
        onClick={() => { setStep(1); navigate("/"); }}
        className="px-8 py-3 rounded-xl font-bold text-white"
        style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 15px -3px rgba(16,185,129,0.4)" }}>
        Back to Home
      </motion.button>
    </motion.div>
  );
};

export default ReportIncident;
