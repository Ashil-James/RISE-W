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
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    specificIssue: "",
    poleNumber: "",
    description: "",
  });

  const categories = [
    {
      id: "water",
      label: "Water & Sanitation",
      icon: Droplets,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "hover:border-blue-500/50",
    },
    {
      id: "wildlife",
      label: "Wildlife Intrusion",
      icon: PawPrint,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      border: "hover:border-orange-500/50",
    },
    {
      id: "power",
      label: "Power Issue",
      icon: Zap,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
      border: "hover:border-yellow-500/50",
    },
    {
      id: "infra",
      label: "Infrastructure",
      icon: Construction,
      color: "text-gray-500",
      bg: "bg-gray-500/10",
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
    setTimeout(() => setStep(3), 800);
  };

  // --- SCREEN 1: SELECT CATEGORY ---
  if (step === 1)
    return (
      <div className="animate-slide-up w-full max-w-2xl mx-auto">
        {/* Back Button (Floating on top) */}
        <div
          className="flex items-center gap-2 text-wayanad-muted mb-6 cursor-pointer hover:text-wayanad-primary transition-colors self-start"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back to Home</span>
        </div>

        {/* Main Card Panel */}
        <div className="bg-transparent md:bg-wayanad-panel md:border md:border-wayanad-border md:p-10 md:rounded-3xl md:shadow-2xl">
          {/* Header - Centered on Desktop */}
          <div className="mb-8 md:text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-wayanad-text">
              Select Incident Type
            </h2>
            <p className="text-wayanad-muted text-sm mt-2 hidden md:block">
              Choose the category that best describes the issue.
            </p>
          </div>

          {/* THE GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => handleCategorySelect(cat)}
                // Mobile: Row layout (flex-row)
                // Desktop: Column layout (flex-col) + Centered Text + Taller padding
                className={`group flex md:flex-col items-center md:justify-center text-left md:text-center p-4 md:p-8 rounded-2xl bg-wayanad-panel md:bg-wayanad-bg/50 border border-wayanad-border backdrop-blur-sm transition-all cursor-pointer active:scale-[0.98] shadow-sm hover:bg-wayanad-primary/5 hover:border-wayanad-primary/30 hover:shadow-lg ${cat.border}`}
              >
                {/* Icon Circle */}
                <div
                  className={`p-3 md:p-5 rounded-full ${cat.bg} ${cat.color} mr-4 md:mr-0 md:mb-4 shadow-sm group-hover:scale-110 transition-transform`}
                >
                  <cat.icon size={28} />
                </div>

                {/* Text Content */}
                <div className="flex-1 md:flex-none">
                  <h3 className="font-semibold text-lg text-wayanad-text group-hover:text-wayanad-primary transition-colors">
                    {cat.label}
                  </h3>
                  <p className="text-xs text-wayanad-muted mt-1 opacity-80 md:hidden">
                    Report {cat.label.toLowerCase()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

  // --- SCREEN 2: DETAILS FORM ---
  if (step === 2)
    return (
      <div className="animate-slide-up w-full max-w-2xl mx-auto">
        <div
          className="flex items-center gap-2 text-wayanad-muted mb-4 cursor-pointer hover:text-wayanad-primary transition-colors"
          onClick={() => setStep(1)}
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Change Category</span>
        </div>

        {/* Form Card */}
        <div className="bg-wayanad-panel p-6 md:p-10 rounded-3xl border border-wayanad-border backdrop-blur-md space-y-6 md:space-y-8 shadow-xl">
          <div className="flex items-center gap-4 pb-4 border-b border-wayanad-border">
            <div
              className={`p-3 rounded-xl ${selectedCategory.bg} ${selectedCategory.color}`}
            >
              <selectedCategory.icon size={24} />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-wayanad-text">
              {selectedCategory.label}
            </h2>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-wider text-wayanad-muted uppercase">
                Specific Issue
              </label>
              <select
                name="specificIssue"
                value={formData.specificIssue}
                onChange={handleInputChange}
                className="w-full bg-wayanad-bg border border-wayanad-border rounded-xl p-3.5 text-wayanad-text focus:outline-none focus:border-wayanad-primary focus:ring-1 focus:ring-wayanad-primary appearance-none transition-colors"
              >
                <option value="" className="bg-wayanad-panel">
                  Select Option...
                </option>
                <option value="General Failure" className="bg-wayanad-panel">
                  General Failure
                </option>
                <option value="Critical Emergency" className="bg-wayanad-panel">
                  Critical Emergency
                </option>
                {selectedCategory.id === "water" && (
                  <option value="Muddy Water" className="bg-wayanad-panel">
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
                  className="w-full bg-wayanad-bg border border-wayanad-border rounded-xl p-3.5 text-wayanad-text focus:outline-none focus:border-wayanad-primary focus:ring-1 focus:ring-wayanad-primary transition-colors"
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
                rows="4"
                placeholder="Describe what you observed..."
                className="w-full bg-wayanad-bg border border-wayanad-border rounded-xl p-3.5 text-wayanad-text focus:outline-none focus:border-wayanad-primary focus:ring-1 focus:ring-wayanad-primary resize-none transition-colors"
              />
            </div>

            <div className="border-2 border-dashed border-wayanad-border rounded-xl p-6 md:p-8 flex flex-col items-center justify-center text-wayanad-muted hover:bg-wayanad-primary/5 hover:border-wayanad-primary/30 cursor-pointer transition gap-2">
              <div className="bg-wayanad-bg p-3 rounded-full">
                <Camera size={24} />
              </div>
              <span className="text-sm font-medium">
                Upload Photo (Optional)
              </span>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 py-4 rounded-xl font-bold text-white text-lg shadow-lg hover:shadow-emerald-500/30 hover:scale-[1.01] active:scale-[0.98] transition-all duration-300"
          >
            SUBMIT INCIDENT
          </button>
        </div>
      </div>
    );

  // --- SCREEN 3: SUCCESS ---
  if (step === 3)
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center text-center space-y-8 animate-slide-up px-4 max-w-lg mx-auto">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full"></div>
          <CheckCircle2
            size={100}
            className="text-emerald-500 relative z-10 drop-shadow-md"
          />
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-wayanad-text">
            Report Sent!
          </h2>
          <p className="text-wayanad-muted text-base md:text-lg leading-relaxed">
            Ticket <span className="text-emerald-500 font-mono">#343387</span>{" "}
            has been created.
          </p>
        </div>
        <div className="w-full max-w-sm space-y-3 mt-8">
          <button
            onClick={() => navigate("/my-reports")}
            className="w-full bg-wayanad-panel border border-wayanad-border py-4 rounded-xl font-medium text-wayanad-text hover:bg-wayanad-primary/5 transition"
          >
            Track Status
          </button>
          <button
            onClick={() => {
              setStep(1);
              navigate("/");
            }}
            className="w-full text-wayanad-muted py-3 text-sm hover:text-wayanad-text transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
};

export default ReportIncident;
