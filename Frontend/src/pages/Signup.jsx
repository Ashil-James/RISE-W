import React, { useState, useEffect } from "react";
import { User, Mail, Lock, Phone, ArrowRight, ShieldCheck, Map as MapIcon, Loader2, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import ThemeToggle from "../components/ThemeToggle";
import { useUser } from "../context/UserContext";
import { useAuth } from "../context/AuthContext";
import LocationPickerMap from "../components/LocationPickerMap";

const Signup = () => {
  const navigate = useNavigate();
  const { login: userLogin } = useUser();
  const { user, login: authLogin } = useAuth();
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = () => {
    if (navigator.geolocation) {
      setIsDetecting(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const lat = latitude;
          const lon = longitude;
          setLocation({ lat, lon });
          
          try {
            const { data } = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
            );
            if (data && data.display_name) {
              const parts = data.display_name.split(", ");
              setLocationName(parts.slice(0, 3).join(", "));
            } else {
              setLocationName(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
            }
          } catch (err) {
            console.error("Reverse geocoding error:", err);
            setLocationName(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
          } finally {
            setIsDetecting(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setIsDetecting(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // --- Validation Checks ---
    if (formData.firstName.trim().length < 2) {
      setError("First name must be at least 2 characters long.");
      return;
    }
    if (formData.lastName.trim().length < 2) {
      setError("Last name must be at least 2 characters long.");
      return;
    }
    
    const phoneDigits = formData.phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      setError("Please enter a valid phone number with at least 10 digits.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    const allowedDomains = ["@rise.com", "@gmail.com"];
    const hasAllowedDomain = allowedDomains.some(domain => formData.email.toLowerCase().endsWith(domain));
    if (!hasAllowedDomain) {
      setError("Only @rise.com and @gmail.com email addresses are allowed.");
      return;
    }

    const password = formData.password;
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (!/(?=.*[a-z])/.test(password)) {
      setError("Password must contain at least one lowercase letter.");
      return;
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      setError("Password must contain at least one uppercase letter.");
      return;
    }
    if (!/(?=.*\d)/.test(password)) {
      setError("Password must contain at least one number.");
      return;
    }

    if (!location) {
      setError("Please select your location to continue. This is required for area-centric alerts.");
      return;
    }
    // -------------------------

    try {
      const payload = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phone,
        location: {
          type: "Point",
          coordinates: [location.lon, location.lat],
        },
      };

      const { data: response } = await axios.post("/api/v1/auth/register", payload);

      const userData = response.data;
      userLogin(userData);
      authLogin(userData);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Error creating account"
      );
    }
  };

  const inputClasses = "block w-full rounded-2xl border border-emerald-900/10 dark:border-white/5 bg-white/80 dark:bg-white/[0.03] py-4 pl-12 pr-4 text-[15px] font-medium text-emerald-950 dark:text-white placeholder-emerald-900/30 dark:placeholder-slate-600 outline-none transition-all duration-300 focus:ring-emerald-500 focus:ring-2 focus:border-transparent focus:bg-white dark:focus:bg-[#061e16] focus:shadow-[0_4px_20px_rgba(16,185,129,0.15)] hover:bg-white dark:hover:bg-white/[0.05]";
  const iconClasses = "h-5 w-5 text-emerald-800/40 dark:text-slate-500 transition-colors duration-300 group-focus-within:text-emerald-500 group-focus-within:scale-110";
  const labelClasses = "mb-2 block text-[13px] uppercase tracking-wider font-bold text-emerald-900/80 dark:text-slate-400";

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-50 dark:bg-[#020907] p-4 sm:p-6 lg:p-8 transition-colors duration-500 font-sans">
      
      {/* MAGNIFICENT SOFT MESH GRADIENT BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top Left Organic Glow - INCREASED OPACITY */}
        <div className="absolute -top-[20%] -left-[10%] h-[70vw] w-[70vw] max-h-[800px] max-w-[800px] rounded-full bg-emerald-400/30 dark:bg-emerald-500/15 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob" />
        {/* Bottom Right organic glow - INCREASED OPACITY */}
        <div className="absolute -bottom-[20%] -right-[10%] h-[60vw] w-[60vw] max-h-[700px] max-w-[700px] rounded-full bg-teal-400/30 dark:bg-teal-500/15 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob delay-200" />
        {/* Center subtle bridge */}
        <div className="absolute top-[20%] left-[20%] h-[50vw] w-[50vw] max-h-[500px] max-w-[500px] rounded-full bg-cyan-400/20 dark:bg-cyan-500/10 blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob delay-500" />
      </div>

      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* CENTRAL GLASS CONTAINER - ENHANCED BLUR & BORDERS */}
      <div className="relative z-10 flex w-full max-w-[1150px] flex-col overflow-hidden rounded-[2.5rem] border border-white/80 dark:border-white/10 bg-white/50 dark:bg-[#03150e]/40 shadow-[0_8px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.5)] backdrop-blur-[40px] lg:flex-row animate-fade-up ring-1 ring-white/50 dark:ring-white/5">

        {/* LEFT PANE: Info & Branding */}
        <div className="relative flex flex-col justify-between p-10 lg:w-[45%] lg:p-14 border-b lg:border-b-0 lg:border-r border-white/40 dark:border-white/5 bg-gradient-to-br from-white/40 to-white/10 dark:from-emerald-950/20 dark:to-transparent">
          {/* Subtle inside glow for dark mode */}
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 dark:opacity-100 pointer-events-none" />

          <div className="relative z-10">
            <div className="mb-8 inline-flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/40 dark:shadow-emerald-500/20 ring-1 ring-white/20">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <span className="text-2xl font-black tracking-widest text-emerald-950 dark:text-white uppercase mt-1">
                RISE
              </span>
            </div>
            
            <h1 className="mt-8 text-4xl font-black tracking-tight text-emerald-950 dark:text-white lg:text-[3.25rem] leading-[1.05]">
              Join the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 drop-shadow-sm">
                Community.
              </span>
            </h1>
            <p className="mt-6 text-lg font-medium leading-relaxed text-emerald-800 dark:text-emerald-100/70 max-w-sm">
              Create your account to report issues, receive real-time local alerts, and contribute to building a safer environment.
            </p>
          </div>

          <div className="mt-12 hidden lg:block relative z-10">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-4">
                <div className="h-11 w-11 rounded-full border-2 border-white dark:border-[#02100b] bg-emerald-200 dark:bg-emerald-800 ring-2 ring-emerald-500/20" />
                <div className="h-11 w-11 rounded-full border-2 border-white dark:border-[#02100b] bg-teal-200 dark:bg-teal-800 ring-2 ring-teal-500/20" />
                <div className="h-11 w-11 rounded-full border-2 border-white dark:border-[#02100b] bg-cyan-200 dark:bg-cyan-800 ring-2 ring-cyan-500/20" />
              </div>
              <p className="text-[15px] font-bold text-emerald-900/70 dark:text-emerald-300/80">
                Join 10,000+ residents.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: The Form */}
        <div className="flex flex-col justify-center bg-white/70 dark:bg-transparent p-8 lg:w-[55%] lg:p-14 relative">
          <form onSubmit={handleSubmit} className="w-full max-w-[500px] mx-auto space-y-5">
            {error && (
              <div className="rounded-2xl border border-red-500/20 bg-red-50 dark:bg-red-500/10 p-4 text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClasses}>
                  First Name
                </label>
                <div className="relative group">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <User className={iconClasses} />
                  </div>
                  <input
                    type="text"
                    name="firstName"
                    required
                    className={inputClasses}
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className={labelClasses}>
                  Last Name
                </label>
                <div className="relative group">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <User className={iconClasses} />
                  </div>
                  <input
                    type="text"
                    name="lastName"
                    required
                    className={inputClasses}
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={labelClasses}>
                Phone Number
              </label>
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Phone className={iconClasses} />
                </div>
                <input
                  type="tel"
                  name="phone"
                  required
                  className={inputClasses}
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className={labelClasses}>
                Email Address
              </label>
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Mail className={iconClasses} />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  className={inputClasses}
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className={labelClasses} style={{ marginBottom: 0 }}>
                  Password
                </label>
                <span className="text-[12px] uppercase tracking-wider font-bold text-emerald-800/60 dark:text-slate-500">Min 8 chars</span>
              </div>
              <div className="relative group mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className={iconClasses} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  className={`${inputClasses} pr-12`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-emerald-800/40 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className={labelClasses}>
                Your Location <span className="text-emerald-500">*</span>
              </label>

              {isDetecting ? (
                <div className="flex w-full items-center justify-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 py-4 px-4 text-emerald-600 dark:text-emerald-400 animate-pulse">
                  <Loader2 className="animate-spin" size={18} />
                  <span className="text-[15px] font-bold">Detecting your location...</span>
                </div>
              ) : !showMap ? (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowMap(true)}
                      className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-emerald-900/10 dark:border-white/5 bg-white/80 dark:bg-white/[0.03] py-4 px-4 text-[15px] font-bold text-emerald-950 dark:text-slate-200 transition-all duration-300 hover:bg-white dark:hover:bg-white/[0.06] hover:shadow-[0_4px_20px_rgba(16,185,129,0.1)] focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <MapIcon size={18} className="text-emerald-500" />
                      <span>{location ? "Adjust Location" : "Pick on Map"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={detectLocation}
                      className="flex items-center justify-center rounded-2xl border border-emerald-900/10 dark:border-white/5 bg-white/80 dark:bg-white/[0.03] p-4 text-emerald-950 dark:text-slate-200 transition-all duration-300 hover:bg-white dark:hover:bg-white/[0.06] hover:shadow-[0_4px_20px_rgba(16,185,129,0.1)] focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      title="Refresh Location"
                    >
                      <Loader2 size={18} className={isDetecting ? "animate-spin" : ""} />
                    </button>
                  </div>
                  {locationName && (
                    <div className="mt-2 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/10 py-3 px-4 text-[13px] font-bold text-emerald-900 dark:text-emerald-300">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      <span className="truncate">{locationName}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-[280px] overflow-hidden rounded-2xl border border-emerald-900/10 dark:border-white/10 shadow-[0_4px_20px_rgba(16,185,129,0.1)] animate-fade-up ring-1 ring-emerald-500/20">
                  <LocationPickerMap 
                    location={location}
                    setLocation={setLocation}
                    locationName={locationName}
                    setLocationName={setLocationName}
                    onClose={() => setShowMap(false)}
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              className="group mt-10 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 py-4 text-[15px] font-bold text-white shadow-xl shadow-emerald-500/40 dark:shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(16,185,129,0.35)] active:translate-y-0 disabled:opacity-70 ring-1 ring-white/20 inset-ring-default overflow-hidden relative"
            >
              <span className="relative z-10 flex items-center gap-2">
                Create Account
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
              {/* Shine effect */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
            </button>
          </form>

          <div className="mt-10 text-center sm:text-left mx-auto w-full max-w-[500px]">
            <p className="text-[15px] font-medium text-emerald-900/60 dark:text-slate-400">
              Already have an account?{" "}
              <Link to="/login" className="font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 hover:underline transition-all">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
