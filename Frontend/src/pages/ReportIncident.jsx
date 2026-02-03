import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  Droplets,
  PawPrint,
  Construction,
  ArrowLeft,
  Camera,
  CheckCircle2,
} from "lucide-react";

const ReportIncident = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Category, 2: Details, 3: Success
  const [selectedCategory, setSelectedCategory] = useState(null);

  // State for Form Data - Ready for API
  const [formData, setFormData] = useState({
    specificIssue: "",
    poleNumber: "",
    description: "",
  });

  // Data Categories
  const categories = [
    {
      id: "water",
      label: "Water & Sanitation",
      icon: Droplets,
      color: "text-blue-400",
      bg: "bg-blue-500/20",
      border: "hover:border-blue-500/50",
    },
    {
      id: "wildlife",
      label: "Wildlife Intrusion",
      icon: PawPrint,
      color: "text-orange-400",
      bg: "bg-orange-500/20",
      border: "hover:border-orange-500/50",
    },
    {
      id: "power",
      label: "Power Issue",
      icon: Zap,
      color: "text-yellow-400",
      bg: "bg-yellow-500/20",
      border: "hover:border-yellow-500/50",
    },
    {
      id: "infra",
      label: "Infrastructure",
      icon: Construction,
      color: "text-gray-400",
      bg: "bg-gray-500/20",
      border: "hover:border-gray-500/50",
    },
  ];

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    setStep(2);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    // ---------------------------------------------------------
    // API INTEGRATION POINT (PREPARED FOR /api/v1)
    // ---------------------------------------------------------
    const apiPayload = {
      category: selectedCategory.id, // e.g., 'water'
      issue_type: formData.specificIssue,
      pole_id: formData.poleNumber || null,
      description: formData.description,
      location: "User_GPS_Coordinates_Here", // You can add navigator.geolocation later
      status: "OPEN",
    };

    console.log("SENDING TO BACKEND /api/v1/incidents:", apiPayload);

    /* try {
        const response = await fetch('/api/v1/incidents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apiPayload)
        });
        if(response.ok) setStep(3);
    } catch (err) {
        console.error("API Error", err);
    }
    */

    // Simulating success for now
    setTimeout(() => setStep(3), 800);
  };

  // --- SCREEN 1: SELECT CATEGORY ---
  if (step === 1)
    return (
      <div className="space-y-6 animate-slide-up">
        <div
          className="flex items-center gap-2 text-wayanad-muted mb-4 cursor-pointer"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back to Home</span>
        </div>

        <h2 className="text-2xl font-bold text-white">Select Incident Type</h2>

        <div className="grid grid-cols-1 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleCategorySelect(cat)}
              className={`group flex items-center p-4 rounded-2xl bg-wayanad-panel/80 border border-white/5 backdrop-blur-sm transition-all cursor-pointer active:scale-[0.98] ${cat.border}`}
            >
              <div
                className={`p-3 rounded-xl ${cat.bg} ${cat.color} mr-4 shadow-inner`}
              >
                <cat.icon size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-white group-hover:text-emerald-300 transition-colors">
                  {cat.label}
                </h3>
                <p className="text-xs text-wayanad-muted mt-0.5 opacity-80">
                  Report issues related to {cat.label.toLowerCase()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

  // --- SCREEN 2: DETAILS FORM ---
  if (step === 2)
    return (
      <div className="space-y-6 animate-slide-up">
        <div
          className="flex items-center gap-2 text-wayanad-muted mb-2 cursor-pointer"
          onClick={() => setStep(1)}
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Change Category</span>
        </div>

        {/* Form Container */}
        <div className="bg-wayanad-panel/60 p-6 rounded-3xl border border-white/10 backdrop-blur-md space-y-6 shadow-xl">
          {/* Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <div
              className={`p-2 rounded-lg ${selectedCategory.bg} ${selectedCategory.color}`}
            >
              <selectedCategory.icon size={20} />
            </div>
            <h2 className="text-xl font-bold text-white">
              {selectedCategory.label}
            </h2>
          </div>

          {/* Dynamic Inputs */}
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-wider text-wayanad-muted uppercase">
                Specific Issue
              </label>
              <select
                name="specificIssue"
                value={formData.specificIssue}
                onChange={handleInputChange}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 appearance-none"
              >
                <option value="" className="bg-wayanad-dark text-gray-400">
                  Select Option...
                </option>
                <option value="General Failure" className="bg-wayanad-dark">
                  General Failure
                </option>
                <option value="Critical Emergency" className="bg-wayanad-dark">
                  Critical Emergency
                </option>
                {selectedCategory.id === "water" && (
                  <option value="Muddy Water" className="bg-wayanad-dark">
                    Muddy Water
                  </option>
                )}
              </select>
            </div>

            {selectedCategory.id === "power" && (
              <div className="space-y-2 animate-fade-in">
                <label className="text-xs font-semibold tracking-wider text-wayanad-muted uppercase">
                  Pole Number
                </label>
                <input
                  type="text"
                  name="poleNumber"
                  value={formData.poleNumber}
                  onChange={handleInputChange}
                  placeholder="e.g. SL-45"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-wider text-wayanad-muted uppercase">
                Location / Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                placeholder="Describe what you observed..."
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
              />
            </div>

            {/* Upload Button */}
            <div className="border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-wayanad-muted hover:bg-white/5 hover:border-emerald-500/30 cursor-pointer transition gap-2">
              <div className="bg-white/5 p-2 rounded-full">
                <Camera size={20} />
              </div>
              <span className="text-xs font-medium">
                Upload Photo (Optional)
              </span>
            </div>
          </div>

          {/* Submit Action */}
          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 py-4 rounded-xl font-bold text-white shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            SUBMIT INCIDENT
          </button>
        </div>
      </div>
    );

  // --- SCREEN 3: SUCCESS ---
  if (step === 3)
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center text-center space-y-6 animate-slide-up px-4">
        {/* Animated Success Icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full"></div>
          <CheckCircle2
            size={80}
            className="text-emerald-400 relative z-10 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]"
          />
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-white">Report Sent!</h2>
          <p className="text-wayanad-muted text-sm leading-relaxed max-w-[250px] mx-auto">
            Ticket <span className="text-emerald-300 font-mono">#343387</span>{" "}
            has been created. Authorities will be notified immediately.
          </p>
        </div>

        <div className="w-full max-w-xs space-y-3 mt-8">
          <button
            onClick={() => navigate("/my-reports")}
            className="w-full bg-white/10 border border-white/5 py-3.5 rounded-xl font-medium text-white hover:bg-white/20 transition"
          >
            Track Status
          </button>
          <button
            onClick={() => {
              setStep(1);
              navigate("/");
            }}
            className="w-full text-wayanad-muted py-3 text-sm hover:text-white transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
};

export default ReportIncident;
