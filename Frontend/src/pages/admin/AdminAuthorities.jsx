import React, { useState, useEffect } from "react";
import {
    Building,
    Droplets,
    Zap,
    HardHat,
    Search,
    MapPin,
    ChevronDown,
    ChevronUp,
    Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useUser } from "../../context/UserContext";

const AUTHORITIES = [
    {
        id: "WATER",
        name: "Water Supply",
        icon: Droplets,
        color: "blue",
        gradient: "linear-gradient(135deg, #3b82f6, #06b6d4)",
        glow: "rgba(59,130,246,0.4)",
        accent: "rgba(59,130,246,0.08)",
        description: "Water supply, pipeline leaks, and drainage issues",
    },
    {
        id: "ELECTRICITY",
        name: "Power Sector",
        icon: Zap,
        color: "amber",
        gradient: "linear-gradient(135deg, #f59e0b, #f97316)",
        glow: "rgba(245,158,11,0.4)",
        accent: "rgba(245,158,11,0.08)",
        description: "Power outages, grid failures, and line issues",
    },
    {
        id: "CIVIL",
        name: "Civil & Roads",
        icon: HardHat,
        color: "orange",
        gradient: "linear-gradient(135deg, #ea580c, #ef4444)",
        glow: "rgba(234,88,12,0.4)",
        accent: "rgba(234,88,12,0.08)",
        description: "Road damage, potholes, and infrastructure",
    },
];

// --- SVG Donut Chart ---
const DonutChart = ({ percentage, color, size = 60 }) => {
    const strokeWidth = 5;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    const gradientColors = {
        blue: { start: "#3b82f6", end: "#06b6d4" },
        amber: { start: "#f59e0b", end: "#f97316" },
        orange: { start: "#ea580c", end: "#ef4444" },
    };
    const gc = gradientColors[color] || gradientColors.blue;

    return (
        <svg width={size} height={size} className="transform -rotate-90">
            <defs>
                <linearGradient id={`donut-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={gc.start} />
                    <stop offset="100%" stopColor={gc.end} />
                </linearGradient>
            </defs>
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth} />
            <motion.circle
                cx={size / 2} cy={size / 2} r={radius} fill="none"
                stroke={`url(#donut-${color})`} strokeWidth={strokeWidth} strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
            />
        </svg>
    );
};

// --- Shimmer Skeleton ---
const ShimmerSkeleton = () => (
    <div className="space-y-8 pb-10">
        <div>
            <div className="h-10 w-72 rounded-2xl mb-3 bg-gradient-to-r from-white/[0.03] via-white/[0.06] to-white/[0.03] animate-pulse"></div>
            <div className="h-5 w-96 rounded-lg bg-gradient-to-r from-white/[0.03] via-white/[0.06] to-white/[0.03] animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-[2rem] p-6 h-64 animate-pulse" style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
                    border: "1px solid rgba(255,255,255,0.03)",
                }}></div>
            ))}
        </div>
    </div>
);

