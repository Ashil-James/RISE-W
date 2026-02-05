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
  MapPin,
  Loader2,
} from "lucide-react";
import { useReports } from "../context/ReportContext"; // Assuming you kept the context

const ReportIncident = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { addReport } = useReports(); // Use context to save

  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    specificIssue: "",
    poleNumber: "",
    description: "",
    address: "", // Added address field
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // --- GPS STATE ---
  const [locationStatus, setLocationStatus] = useState("idle"); // idle | loading | success | error
  const [coords, setCoords] = useState(null);

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
  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImagePick = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  // --- GPS FUNCTION ---
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });

        // Reverse Geocode
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          if (data.display_name) {
            const addressParts = data.display_name.split(',').slice(0, 4).join(', ');
            setFormData(prev => ({ ...prev, address: addressParts }));
          }
        } catch (e) {
          console.error("Geocoding failed", e);
        }

        setLocationStatus("success");
      },
      () => {
        setLocationStatus("error");
        alert("Unable to retrieve your location");
      },
    );
  };

  const handleSubmit = async () => {
    // Prepare Data
    const newReport = {
      id: "#" + Math.floor(10000 + Math.random() * 90000),
      category: selectedCategory.label,
      issue: formData.specificIssue || selectedCategory.label,
      description: formData.description, // User description
      // Use resolved address if available, otherwise GPS or manual
      location: formData.address || (coords
        ? `GPS: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
        : "Manual Location Entry"),
      userImage: selectedImage, // Include the image
      date: "Just now",
      status: "Open",
      statusColor: "text-orange-500 bg-orange-500/10",
      authorityMessage: null,
      authorityProof: null,
    };

    addReport(newReport); // Save to context
    setTimeout(() => setStep(3), 800);
  };

  // --- STEP 1 ---
  if (step === 1)
    return (
      <div className="w-full max-w-3xl mx-auto animate-enter">
        <button
          className="flex items-center gap-2 text-wayanad-muted mb-8 hover:text-wayanad-text"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} /> <span className="font-medium">Back</span>
        </button>
        <h2 className="text-3xl font-bold text-wayanad-text mb-2">
          Select Category
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleCategorySelect(cat)}
              className="group flex items-center p-6 rounded-2xl bg-wayanad-panel border border-wayanad-border cursor-pointer transition-all hover:scale-[1.02] hover:border-emerald-500 hover:shadow-lg"
            >
              <div className={`p-4 rounded-xl ${cat.bg} ${cat.color} mr-5`}>
                <cat.icon size={28} />
              </div>
              <h3 className="font-bold text-lg text-wayanad-text">
                {cat.label}
              </h3>
            </div>
          ))}
        </div>
      </div>
    );

  // --- STEP 2 ---
  if (step === 2)
    return (
      <div className="w-full max-w-2xl mx-auto animate-enter">
        <button
          className="flex items-center gap-2 text-wayanad-muted mb-6"
          onClick={() => setStep(1)}
        >
          <ArrowLeft size={20} /> Back
        </button>
        <div className="bg-wayanad-panel border border-wayanad-border p-8 rounded-3xl shadow-sm space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 pb-4 border-b border-wayanad-border">
            <div
              className={`p-3 rounded-xl ${selectedCategory.bg} ${selectedCategory.color}`}
            >
              <selectedCategory.icon size={24} />
            </div>
            <h2 className="text-2xl font-bold text-wayanad-text">
              {selectedCategory.label}
            </h2>
          </div>

          {/* Issue Type */}
          <div>
            <label className="text-xs font-bold text-wayanad-muted uppercase mb-2 block">
              Specific Issue
            </label>
            <select
              name="specificIssue"
              onChange={handleInputChange}
              className="w-full bg-wayanad-bg border border-wayanad-border rounded-xl p-4 text-wayanad-text outline-none focus:border-emerald-500"
            >
              <option value="">Select Option...</option>
              <option>General Failure</option>
              <option>Critical Emergency</option>
            </select>
          </div>

          {/* Description & Location */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-wayanad-muted uppercase">
                Description
              </label>

              {/* GPS BUTTON */}
              <button
                onClick={handleGetLocation}
                disabled={
                  locationStatus === "success" || locationStatus === "loading"
                }
                className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 transition-all ${locationStatus === "success"
                  ? "bg-emerald-500 text-white"
                  : locationStatus === "error"
                    ? "bg-red-500 text-white"
                    : "bg-wayanad-bg border border-wayanad-border text-emerald-600 hover:bg-emerald-50"
                  }`}
              >
                {locationStatus === "loading" && (
                  <Loader2 size={12} className="animate-spin" />
                )}
                {locationStatus === "success" ? (
                  <>
                    <Check size={12} /> Location Attached
                  </>
                ) : locationStatus === "error" ? (
                  "Retry Location"
                ) : (
                  <>
                    <MapPin size={12} /> Get My Location
                  </>
                )}
              </button>
            </div>

            {/* Address Field - ONLY SHOW IF LOCATION IS FETCHED OR manually entering */}
            <div className="mb-4">
              <label className="text-xs font-bold text-wayanad-muted uppercase mb-2 block">
                Location Address
              </label>
              <textarea
                name="address"
                rows="2"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full bg-wayanad-bg border border-wayanad-border rounded-xl p-4 text-wayanad-text outline-none focus:border-emerald-500 resize-none"
                placeholder="Address will appear here..."
              />
            </div>

            <textarea
              name="description"
              rows="3"
              onChange={handleInputChange}
              className="w-full bg-wayanad-bg border border-wayanad-border rounded-xl p-4 text-wayanad-text outline-none focus:border-emerald-500 resize-none"
              placeholder="Details..."
            />
            {locationStatus === "success" && (
              <p className="text-xs text-emerald-500 mt-2 font-mono">
                Lat: {coords.lat.toFixed(5)}, Lng: {coords.lng.toFixed(5)}
              </p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="text-xs font-bold text-wayanad-muted uppercase mb-2 block">
              Photo Evidence
            </label>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImagePick}
              className="hidden"
            />
            {!selectedImage ? (
              <div
                onClick={() => fileInputRef.current.click()}
                className="border-2 border-dashed border-wayanad-border bg-wayanad-bg/50 rounded-xl p-6 flex flex-col items-center justify-center text-wayanad-muted cursor-pointer hover:border-emerald-500 hover:text-emerald-600"
              >
                <Camera size={24} className="mb-2" />{" "}
                <span className="text-sm font-medium">Tap to upload</span>
              </div>
            ) : (
              <div className="relative w-full h-40 rounded-xl overflow-hidden border border-wayanad-border group">
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                >
                  <X size={16} />
                </button>
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
    );

  // --- STEP 3 ---
  if (step === 3)
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center animate-enter max-w-md mx-auto">
        <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6">
          <Check size={48} strokeWidth={3} />
        </div>
        <h2 className="text-3xl font-bold text-wayanad-text mb-2">
          Sent Successfully
        </h2>
        <div className="w-full grid grid-cols-2 gap-4 mt-8">
          <button
            onClick={() => navigate("/my-reports")}
            className="py-3 rounded-xl border border-wayanad-border font-bold text-wayanad-text hover:bg-wayanad-panel"
          >
            View Status
          </button>
          <button
            onClick={() => {
              setStep(1);
              navigate("/");
            }}
            className="py-3 rounded-xl bg-emerald-600 font-bold text-white hover:bg-emerald-500"
          >
            Done
          </button>
        </div>
      </div>
    );
};

export default ReportIncident;
