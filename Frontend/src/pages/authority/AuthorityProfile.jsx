import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

const AuthorityProfile = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user: authUser } = useAuth();

    // Determine current theme/authority based on URL or Role
    const isPower = location.pathname.includes("/power") || authUser?.role === "power_authority";
    const isRoad = location.pathname.includes("/road") || authUser?.role === "road_authority";

    let authorityName = "Water Authority";
    let officerRole = "Water Systems Administrator";

    if (isPower) {
        authorityName = "Power Authority";
        officerRole = "Power Grid Administrator";
    } else if (isRoad) {
        authorityName = "Road Infrastructure Authority";
        officerRole = "Road Infrastructure Administrator";
    }

    const [contactInfo, setContactInfo] = useState({
        officerName: "John Mathew",
        email: authUser?.email || (isPower ? "power_admin@rise.ops" : isRoad ? "road_admin@rise.ops" : "water_admin@rise.ops"),
        phone: "+91 98765 43210"
    });

    const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
    const [tempContactInfo, setTempContactInfo] = useState({ ...contactInfo });

    const handleSave = () => {
        setContactInfo({ ...tempContactInfo });
        setIsEditPanelOpen(false);
    };

    const handleCancel = () => {
        setTempContactInfo({ ...contactInfo });
        setIsEditPanelOpen(false);
    };

    return (
        <div className="space-y-8 pb-12 max-w-4xl mx-auto">
            {/* ── TOP NAV ── */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-400 hover:text-emerald-950 hover:dark:hover:text-white transition-colors text-sm font-bold group w-fit"
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
                <h1 className="text-2xl font-semibold text-emerald-950 dark:text-white tracking-tight">
                    My Profile
                </h1>
                <p className="text-gray-400 text-sm font-medium">
                    Authority Account Overview
                </p>
            </motion.div>

            {/* ── SECTION 1: AUTHORITY INFORMATION ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-emerald-900/5 dark:bg-white/5 border border-emerald-900/10 dark:border-white/10 rounded-xl p-6 backdrop-blur-xl shadow-xl shadow-black/20"
            >
                <h3 className="text-lg font-bold text-emerald-950 dark:text-white mb-6 flex items-center gap-2">
                    <User className="text-blue-400" size={20} />
                    Authority Information
                </h3>

                <div className="space-y-6">
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Authority Name</p>
                        <p className="text-emerald-950 dark:text-white text-lg font-bold">{authorityName}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Officer Role</p>
                        <p className="text-emerald-950 dark:text-white text-lg font-bold">{officerRole}</p>
                    </div>
                </div>
            </motion.div>

            {/* ── SECTION 2: CONTACT INFORMATION ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-emerald-900/5 dark:bg-white/5 border border-emerald-900/10 dark:border-white/10 rounded-xl p-6 backdrop-blur-xl shadow-xl shadow-black/20"
            >
                <h3 className="text-lg font-bold text-emerald-950 dark:text-white mb-6 flex items-center gap-2">
                    <Mail className="text-blue-400" size={20} />
                    Contact Information
                </h3>

                <div className="space-y-6">
                    <div className="flex flex-col gap-1">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Officer Name</p>
                        <div className="flex items-center gap-3 text-gray-400">
                            <User size={16} />
                            <span className="text-emerald-950 dark:text-white font-medium">{contactInfo.officerName}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email Address</p>
                        <div className="flex items-center gap-3 text-gray-400">
                            <Mail size={16} />
                            <span className="text-emerald-950 dark:text-white font-medium">{contactInfo.email}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Phone Number</p>
                        <div className="flex items-center gap-3 text-gray-400">
                            <Phone size={16} />
                            <span className="text-emerald-950 dark:text-white font-medium">{contactInfo.phone}</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ── BOTTOM ACTION BUTTONS AND EDIT PANEL ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-6 pt-4"
            >
                {!isEditPanelOpen ? (
                    <button
                        onClick={() => setIsEditPanelOpen(true)}
                        className="px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 font-bold transition-all text-sm"
                    >
                        Edit Profile
                    </button>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="bg-emerald-900/5 dark:bg-white/5 border border-emerald-900/10 dark:border-white/10 rounded-xl p-6 backdrop-blur-xl shadow-xl"
                    >
                        <h4 className="text-emerald-950 dark:text-white font-bold mb-4">Edit Profile Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Officer Name</label>
                                <input
                                    type="text"
                                    value={tempContactInfo.officerName}
                                    onChange={(e) => setTempContactInfo({ ...tempContactInfo, officerName: e.target.value })}
                                    className="w-full bg-black/40 border border-emerald-900/10 dark:border-white/10 rounded-lg px-4 py-2 text-emerald-950 dark:text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
                                <input
                                    type="email"
                                    value={tempContactInfo.email}
                                    onChange={(e) => setTempContactInfo({ ...tempContactInfo, email: e.target.value })}
                                    className="w-full bg-black/40 border border-emerald-900/10 dark:border-white/10 rounded-lg px-4 py-2 text-emerald-950 dark:text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
                                <input
                                    type="text"
                                    value={tempContactInfo.phone}
                                    onChange={(e) => setTempContactInfo({ ...tempContactInfo, phone: e.target.value })}
                                    className="w-full bg-black/40 border border-emerald-900/10 dark:border-white/10 rounded-lg px-4 py-2 text-emerald-950 dark:text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleSave}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-emerald-950 dark:text-white font-bold rounded-lg transition-colors text-sm"
                            >
                                Save Changes
                            </button>
                            <button
                                onClick={handleCancel}
                                className="px-6 py-2 bg-emerald-900/10 dark:bg-white/10 hover:bg-white/20 text-emerald-950 dark:text-white font-bold rounded-lg transition-colors text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default AuthorityProfile;
