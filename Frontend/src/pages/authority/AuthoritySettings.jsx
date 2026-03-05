import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const AuthoritySettings = () => {
    const location = useLocation();
    const navigate = useNavigate();

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
                <h3 className="text-lg font-bold text-white mb-6 border-b border-white/10 pb-4">
                    Account Security
                </h3>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button className="px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 font-bold hover:bg-blue-500/20 transition-colors text-sm text-center">
                        Change Password
                    </button>
                    <button className="px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 font-bold hover:bg-blue-500/20 transition-colors text-sm text-center">
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
                <h3 className="text-lg font-bold text-white mb-6 border-b border-white/10 pb-4">
                    Account Activity
                </h3>

                <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-gray-500 font-medium text-sm">Last Login Time</span>
                        <span className="text-white font-bold">Today 10:12 AM</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-gray-500 font-medium text-sm">Account Created Date</span>
                        <span className="text-white font-bold">January 2024</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <span className="text-gray-500 font-medium text-sm">System Access Level</span>
                        <span className="text-white font-bold">Authority Administrator</span>
                    </div>
                </div>
            </motion.div>

        </div>
    );
};

export default AuthoritySettings;
