import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Key, Shield, ShieldCheck, Clock, Calendar, Briefcase, Eye, EyeOff, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

const PasswordChangeModal = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        if (formData.newPassword !== formData.confirmPassword) {
            setError("New passwords do not match");
            return;
        }

        if (formData.newPassword.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        setLoading(true);
        try {
            const token = user?.token || localStorage.getItem("token") || (user && user.accessToken ? user.accessToken : null);
            const res = await fetch("/api/v1/users/update-password", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to update password");

            setSuccess(true);
            setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setTimeout(() => {
                onClose();
                setSuccess(false);
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-full max-w-md bg-[#0B0F1A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                    >
                        <div className="flex justify-between items-center p-6 border-b border-white/10">
                            <h3 className="text-xl font-bold text-white">Change Password</h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm font-medium">
                                    <CheckCircle size={16} />
                                    Password updated successfully!
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Current Password</label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.current ? "text" : "password"}
                                        required
                                        value={formData.currentPassword}
                                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                    >
                                        {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.new ? "text" : "password"}
                                        required
                                        value={formData.newPassword}
                                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                    >
                                        {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Confirm New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.confirm ? "text" : "password"}
                                        required
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                    >
                                        {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <Key size={18} />}
                                {loading ? "Updating..." : "Update Password"}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const AuthoritySettings = () => {
    const navigate = useNavigate();
    const { user: authUser } = useAuth();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = authUser?.token || localStorage.getItem("token") || (authUser && authUser.accessToken ? authUser.accessToken : null);
                const res = await fetch("/api/v1/users/me", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                if (!res.ok) throw new Error("Failed to fetch user data");
                const result = await res.json();
                if (result.success) {
                    setUser(result.data);
                }
            } catch (err) {
                console.error("Error fetching settings data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [authUser]);

    const formatDateTime = (dateString) => {
        if (!dateString) return "Never";
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric"
        });
    };

    const getAccessLevel = (role) => {
        switch (role) {
            case "admin": return "System Administrator";
            case "authority": return "Authority Administrator";
            default: return "User Access";
        }
    };

    return (
        <div className="space-y-8 pb-12 max-w-4xl mx-auto">
            {/* ── TOP NAV ── */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-bold group w-fit"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
            </button>

            {/* ── HEADER ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-1"
            >
                <h1 className="text-2xl font-semibold text-white tracking-tight">
                    Settings
                </h1>
                <p className="text-gray-400 text-sm">
                    Authority System Preferences
                </p>
            </motion.div>

            {/* ── SECTION 1: ACCOUNT SECURITY ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
            >
                <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                    <Shield className="text-blue-400" size={20} />
                    <h3 className="text-lg font-bold text-white">
                        Account Security
                    </h3>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => setIsPasswordModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-blue-500/10 text-blue-400 font-bold hover:bg-blue-500/20 transition-all text-sm border border-blue-500/20 hover:border-blue-500/40"
                    >
                        <Key size={16} />
                        Change Password
                    </button>
                    <button
                        onClick={() => alert("Multi-factor authentication integration in progress across all authority nodes.")}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-blue-500/10 text-blue-400 font-bold hover:bg-blue-500/20 transition-all text-sm border border-blue-500/20 hover:border-blue-500/40"
                    >
                        <ShieldCheck size={16} />
                        Enable Two-Factor Authentication
                    </button>
                </div>
            </motion.div>

            {/* ── SECTION 2: ACCOUNT ACTIVITY ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
            >
                <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                    <Clock className="text-purple-400" size={20} />
                    <h3 className="text-lg font-bold text-white">
                        Account Activity
                    </h3>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <Clock size={16} className="text-gray-500" />
                            <span className="text-gray-400 font-medium text-sm">Last Login Time</span>
                        </div>
                        <span className="text-white font-bold">
                            {loading ? <Loader2 size={16} className="animate-spin text-blue-500" /> : formatDateTime(user?.lastLogin)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <Calendar size={16} className="text-gray-500" />
                            <span className="text-gray-400 font-medium text-sm">Account Created Date</span>
                        </div>
                        <span className="text-white font-bold">
                            {loading ? <Loader2 size={16} className="animate-spin text-blue-500" /> : formatDate(user?.createdAt)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <div className="flex items-center gap-3">
                            <Briefcase size={16} className="text-gray-500" />
                            <span className="text-gray-400 font-medium text-sm">System Access Level</span>
                        </div>
                        <span className="text-white font-bold">
                            {loading ? <Loader2 size={16} className="animate-spin text-blue-500" /> : getAccessLevel(user?.role)}
                        </span>
                    </div>
                </div>
            </motion.div>

            <PasswordChangeModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
            />
        </div>
    );
};

export default AuthoritySettings;
