import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap, Droplets, PawPrint, Construction, ArrowLeft, HelpCircle,
  Camera, Check, X, MapPin, Loader2, ThumbsUp, AlertTriangle, Users, Map as MapIcon,
  ExternalLink
} from "lucide-react";
import { useReports } from "../context/ReportContext";
import { useUser } from "../context/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import LocationPickerMap from "../components/LocationPickerMap";
import { useTranslation } from "react-i18next";

const ReportIncident = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { addReport, refreshReports } = useReports();
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
  const [selectedNearbyIncident, setSelectedNearbyIncident] = useState(null);
  const [pendingReport, setPendingReport] = useState(null);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);

  // ── Auto-categorization state ──
  const [suggestedCategory, setSuggestedCategory] = useState(null);
  const [categoryConfidence, setCategoryConfidence] = useState(0);
  const categorizeTimeout = useRef(null);

  const { t } = useTranslation();

  const categories = [
    { id: "water", label: t("category.water"), icon: Droplets, color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
    { id: "wildlife", label: t("category.wildlife"), icon: PawPrint, color: "#f97316", bg: "rgba(249,115,22,0.1)" },
    { id: "power", label: t("category.power"), icon: Zap, color: "#eab308", bg: "rgba(234,179,8,0.1)" },
    { id: "infra", label: t("category.infra"), icon: Construction, color: "#6b7280", bg: "rgba(107,114,128,0.1)" },
  ];

  const CATEGORY_ISSUES = {
    [t("category.water")]: [
      t("issue.noWater"), t("issue.lowPressure"), t("issue.dirtyWater"),
      t("issue.pipeBurst"), t("issue.leakage"), t("issue.sewage"), t("issue.manhole"),
      t("issue.blockedDrain"), t("issue.borewell"), t("issue.tankOverflow"),
      t("issue.toilet"), t("issue.illegalWater"), t("issue.other"),
    ],
    [t("category.power")]: [
      t("issue.powerOutage"), t("issue.phaseFailure"), t("issue.voltage"),
      t("issue.liveCable"), t("issue.damagedPole"), t("issue.streetLight"),
      t("issue.sparking"), t("issue.meter"), t("issue.tripping"),
      t("issue.hooking"), t("issue.branches"), t("issue.other"),
    ],
    [t("category.infra")]: [
      t("issue.pothole"), t("issue.roadDamage"), t("issue.collapsedWall"),
      t("issue.bridge"), t("issue.footpath"), t("issue.trafficSignal"),
      t("issue.landslide"), t("issue.waterlogged"),
      t("issue.roadSign"), t("issue.hazard"), t("issue.encroachment"), t("issue.other"),
    ],
    [t("category.wildlife")]: [
      t("issue.snake"), t("issue.elephant"), t("issue.monkey"),
      t("issue.catSighting"), t("issue.boar"), t("issue.beehive"),
      t("issue.stray"), t("issue.injuredAnimal"), t("issue.poaching"), t("issue.other"),
    ],
  };

  const [customCategory, setCustomCategory] = useState("");
  const [customIssue, setCustomIssue] = useState("");

  const handleCategorySelect = (cat) => { 
    setSelectedCategory(cat); 
    setCustomCategory(cat.label);
    setStep(2); 
  };
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Trigger auto-categorization when description changes
    if (e.target.name === "description" && e.target.value.length > 5 && !selectedCategory) {
      clearTimeout(categorizeTimeout.current);
      categorizeTimeout.current = setTimeout(() => autoCategorize(e.target.value), 500);
    }
  };
  const handleImagePick = (e) => { const f = e.target.files[0]; if (f) { setImageFile(f); setSelectedImage(URL.createObjectURL(f)); } };

  // ── Auto-categorize from description ──
  const autoCategorize = async (text) => {
    try {
      const res = await fetch("/api/v1/incidents/categorize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.data?.suggestion) {
          setSuggestedCategory(result.data.suggestion);
          setCategoryConfidence(result.data.confidence);
        }
      }
    } catch (e) {
      console.error("Auto-categorize failed:", e);
    }
  };

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
  const buildReport = (imgUrl) => {
    const finalCategory = formData.specificIssue === t("issue.other") ? customCategory : selectedCategory.label;
    const finalIssue = formData.specificIssue === t("issue.other") ? customIssue : (formData.specificIssue || selectedCategory.label);
    
    return {
      id: "#" + Math.floor(10000 + Math.random() * 90000),
      category: finalCategory,
      issue: finalIssue,
      description: formData.description,
      location: formData.address || locationName || (coords ? `GPS: ${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}` : "Manual Location Entry"),
      address: formData.address || locationName || "",
      latitude: coords?.lat || null, longitude: coords?.lon || null,
      image: imgUrl || null,
      date: t("report.justNow"), status: "Open",
      statusColor: "text-orange-500 bg-orange-500/10",
      authorityMessage: null, authorityProof: null,
    };
  };

  // ── Submit with duplicate check ──
  const handleSubmit = async () => {
    setIsSubmitting(true);
    const imgUrl = await uploadImage();
    setUploadedImageUrl(imgUrl);

    const finalCategory = formData.specificIssue === t("issue.other") ? customCategory : selectedCategory.label;
    const finalIssue = formData.specificIssue === t("issue.other") ? customIssue : (formData.specificIssue || selectedCategory.label);

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
            category: finalCategory,
            title: finalIssue,
            description: formData.description || "",
            addressDetails: formData.address || "",
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
    try {
      const res = await fetch("/api/v1/incidents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          title: finalIssue,
          description: formData.description,
          category: finalCategory,
          subCategory: finalIssue,
          latitude: coords?.lat,
          longitude: coords?.lon,
          address: formData.address || locationName,
          image: imgUrl,
        }),
      });

      if (!res.ok) throw new Error("Submission failed");
      
      const newReport = buildReport(imgUrl);
      addReport(newReport);
      setIsSubmitting(false);
      setTimeout(() => setStep(3), 800);
    } catch (e) {
      console.error(e);
      alert(t("report.submitFailed"));
      setIsSubmitting(false);
    }
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
      
      // Force refresh the global reports context so the new supported case appears instantly
      await refreshReports(user?.token, { force: true, showLoading: false });
      
      setShowDuplicateModal(false);
      setStep(4); // upvote success step
    } catch (e) {
      console.error(e);
      alert(t("report.upvoteFailed"));
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
    if (hours < 1) return t("report.justNow");
    if (hours < 24) return `${hours}${t("report.hAgo")}`;
    return `${Math.floor(hours / 24)}${t("report.dAgo")}`;
  };

  const fadeUp = { hidden: { y: 24, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 18 } } };
  const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };

  // ── STEP 1: Category Selection ──
  if (step === 1) return (
    <motion.div key="step1" className="w-full max-w-3xl mx-auto" variants={stagger} initial="hidden" animate="visible">
      <motion.button variants={fadeUp} className="flex items-center gap-2 text-wayanad-muted mb-8 hover:text-wayanad-text p-2 -ml-2 rounded-xl glass-card transition-colors" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} /> <span className="font-medium">{t("report.back")}</span>
      </motion.button>

      <motion.div variants={fadeUp}>
        <h2 className="text-3xl font-bold text-wayanad-text mb-1">{t("report.selectCategory")}</h2>
        <p className="text-wayanad-muted text-sm mb-8">{t("report.selectCategoryDesc")}</p>
      </motion.div>

      <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4" variants={stagger}>
        {categories.map((cat) => (
          <motion.div key={cat.id} variants={fadeUp}
            onClick={() => {
              if (cat.id === "other") {
                setSelectedCategory(cat);
                // Don't go to step 2 yet — wait for custom name
              } else {
                handleCategorySelect(cat);
              }
            }}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`group flex items-center p-6 rounded-2xl glass-card cursor-pointer relative overflow-hidden ${
              selectedCategory?.id === cat.id && cat.id === "other" ? "ring-2 ring-purple-500/60" : ""
            }`}
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
    <motion.div key="step2" className="w-full max-w-2xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 100 }}>
      <button className="flex items-center gap-2 text-wayanad-muted mb-6 p-2 -ml-2 rounded-xl glass-card hover:text-wayanad-text transition-colors" onClick={() => setStep(1)}>
        <ArrowLeft size={20} /> {t("report.back")}
      </button>

      <div className="glass-card p-8 rounded-3xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 pb-4 border-b border-wayanad-border">
          <div className="p-3 rounded-xl transition-transform"
            style={{ background: selectedCategory?.bg || "rgba(16,185,129,0.1)", color: selectedCategory?.color || "#10b981", boxShadow: `0 4px 15px -3px ${selectedCategory?.bg || "rgba(16,185,129,0.1)"}` }}>
            {selectedCategory?.icon ? <selectedCategory.icon size={24} /> : <HelpCircle size={24} />}
          </div>
          <h2 className="text-2xl font-bold text-wayanad-text">{selectedCategory?.label || "Report Issue"}</h2>
        </div>

        {/* Issue Type */}
        <div>
          <label className="text-xs font-bold text-wayanad-muted uppercase mb-2 block">{t("report.specificIssue")}</label>
          <select 
            name="specificIssue" 
            value={formData.specificIssue}
            onChange={(e) => {
              if (e.target.value === t("issue.other")) {
                setCustomIssue("");
                setCustomCategory(selectedCategory?.label || "");
              }
              handleInputChange(e);
            }}
            className="w-full bg-wayanad-bg border border-wayanad-border rounded-xl p-4 text-wayanad-text outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all">
            <option value="">{t("report.selectOption")}</option>
            {selectedCategory && CATEGORY_ISSUES[selectedCategory.label]?.map(issue => (
              <option key={issue} value={issue}>{issue}</option>
            ))}
          </select>

          {formData.specificIssue === t("issue.other") && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-wayanad-muted uppercase mb-2 block">
                  {t("report.customCategoryLabel")}
                </label>
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full bg-wayanad-bg border border-wayanad-border rounded-xl p-4 text-wayanad-text outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  placeholder={t("report.customCategoryPlaceholder")}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-wayanad-muted uppercase mb-2 block">
                  {t("report.specificIssue")} Name
                </label>
                <input
                  type="text"
                  value={customIssue}
                  onChange={(e) => setCustomIssue(e.target.value)}
                  className="w-full bg-wayanad-bg border border-wayanad-border rounded-xl p-4 text-wayanad-text outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  placeholder={t("report.describeSpecificIssue")}
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Description + GPS */}
        <div>
          <label className="text-xs font-bold text-wayanad-muted uppercase mb-2 block">{t("report.location")}</label>
          
          {!showMap ? (
            <div className="flex gap-3 mb-4">
              <button
                type="button"
                onClick={() => setShowMap(true)}
                className="flex-[1.5] flex items-center justify-center gap-2 py-3 px-4 bg-white/5 dark:bg-black/20 border border-wayanad-border rounded-xl text-wayanad-text hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 transition-all focus:ring-2 focus:ring-emerald-500/50"
              >
                <MapIcon size={18} className="text-emerald-500" />
                <span className="font-medium whitespace-nowrap text-sm">
                  {coords ? t("report.adjustPin") : t("report.pickOnMap")}
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
            <label className="text-xs font-bold text-wayanad-muted uppercase mb-2 block">{t("report.addressDetails")} <span className="text-wayanad-muted/60 font-normal lowercase">{t("report.optional")}</span></label>
            <textarea name="address" rows="1" value={formData.address} onChange={handleInputChange}
              className="w-full bg-wayanad-bg border border-wayanad-border rounded-xl p-4 text-wayanad-text outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-none transition-all"
              placeholder={t("report.addressPlaceholder")} />
          </div>

          <label className="text-xs font-bold text-wayanad-muted uppercase mb-2 block">{t("report.description")}</label>
          <textarea name="description" rows="3" onChange={handleInputChange}
            className="w-full bg-wayanad-bg border border-wayanad-border rounded-xl p-4 text-wayanad-text outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-none transition-all"
            placeholder={t("report.descriptionPlaceholder")} />
        </div>

        {/* Image Upload */}
        <div>
          <label className="text-xs font-bold text-wayanad-muted uppercase mb-2 block">{t("report.photoEvidence")}</label>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImagePick} className="hidden" />
          {!selectedImage ? (
            <motion.div
              onClick={() => fileInputRef.current.click()}
              whileHover={{ scale: 1.01, borderColor: "rgba(16,185,129,0.5)" }}
              className="border-2 border-dashed border-wayanad-border rounded-xl p-8 flex flex-col items-center justify-center text-wayanad-muted cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
              style={{ background: "var(--glass-bg)" }}
            >
              <Camera size={28} className="mb-2" />
              <span className="text-sm font-medium">{t("report.uploadPhoto")}</span>
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
          {isSubmitting ? <><Loader2 size={20} className="animate-spin" /> {t("report.submitting")}</> : t("report.submit")}
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
                  <div className="flex-1">
                    <h3 className="text-lg font-black text-white">{t("duplicate.title")}</h3>
                    <p className="text-xs text-gray-400">{t("duplicate.subtitle")}</p>
                  </div>
                  {nearbyIncidents.length > 0 && (
                    <div className="text-right">
                      <span className="text-2xl font-black text-amber-400">
                        {Math.round(Math.max(...nearbyIncidents.map(i => i.similarityScore || 0)) * 100)}%
                      </span>
                      <p className="text-[10px] text-gray-500 font-bold">{t("duplicate.match")}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Nearby Incidents List */}
              <div className="px-6 space-y-3 max-h-64 overflow-y-auto">
                {nearbyIncidents.map((inc) => (
                  <motion.div
                    key={inc._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setSelectedNearbyIncident(inc)}
                    className="rounded-2xl p-4 group cursor-pointer hover:bg-white/5 transition-colors"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-white line-clamp-1">{inc.title}</p>
                          <ExternalLink size={12} className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">{inc.reportId}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        {inc.similarityScore != null && (
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            inc.similarityScore >= 0.7
                              ? "bg-red-500/20 text-red-400"
                              : "bg-amber-500/20 text-amber-400"
                          }`}>
                            {Math.round(inc.similarityScore * 100)}% {t("duplicate.match")}
                          </span>
                        )}
                        <span className="text-[10px] text-gray-500 whitespace-nowrap">{timeAgo(inc.createdAt)}</span>
                      </div>
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
                        <span className="font-bold">{inc.upvotes || 0}</span> {t("duplicate.citizensReported")}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpvote(inc._id);
                        }}
                        disabled={isUpvoting}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all"
                        style={{
                          background: "linear-gradient(135deg, #f59e0b, #f97316)",
                          boxShadow: "0 4px 12px -2px rgba(245,158,11,0.4)",
                        }}
                      >
                        {isUpvoting ? <Loader2 size={12} className="animate-spin" /> : <ThumbsUp size={12} />}
                        {t("duplicate.meToo")}
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Modal Footer */}
              <div className="p-6 space-y-3">
                <div className="h-px w-full" style={{ background: "rgba(255,255,255,0.06)" }}></div>
                <p className="text-center text-xs text-gray-500">{t("duplicate.notSame")}</p>
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
                  {t("duplicate.submitAnyway")}
                </motion.button>
                <button
                  onClick={() => setShowDuplicateModal(false)}
                  className="w-full py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  {t("duplicate.cancel")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FULL DETAIL VIEW MODAL ── */}
      <AnimatePresence>
        {selectedNearbyIncident && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4"
            style={{ backdropFilter: "blur(16px)", background: "rgba(0,0,0,0.7)" }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="w-full max-w-lg rounded-[2.5rem] overflow-hidden glass-card shadow-2xl relative"
              style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedNearbyIncident(null)}
                className="absolute top-6 right-6 z-20 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="overflow-y-auto flex-1">
                {/* Image Header */}
                <div className="h-64 relative bg-wayanad-bg/50">
                  {selectedNearbyIncident.image ? (
                    <img src={selectedNearbyIncident.image} alt="Evidence" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-wayanad-muted gap-2">
                      <AlertTriangle size={48} className="opacity-20" />
                      <span className="text-sm font-bold uppercase tracking-widest opacity-40">No Image Provided</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-8">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 mb-2 inline-block">
                      {selectedNearbyIncident.category}
                    </span>
                    <h3 className="text-2xl font-black text-white leading-tight">{selectedNearbyIncident.title}</h3>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-wayanad-muted mb-3">Description</p>
                    <p className="text-wayanad-text/90 leading-relaxed text-sm">
                      {selectedNearbyIncident.description || "No detailed description was provided for this report."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-wayanad-muted mb-2">Reported</p>
                      <p className="text-sm font-bold text-wayanad-text">{timeAgo(selectedNearbyIncident.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-wayanad-muted mb-2">Support</p>
                      <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-500">
                        <Users size={14} />
                        {selectedNearbyIncident.upvotes || 0} citizens
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-wayanad-muted mb-3">Location</p>
                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                      <MapPin size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-wayanad-text leading-snug">
                          {selectedNearbyIncident.address || "Area location provided via GPS"}
                        </p>
                        {selectedNearbyIncident.location?.coordinates && (
                          <p className="text-[10px] font-mono text-wayanad-muted mt-1">
                            GPS: {selectedNearbyIncident.location.coordinates[1].toFixed(4)}, {selectedNearbyIncident.location.coordinates[0].toFixed(4)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="p-8 pt-0 mt-auto">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    handleUpvote(selectedNearbyIncident._id);
                    setSelectedNearbyIncident(null);
                  }}
                  disabled={isUpvoting}
                  className="w-full py-4 rounded-2xl font-black text-white flex items-center justify-center gap-2 transition-all shadow-xl"
                  style={{
                    background: "linear-gradient(135deg, #f59e0b, #f97316)",
                    boxShadow: "0 10px 30px -5px rgba(245,158,11,0.4)"
                  }}
                >
                  {isUpvoting ? <Loader2 size={20} className="animate-spin" /> : <ThumbsUp size={20} strokeWidth={2.5} />}
                  I'm facing this too
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  // ── STEP 3: Success (New Report) ──
  if (step === 3) return (
    <motion.div key="step3" className="h-[60vh] flex flex-col items-center justify-center text-center max-w-md mx-auto"
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
      <h2 className="text-3xl font-bold text-wayanad-text mb-2">{t("report.successTitle")}</h2>
      <p className="text-wayanad-muted mb-8">{t("report.successDesc")}</p>
      <div className="w-full grid grid-cols-2 gap-4">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/my-reports")}
          className="py-3 rounded-xl glass-card font-bold text-wayanad-text hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
          {t("report.viewStatus")}
        </motion.button>
        <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
          onClick={() => { setStep(1); navigate("/"); }}
          className="py-3 rounded-xl font-bold text-white"
          style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 15px -3px rgba(16,185,129,0.4)" }}>
          {t("report.done")}
        </motion.button>
      </div>
    </motion.div>
  );

  // ── STEP 4: Upvote Success ──
  if (step === 4) return (
    <motion.div key="step4" className="h-[60vh] flex flex-col items-center justify-center text-center max-w-md mx-auto"
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
      <h2 className="text-3xl font-bold text-wayanad-text mb-2">{t("upvote.title")}</h2>
      <p className="text-wayanad-muted mb-2">{t("upvote.desc")}</p>
      <p className="text-xs text-wayanad-muted/60 mb-8">{t("upvote.subdesc")}</p>
      <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
        onClick={() => { setStep(1); navigate("/"); }}
        className="px-8 py-3 rounded-xl font-bold text-white"
        style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 15px -3px rgba(16,185,129,0.4)" }}>
        {t("upvote.backHome")}
      </motion.button>
    </motion.div>
  );
};

export default ReportIncident;
