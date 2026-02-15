import React, { useState, useRef, useEffect } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Edit2,
  LogOut,
  ArrowLeft,
  Shield,
  Camera,
  Save,
  X,
  User,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUser } from "../context/UserContext";
import { motion, AnimatePresence } from "framer-motion";

const Profile = () => {
  const navigate = useNavigate();
  const { logout: authLogout } = useAuth();
  const { user, logout: userLogout, updateProfile, changePassword, refreshUser } = useUser();

  // Fetch fresh stats on mount
  useEffect(() => {
    refreshUser();
  }, []);

  // State
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phoneNumber || "",
    location: user?.location || "",
  });

  // Password State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passData, setPassData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  // Profile Pic Ref
  const fileInputRef = useRef(null);

  // --- HANDLERS ---

  const handleLogout = () => {
    authLogout();
    userLogout();
    navigate("/login");
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    // Call updateProfile from UserContext
    // We pass only changed fields or all fields
    const result = await updateProfile({
      name: formData.name,
      email: formData.email,
      phoneNumber: formData.phone,
      location: formData.location,
    });

    setLoading(false);

    if (result.success) {
      setIsEditing(false);
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } else {
      setMessage({ type: "error", text: result.message || "Failed to update profile." });
    }

    // Clear message after 3 seconds
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // TODO: Implement actual file upload to backend
    // For now, we can read as data URL and save locally or simulate upload
    const reader = new FileReader();
    reader.onloadend = async () => {
      // Simulate upload by saving base64 to profile (not ideal for large images but works for demo)
      // Proper way: Upload to server -> get URL -> save URL
      await updateProfile({ avatar: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    setLoading(true);
    const result = await changePassword(passData.current, passData.new);
    setLoading(false);

    if (result.success) {
      setShowPasswordModal(false);
      setPassData({ current: "", new: "", confirm: "" });
      setMessage({ type: "success", text: "Password changed successfully!" });
    } else {
      setMessage({ type: "error", text: result.message || "Failed to change password." });
    }

    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  if (!user) return <div className="p-10 text-center text-white">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-20 relative px-4 sm:px-6">
      {/* SUCCESS/ERROR TOAST */}
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-24 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md border border-white/10 flex items-center gap-3 ${message.type === "success" ? "bg-emerald-500/90 text-white" : "bg-red-500/90 text-white"
              }`}
          >
            {message.type === "success" ? <CheckCircle size={20} /> : <X size={20} />}
            <span className="font-bold">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-wayanad-muted hover:text-emerald-500 transition-colors py-6 font-bold"
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>

      {/* --- HEADER SECTION --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-[2.5rem] overflow-hidden relative"
      >
        {/* Banner */}
        <div className="h-64 w-full relative overflow-hidden bg-[#05090a]">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-20"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4"></div>

          {/* Decorative Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        </div>

        {/* Profile Info Overlay */}
        <div className="px-8 md:px-12 pb-12 relative flex flex-col md:flex-row items-end md:items-center gap-6 -mt-20">

          {/* Avatar */}
          <div className="relative group">
            <div className="w-36 h-36 md:w-44 md:h-44 rounded-[2rem] border-4 border-[#020405] bg-emerald-950 flex items-center justify-center text-emerald-500 text-5xl font-bold shadow-2xl overflow-hidden relative">
              {user.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{user.name?.charAt(0).toUpperCase()}</span>
              )}

              {/* Photo Upload Overlay */}
              <div
                onClick={handleAvatarClick}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              >
                <Camera className="text-white" size={32} />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
            </div>
            {/* Online Status */}
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#020405] rounded-full flex items-center justify-center">
              <div className="w-5 h-5 bg-emerald-400 rounded-full border-2 border-[#020405]"></div>
            </div>
          </div>

          {/* Name & Actions */}
          <div className="flex-1 pb-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-wayanad-text mb-1">{user.name}</h1>
                <p className="text-emerald-500 font-bold bg-emerald-500/10 inline-block px-3 py-1 rounded-full text-xs uppercase tracking-wider">
                  {user.role || "Community Member"}
                </p>
              </div>

              {/* Edit Toggle */}
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all border ${isEditing
                    ? "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20"
                    : "bg-white/5 text-white border-white/10 hover:bg-white/10"
                  }`}
              >
                {isEditing ? <X size={18} /> : <Edit2 size={18} />}
                <span>{isEditing ? "Cancel Editing" : "Edit Profile"}</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* --- CONTENT GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">

        {/* LEFT: PERSONAL INFO */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 glass-card rounded-3xl p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-wayanad-text flex items-center gap-2">
              <User size={20} className="text-emerald-500" />
              Personal Details
            </h2>
            {isEditing && (
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save Changes
              </button>
            )}
          </div>

          <div className="space-y-6">
            {/* Name Input */}
            <div className="group">
              <label className="text-xs font-bold text-wayanad-muted uppercase mb-2 block">Full Name</label>
              <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${isEditing ? "bg-wayanad-bg border-wayanad-border focus-within:border-emerald-500" : "bg-transparent border-transparent px-0"}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isEditing ? "bg-gray-500/10 text-gray-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                  <User size={20} />
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-transparent w-full outline-none text-wayanad-text font-medium"
                  />
                ) : (
                  <p className="text-wayanad-text font-medium text-lg">{user.name}</p>
                )}
              </div>
            </div>

            {/* Phone Input */}
            <div className="group">
              <label className="text-xs font-bold text-wayanad-muted uppercase mb-2 block">Phone Number</label>
              <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${isEditing ? "bg-wayanad-bg border-wayanad-border focus-within:border-emerald-500" : "bg-transparent border-transparent px-0"}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isEditing ? "bg-gray-500/10 text-gray-500" : "bg-purple-500/10 text-purple-500"}`}>
                  <Phone size={20} />
                </div>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-transparent w-full outline-none text-wayanad-text font-medium"
                  />
                ) : (
                  <p className="text-wayanad-text font-medium text-lg">{user.phoneNumber || "Not set"}</p>
                )}
              </div>
            </div>

            {/* Email Input */}
            <div className="group">
              <label className="text-xs font-bold text-wayanad-muted uppercase mb-2 block">Email Address</label>
              <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${isEditing ? "bg-wayanad-bg border-wayanad-border focus-within:border-emerald-500" : "bg-transparent border-transparent px-0"}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isEditing ? "bg-gray-500/10 text-gray-500" : "bg-blue-500/10 text-blue-500"}`}>
                  <Mail size={20} />
                </div>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-transparent w-full outline-none text-wayanad-text font-medium"
                  />
                ) : (
                  <p className="text-wayanad-text font-medium text-lg">{user.email}</p>
                )}
              </div>
            </div>

            {/* Location Input */}
            <div className="group">
              <label className="text-xs font-bold text-wayanad-muted uppercase mb-2 block">Location</label>
              <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${isEditing ? "bg-wayanad-bg border-wayanad-border focus-within:border-emerald-500" : "bg-transparent border-transparent px-0"}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isEditing ? "bg-gray-500/10 text-gray-500" : "bg-orange-500/10 text-orange-500"}`}>
                  <MapPin size={20} />
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="bg-transparent w-full outline-none text-wayanad-text font-medium"
                    placeholder="e.g. Wayanad, Kerala"
                  />
                ) : (
                  <p className="text-wayanad-text font-medium text-lg">{user.location || "Wayanad"}</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT: SECURITY & STATS */}
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-6 text-center border-emerald-500/20"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mx-auto mb-3">
                <CheckCircle size={20} />
              </div>
              <p className="text-2xl font-bold text-wayanad-text">{user.stats?.resolved || 0}</p>
              <p className="text-xs font-bold text-wayanad-muted uppercase tracking-wider">Resolved</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl p-6 text-center border-yellow-500/20"
            >
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 mx-auto mb-3">
                <AlertCircle size={20} />
              </div>
              <p className="text-2xl font-bold text-wayanad-text">{user.stats?.pending || 0}</p>
              <p className="text-xs font-bold text-wayanad-muted uppercase tracking-wider">Active</p>
            </motion.div>
          </div>

          {/* Security Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-3xl p-8"
          >
            <h2 className="text-xl font-bold text-wayanad-text mb-6 flex items-center gap-2">
              <Shield size={20} className="text-emerald-500" />
              Security
            </h2>

            <div className="space-y-4">
              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full bg-wayanad-bg p-4 rounded-2xl border border-wayanad-border flex items-center justify-between hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-wayanad-panel flex items-center justify-center text-wayanad-muted group-hover:text-emerald-500 transition-colors">
                    <Shield size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-wayanad-text font-medium text-sm">Change Password</p>
                    <p className="text-wayanad-muted text-xs">Update your security</p>
                  </div>
                </div>
                <ArrowLeft size={16} className="rotate-180 text-wayanad-muted group-hover:text-emerald-500" />
              </button>

              <button
                onClick={handleLogout}
                className="w-full bg-red-500/5 p-4 rounded-2xl border border-red-500/10 flex items-center justify-between hover:bg-red-500/10 hover:border-red-500/30 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                    <LogOut size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-red-500 font-bold text-sm">Log Out</p>
                    <p className="text-red-500/50 text-xs">Sign out of account</p>
                  </div>
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- CHANGE PASSWORD MODAL --- */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-wayanad-panel border border-wayanad-border w-full max-w-md rounded-3xl p-8 shadow-2xl relative"
            >
              <button
                onClick={() => setShowPasswordModal(false)}
                className="absolute top-4 right-4 text-wayanad-muted hover:text-white"
              >
                <X size={24} />
              </button>

              <h3 className="text-2xl font-bold text-wayanad-text mb-2">Change Password</h3>
              <p className="text-wayanad-muted text-sm mb-6">Ensure your account uses a strong password.</p>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-wayanad-muted uppercase mb-2 block">Current Password</label>
                  <input
                    type="password"
                    required
                    className="w-full bg-wayanad-bg border border-wayanad-border rounded-xl p-3 text-wayanad-text outline-none focus:border-emerald-500"
                    value={passData.current}
                    onChange={(e) => setPassData({ ...passData, current: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-wayanad-muted uppercase mb-2 block">New Password</label>
                  <input
                    type="password"
                    required
                    className="w-full bg-wayanad-bg border border-wayanad-border rounded-xl p-3 text-wayanad-text outline-none focus:border-emerald-500"
                    value={passData.new}
                    onChange={(e) => setPassData({ ...passData, new: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-wayanad-muted uppercase mb-2 block">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    className="w-full bg-wayanad-bg border border-wayanad-border rounded-xl p-3 text-wayanad-text outline-none focus:border-emerald-500"
                    value={passData.confirm}
                    onChange={(e) => setPassData({ ...passData, confirm: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl mt-4 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : "Update Password"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Profile;
