import React, { useState, useRef, useEffect } from "react";
import {
  Mail, Phone, MapPin, Edit2, LogOut, ArrowLeft,
  Shield, Camera, Save, X, User, CheckCircle,
  Loader2, AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUser } from "../context/UserContext";
import { motion, AnimatePresence } from "framer-motion";

const Profile = () => {
  const navigate = useNavigate();
  const { logout: authLogout } = useAuth();
  const { user, logout: userLogout, updateProfile, changePassword, refreshUser } = useUser();

  useEffect(() => { refreshUser(); }, []);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phoneNumber || "",
    location: (user?.location && typeof user?.location === 'object')
      ? (user.location.coordinates ? user.location.coordinates.join(', ') : "Location Set")
      : (user?.location || ""),
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passData, setPassData] = useState({ current: "", new: "", confirm: "" });
  const fileInputRef = useRef(null);

  const handleLogout = () => { authLogout(); userLogout(); navigate("/login"); };

  const handleSaveProfile = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });
    const result = await updateProfile({ name: formData.name, email: formData.email, phoneNumber: formData.phone, location: formData.location });
    setLoading(false);
    if (result.success) { setIsEditing(false); setMessage({ type: "success", text: "Profile updated successfully!" }); }
    else { setMessage({ type: "error", text: result.message || "Failed to update profile." }); }
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const handleAvatarClick = () => { fileInputRef.current?.click(); };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => { await updateProfile({ avatar: reader.result }); };
    reader.readAsDataURL(file);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) { setMessage({ type: "error", text: "New passwords do not match." }); return; }
    setLoading(true);
    const result = await changePassword(passData.current, passData.new);
    setLoading(false);
    if (result.success) { setShowPasswordModal(false); setPassData({ current: "", new: "", confirm: "" }); setMessage({ type: "success", text: "Password changed successfully!" }); }
    else { setMessage({ type: "error", text: result.message || "Failed to change password." }); }
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  if (!user) return <div className="p-10 text-center text-wayanad-text">Loading...</div>;

  const fieldIcon = (Icon, color) => (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
      style={{ background: `${color}15`, color }}>
      <Icon size={18} />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto pb-20 relative px-4 sm:px-6">
      {/* Toast */}
      <AnimatePresence>
        {message.text && (
          <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 right-6 z-50 px-6 py-4 rounded-2xl flex items-center gap-3 text-white font-bold"
            style={{
              background: message.type === "success" ? "linear-gradient(135deg, #10b981, #059669)" : "linear-gradient(135deg, #ef4444, #dc2626)",
              backdropFilter: "blur(20px)",
              boxShadow: message.type === "success" ? "0 8px 30px rgba(16,185,129,0.3)" : "0 8px 30px rgba(239,68,68,0.3)",
            }}>
            {message.type === "success" ? <CheckCircle size={20} /> : <X size={20} />}
            <span>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back */}
      <motion.button onClick={() => navigate(-1)}
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 text-wayanad-muted hover:text-emerald-500 transition-colors py-6 font-bold p-2 -ml-2 rounded-xl glass-card mb-2">
        <ArrowLeft size={20} /><span>Back</span>
      </motion.button>

      {/* Header Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 100 }}
        className="glass-card rounded-[2.5rem] overflow-hidden relative">

        {/* Banner */}
        <div className="h-56 w-full relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-cyan-600/10 to-transparent"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4"></div>
          <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        </div>

        {/* Profile Overlay */}
        <div className="px-8 md:px-12 pb-10 relative flex flex-col md:flex-row items-end md:items-center gap-6 -mt-20">
          {/* Avatar */}
          <div className="relative group">
            <div className="absolute -inset-1.5 rounded-[2rem] bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-40 blur-md transition-opacity duration-500"></div>
            <div className="relative w-36 h-36 md:w-40 md:h-40 rounded-[2rem] border-4 border-wayanad-bg flex items-center justify-center text-5xl font-bold shadow-2xl overflow-hidden"
              style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.1))", color: "#10b981" }}>
              {user.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{user.name?.charAt(0).toUpperCase()}</span>
              )}
              <div onClick={handleAvatarClick}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer rounded-[2rem]">
                <Camera className="text-white" size={32} />
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
              <div className="w-4 h-4 bg-emerald-400 rounded-full" style={{ boxShadow: "0 0 8px rgba(16,185,129,0.6)" }}></div>
            </div>
          </div>

          {/* Name & Actions */}
          <div className="flex-1 pb-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-wayanad-text mb-1.5">{user.name}</h1>
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                  style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                  {user.role || "Community Member"}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all glass-card"
                style={isEditing ? { background: "rgba(239,68,68,0.06)", color: "#ef4444", borderColor: "rgba(239,68,68,0.15)" } : {}}>
                {isEditing ? <X size={18} /> : <Edit2 size={18} />}
                <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">

        {/* LEFT: Personal Details */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="lg:col-span-2 glass-card rounded-3xl p-8">

          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-wayanad-text flex items-center gap-2">
              <User size={20} className="text-emerald-500" /> Personal Details
            </h2>
            {isEditing && (
              <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                onClick={handleSaveProfile} disabled={loading}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 15px -3px rgba(16,185,129,0.4)" }}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Changes
              </motion.button>
            )}
          </div>

          <div className="space-y-5">
            {[
              { label: "Full Name", icon: User, color: "#10b981", key: "name", value: user.name, type: "text" },
              { label: "Phone Number", icon: Phone, color: "#8b5cf6", key: "phone", value: user.phoneNumber || "Not set", type: "tel" },
              { label: "Email Address", icon: Mail, color: "#3b82f6", key: "email", value: user.email, type: "email" },
              {
                label: "Location", icon: MapPin, color: "#f97316", key: "location",
                value: user.location && typeof user.location === 'object'
                  ? (user.location.coordinates ? `Coordinates: ${user.location.coordinates.join(', ')}` : "Location Set")
                  : (user.location || "Wayanad"),
                type: "text", placeholder: "e.g. Wayanad, Kerala"
              },
            ].map((field) => (
              <div key={field.key} className="group">
                <label className="text-xs font-bold text-wayanad-muted uppercase mb-2 block">{field.label}</label>
                <div className={`flex items-center gap-4 p-4 rounded-xl transition-all ${isEditing ? "border focus-within:ring-2 focus-within:ring-emerald-500/20" : "border-transparent px-0"}`}
                  style={isEditing ? { background: "var(--glass-bg)", borderColor: "var(--glass-border)" } : {}}>
                  {fieldIcon(field.icon, field.color)}
                  {isEditing ? (
                    <input
                      type={field.type}
                      value={formData[field.key]}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      className="bg-transparent w-full outline-none text-wayanad-text font-medium"
                      placeholder={field.placeholder}
                    />
                  ) : (
                    <p className="text-wayanad-text font-medium text-lg">{field.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT: Stats & Security */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Resolved", value: user.stats?.resolved || 0, icon: CheckCircle, color: "#10b981", bg: "rgba(16,185,129,0.08)" },
              { label: "Active", value: user.stats?.pending || 0, icon: AlertCircle, color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
            ].map((stat, i) => (
              <motion.div key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.1 }}
                className="glass-card rounded-2xl p-6 text-center relative overflow-hidden group"
                whileHover={{ y: -3 }}>
                <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-0 blur-2xl group-hover:opacity-30 transition-opacity duration-500" style={{ background: stat.color }}></div>
                <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center"
                  style={{ background: stat.bg, color: stat.color, boxShadow: `0 4px 12px ${stat.bg}` }}>
                  <stat.icon size={20} />
                </div>
                <p className="text-2xl font-bold text-wayanad-text tabular-nums">{stat.value}</p>
                <p className="text-xs font-bold text-wayanad-muted uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Security Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass-card rounded-3xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-wayanad-text flex items-center gap-2 mb-2">
              <Shield size={18} className="text-emerald-500" /> Security
            </h2>

            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              onClick={() => setShowPasswordModal(true)}
              className="w-full p-4 rounded-2xl flex items-center justify-between group transition-all"
              style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-wayanad-muted group-hover:text-emerald-500 transition-colors"
                  style={{ background: "var(--glass-bg)" }}>
                  <Shield size={18} />
                </div>
                <div className="text-left">
                  <p className="text-wayanad-text font-medium text-sm">Change Password</p>
                  <p className="text-wayanad-muted text-xs">Update your security</p>
                </div>
              </div>
              <ArrowLeft size={16} className="rotate-180 text-wayanad-muted group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
            </motion.button>

            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              onClick={handleLogout}
              className="w-full p-4 rounded-2xl flex items-center justify-between group transition-all"
              style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.1)" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444" }}>
                  <LogOut size={18} />
                </div>
                <div className="text-left">
                  <p className="text-red-500 font-bold text-sm">Log Out</p>
                  <p className="text-red-500/50 text-xs">Sign out of account</p>
                </div>
              </div>
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="glass-card w-full max-w-md rounded-3xl p-8 relative"
              style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
              <button onClick={() => setShowPasswordModal(false)}
                className="absolute top-4 right-4 text-wayanad-muted hover:text-wayanad-text p-1 rounded-lg transition-colors">
                <X size={22} />
              </button>

              <h3 className="text-2xl font-bold text-wayanad-text mb-2">Change Password</h3>
              <p className="text-wayanad-muted text-sm mb-6">Ensure your account uses a strong password.</p>

              <form onSubmit={handleChangePassword} className="space-y-4">
                {[
                  { label: "Current Password", key: "current" },
                  { label: "New Password", key: "new" },
                  { label: "Confirm New Password", key: "confirm" },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="text-xs font-bold text-wayanad-muted uppercase mb-2 block">{f.label}</label>
                    <input type="password" required value={passData[f.key]}
                      onChange={(e) => setPassData({ ...passData, [f.key]: e.target.value })}
                      className="w-full rounded-xl p-3.5 text-wayanad-text outline-none transition-all focus:ring-2 focus:ring-emerald-500/20"
                      style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }} />
                  </div>
                ))}

                <motion.button type="submit" disabled={loading}
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  className="w-full text-white font-bold py-4 rounded-xl mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 8px 25px -5px rgba(16,185,129,0.4)" }}>
                  {loading ? <Loader2 className="animate-spin" /> : "Update Password"}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
