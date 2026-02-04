import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  Droplets,
  PawPrint,
  Construction,
  ArrowLeft,
  Camera,
  Check,
  X,
  Image as ImageIcon,
} from "lucide-react";

const ReportIncident = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null); // Reference to the hidden file input

  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // State for Form Data & Image
  const [formData, setFormData] = useState({
    specificIssue: "",
    poleNumber: "",
    description: "",
  });
  const [selectedImage, setSelectedImage] = useState(null); // Stores the preview URL
  const [imageFile, setImageFile] = useState(null); // Stores the actual file for API

  const categories = [
    {
      id: "water",
      label: "Water & Sanitation",
      icon: Droplets,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      id: "wildlife",
      label: "Wildlife Intrusion",
      icon: PawPrint,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      id: "power",
      label: "Power Issue",
      icon: Zap,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
    },
    {
      id: "infra",
      label: "Infrastructure",
      icon: Construction,
      color: "text-gray-500",
      bg: "bg-gray-500/10",
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

  // --- NEW: Image Handling Logic ---
  const handleImagePick = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const imageUrl = URL.createObjectURL(file); // Create a local preview URL
      setSelectedImage(imageUrl);
    }
  };

  const removeImage = (e) => {
    e.stopPropagation(); // Prevent triggering the upload click again
    setSelectedImage(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
  };

  const handleSubmit = async () => {
    // Here you would append 'imageFile' to your FormData for the backend
    console.log("Submitting with image:", imageFile);
    setTimeout(() => setStep(3), 500);
  };

  // --- STEP 1: GRID (Unchanged) ---
  if (step === 1)
    return (
      <div className="w-full max-w-3xl mx-auto animate-enter">
        <button
          className="flex items-center gap-2 text-wayanad-muted mb-8 hover:text-wayanad-text transition-colors"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} /> <span className="font-medium">Back</span>
        </button>

        <h2 className="text-3xl font-bold text-wayanad-text mb-2">
          Select Category
        </h2>
        <p className="text-wayanad-muted mb-8">
          What kind of issue are you facing?
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleCategorySelect(cat)}
              className="group flex items-center p-6 rounded-2xl bg-wayanad-panel border border-wayanad-border cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:border-emerald-500 hover:shadow-lg"
            >
              <div className={`p-4 rounded-xl ${cat.bg} ${cat.color} mr-5`}>
                <cat.icon size={28} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-wayanad-text">
                  {cat.label}
                </h3>
                <span className="text-xs font-bold text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  SELECT &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

  // --- STEP 2: FORM (Updated with Image Preview) ---
  if (step === 2)
    return (
      <div className="w-full max-w-2xl mx-auto animate-enter">
        <button
          className="flex items-center gap-2 text-wayanad-muted mb-6 hover:text-wayanad-text transition-colors"
          onClick={() => setStep(1)}
        >
          <ArrowLeft size={20} /> <span className="font-medium">Back</span>
        </button>

        <div className="bg-wayanad-panel border border-wayanad-border p-8 rounded-3xl shadow-sm">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-wayanad-border">
            <div
              className={`p-3 rounded-xl ${selectedCategory.bg} ${selectedCategory.color}`}
            >
              <selectedCategory.icon size={24} />
            </div>
            <h2 className="text-2xl font-bold text-wayanad-text">
              {selectedCategory.label}
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-wayanad-muted uppercase tracking-wider mb-2 block">
                Issue Details
              </label>
              <select
                name="specificIssue"
                value={formData.specificIssue}
                onChange={handleInputChange}
                className="w-full bg-wayanad-bg border border-wayanad-border rounded-xl p-4 text-wayanad-text outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              >
                <option value="">Select specific problem...</option>
                <option>General Issue</option>
                <option>Urgent Safety Risk</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-wayanad-muted uppercase tracking-wider mb-2 block">
                Description
              </label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full bg-wayanad-bg border border-wayanad-border rounded-xl p-4 text-wayanad-text outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none"
                placeholder="Where is it? What happened?"
              />
            </div>

            {/* --- IMAGE UPLOAD SECTION --- */}
            <div>
              <label className="text-xs font-bold text-wayanad-muted uppercase tracking-wider mb-2 block">
                Photo Evidence
              </label>

              {/* Hidden Input */}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImagePick}
                className="hidden"
              />

              {!selectedImage ? (
                // Upload Placeholder State
                <div
                  onClick={() => fileInputRef.current.click()}
                  className="border-2 border-dashed border-wayanad-border bg-wayanad-bg/50 rounded-xl p-8 flex flex-col items-center justify-center text-wayanad-muted cursor-pointer hover:bg-wayanad-bg hover:border-emerald-500/50 hover:text-emerald-600 transition-all gap-3"
                >
                  <div className="p-3 bg-wayanad-panel rounded-full shadow-sm">
                    <Camera size={24} />
                  </div>
                  <span className="text-sm font-medium">
                    Tap to upload photo
                  </span>
                </div>
              ) : (
                // Image Preview State
                <div className="relative w-full h-48 rounded-xl overflow-hidden border border-wayanad-border group">
                  <img
                    src={selectedImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay with Remove Button */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={removeImage}
                      className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-red-600 hover:scale-105 transition-all shadow-lg"
                    >
                      <X size={16} /> Remove
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleSubmit}
              className="w-full py-4 rounded-xl bg-emerald-600 font-bold text-white shadow-lg hover:bg-emerald-500 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              Submit Report
            </button>
          </div>
        </div>
      </div>
    );

  // --- STEP 3: SUCCESS (Unchanged) ---
  if (step === 3)
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center animate-enter max-w-md mx-auto">
        <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6">
          <Check size={48} strokeWidth={3} />
        </div>
        <h2 className="text-3xl font-bold text-wayanad-text mb-2">
          Sent Successfully
        </h2>
        <p className="text-wayanad-muted mb-8">
          Ticket{" "}
          <span className="font-mono text-emerald-500 font-bold">#99281</span>{" "}
          has been logged.
        </p>

        <div className="w-full grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate("/my-reports")}
            className="py-3 rounded-xl border border-wayanad-border font-bold text-wayanad-text hover:bg-wayanad-panel transition-colors"
          >
            View Status
          </button>
          <button
            onClick={() => {
              setStep(1);
              navigate("/");
            }}
            className="py-3 rounded-xl bg-emerald-600 font-bold text-white hover:bg-emerald-500 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    );
};

export default ReportIncident;
