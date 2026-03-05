import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { motion } from "framer-motion";

const AuthorityHelp = () => {
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
                    Help & Support
                </h1>
                <p className="text-gray-400 text-sm">
                    Authority System Assistance
                </p>
            </motion.div>

            {/* ── SECTION 1: CONTACT SUPPORT ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
            >
                <h3 className="text-lg font-bold text-white mb-6 border-b border-white/10 pb-4">
                    Contact Support
                </h3>

                <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <Mail size={16} className="text-gray-400" />
                            <span className="text-gray-500 font-medium text-sm">System Support Email</span>
                        </div>
                        <span className="text-white font-bold">support@rise.ops</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <div className="flex items-center gap-3">
                            <Phone size={16} className="text-gray-400" />
                            <span className="text-gray-500 font-medium text-sm">Technical Help Desk</span>
                        </div>
                        <span className="text-white font-bold">+91 98765 43210</span>
                    </div>
                </div>
            </motion.div>

        </div>
    );
};

export default AuthorityHelp;