const AdminAuthorities = () => {
    const { user } = useUser();
    const [loading, setLoading] = useState(true);
    const [incidents, setIncidents] = useState([]);
    const [selectedAuthority, setSelectedAuthority] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchIncidents = async () => {
            try {
                setLoading(true);
                const config = { headers: { Authorization: `Bearer ${user?.token}` } };
                const response = await axios.get("/api/v1/admin/incident", config);
                if (response.data.success) setIncidents(response.data.data);
            } catch (error) {
                console.error("Error fetching incidents:", error);
            } finally {
                setLoading(false);
            }
        };
        if (user?.token) fetchIncidents();
    }, [user?.token]);

    const getAuthorityStats = (authId) => {
        const authIncidents = incidents.filter((inc) => inc.assignedAuthority === authId);
        const total = authIncidents.length;
        const pending = authIncidents.filter((inc) => ["OPEN", "IN_PROGRESS"].includes(inc.status)).length;
        const resolved = authIncidents.filter((inc) => inc.status === "RESOLVED").length;
        return { total, pending, resolved };
    };

    const activeIncidents = incidents.filter((inc) => {
        if (selectedAuthority && inc.assignedAuthority !== selectedAuthority) return false;
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            return inc.reportId?.toLowerCase().includes(search) || inc.title?.toLowerCase().includes(search) || inc.address?.toLowerCase().includes(search);
        }
        return true;
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0, scale: 0.95 },
        visible: { y: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } },
    };

    const rowVariants = {
        hidden: { opacity: 0, x: -15 },
        visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.06, type: "spring", stiffness: 120, damping: 14 } }),
    };

    if (loading) return <ShimmerSkeleton />;

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8 pb-10">
            {/* HEADER */}
            <motion.div variants={itemVariants}>
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight flex items-center gap-3">
                    <Building className="text-emerald-500" size={36} />
                    Authorities Overview
                    <Sparkles size={22} className="text-emerald-400/60" />
                </h1>
                <p className="text-gray-400 text-lg">Monitor and manage incidents delegated across regional authorities.</p>
            </motion.div>

            {/* AUTHORITY CARDS */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {AUTHORITIES.map((auth, index) => {
                    const stats = getAuthorityStats(auth.id);
                    const isSelected = selectedAuthority === auth.id;
                    const resolutionPct = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

                    return (
                        <motion.div
                            key={auth.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                            whileHover={{ y: -8, transition: { type: "spring", stiffness: 300 } }}
                            onClick={() => setSelectedAuthority(isSelected ? null : auth.id)}
                            className="relative overflow-hidden rounded-[2rem] p-6 cursor-pointer group"
                            style={{
                                background: isSelected
                                    ? `linear-gradient(135deg, rgba(255,255,255,0.05), ${auth.accent})`
                                    : "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
                                backdropFilter: "blur(20px) saturate(1.5)",
                                border: isSelected ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(255,255,255,0.06)",
                                boxShadow: isSelected
                                    ? `0 8px 40px rgba(0,0,0,0.4), 0 0 40px -10px ${auth.glow}, inset 0 1px 0 rgba(255,255,255,0.06)`
                                    : "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
                                transition: "all 0.5s ease",
                            }}
                        >
                            <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                            <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-20" style={{ background: auth.gradient }}></div>

                            <div className="flex justify-between items-start mb-5 relative z-10">
                                <div className="p-3.5 rounded-2xl shadow-2xl transition-transform duration-500 group-hover:scale-110"
                                    style={{ background: auth.gradient, boxShadow: `0 8px 25px -5px ${auth.glow}` }}>
                                    <auth.icon size={22} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                                </div>

                                <div className="relative flex items-center justify-center">
                                    <DonutChart percentage={resolutionPct} color={auth.color} size={52} />
                                    <span className="absolute text-[10px] font-black text-white">{resolutionPct}%</span>
                                </div>
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="text-xl font-bold text-white">{auth.name}</h3>
                                    {stats.pending > 0 && (
                                        <span className="flex items-center px-2.5 py-1 text-red-500 text-[10px] font-black rounded-full gap-1"
                                            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
                                            <span className="relative flex h-1.5 w-1.5">
                                                <span className="animate-ping absolute h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative rounded-full h-1.5 w-1.5 bg-red-500"></span>
                                            </span>
                                            {stats.pending}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mb-5">{auth.description}</p>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-xl p-3" style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.04)" }}>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">Total</p>
                                        <p className="text-2xl font-black text-white tabular-nums">{stats.total}</p>
                                    </div>
                                    <div className="rounded-xl p-3" style={{ background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.08)" }}>
                                        <p className="text-[10px] text-emerald-500/70 font-bold uppercase mb-0.5">Resolved</p>
                                        <p className="text-2xl font-black text-emerald-500 tabular-nums">{stats.resolved}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center mt-4 relative z-10">
                                {isSelected ? <ChevronUp size={16} className="text-emerald-500" /> : <ChevronDown size={16} className="text-gray-600 group-hover:text-gray-400 transition-colors" />}
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* INCIDENT TABLE */}
            <motion.div layout variants={itemVariants} className="rounded-[2.5rem] overflow-hidden"
                style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
                    backdropFilter: "blur(20px) saturate(1.5)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
                }}
            >
                <div className="p-8 border-b border-white/[0.04] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h3 className="text-2xl font-black text-white flex items-center gap-3">
                            <AnimatePresence mode="wait">
                                <motion.span key={selectedAuthority || "all"} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }}>
                                    {selectedAuthority ? `${AUTHORITIES.find((a) => a.id === selectedAuthority)?.name} Incidents` : "All Assigned Incidents"}
                                </motion.span>
                            </AnimatePresence>
                            <span className="text-white text-xs px-3 py-1 rounded-full font-bold tabular-nums"
                                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                {activeIncidents.length}
                            </span>
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Showing incidents specific to authority jurisdiction.</p>
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-3 top-3 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={16} />
                        <input type="text" placeholder="Search ID, Title, Address..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 w-full sm:w-64 hover:w-72 focus:w-80 transition-all duration-300"
                            style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)" }} />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Incident Details</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Location</th>
                                {!selectedAuthority && <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Authority</th>}
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Reported</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            <AnimatePresence>
                                {activeIncidents.length > 0 ? (
                                    activeIncidents.map((incident, index) => (
                                        <motion.tr key={incident._id} custom={index} variants={rowVariants} initial="hidden" animate="visible"
                                            className="group transition-all duration-300 hover:bg-emerald-500/[0.03]">
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-white font-bold text-base line-clamp-1 pr-4 group-hover:text-emerald-300 transition-colors">{incident.title}</span>
                                                    <span className="text-xs text-gray-500 font-mono mt-1">{incident.reportId} • {incident.category}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-start gap-2 text-gray-300 text-sm max-w-[200px]">
                                                    <MapPin size={16} className="text-gray-500 shrink-0 mt-0.5 group-hover:text-emerald-500 transition-colors" />
                                                    <span className="line-clamp-2">{incident.address || "Location not provided"}</span>
                                                </div>
                                            </td>
                                            {!selectedAuthority && (
                                                <td className="px-6 py-5">
                                                    <span className="text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap text-gray-300"
                                                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                                        {incident.assignedAuthority?.replace("_", " ")}
                                                    </span>
                                                </td>
                                            )}
                                            <td className="px-6 py-5 whitespace-nowrap"><StatusBadge status={incident.status} /></td>
                                            <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-400 font-mono tabular-nums">{new Date(incident.createdAt).toLocaleDateString()}</td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={selectedAuthority ? "4" : "5"} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center text-gray-500">
                                                <Search size={48} className="mb-4 opacity-20" />
                                                <p className="text-lg font-medium text-white mb-1">No incidents found</p>
                                                <p className="text-sm">Try adjusting your search or filter criteria.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
};

const StatusBadge = ({ status }) => {
    const styles = {
        OPEN: { bg: "rgba(239,68,68,0.08)", color: "#ef4444", border: "rgba(239,68,68,0.15)" },
        IN_PROGRESS: { bg: "rgba(245,158,11,0.08)", color: "#f59e0b", border: "rgba(245,158,11,0.15)" },
        RESOLVED: { bg: "rgba(16,185,129,0.08)", color: "#10b981", border: "rgba(16,185,129,0.15)" },
        VERIFIED: { bg: "rgba(59,130,246,0.08)", color: "#3b82f6", border: "rgba(59,130,246,0.15)" },
        CLOSED: { bg: "rgba(107,114,128,0.08)", color: "#6b7280", border: "rgba(107,114,128,0.15)" },
    };
    const s = styles[status] || styles.CLOSED;

    return (
        <span className="px-3 py-1.5 rounded-xl text-xs font-black tracking-wider flex items-center gap-2 w-fit uppercase"
            style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
            <span className={`w-1.5 h-1.5 rounded-full ${status === "OPEN" ? "animate-pulse" : ""}`} style={{ background: s.color }}></span>
            {status.replace("_", " ")}
        </span>
    );
};

export default AdminAuthorities;
