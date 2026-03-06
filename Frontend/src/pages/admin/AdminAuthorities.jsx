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
        gradient: "from-blue-600 to-cyan-500",
        shadow: "shadow-blue-500/20",
        description: "Water supply, pipeline leaks, and drainage issues",
    },
    {
        id: "ELECTRICITY",
        name: "Power Sector",
        icon: Zap,
        color: "amber",
        gradient: "from-amber-500 to-orange-500",
        shadow: "shadow-amber-500/20",
        description: "Power outages, grid failures, and line issues",
    },
    {
        id: "CIVIL",
        name: "Civil & Roads",
        icon: HardHat,
        color: "orange",
        gradient: "from-orange-600 to-red-500",
        shadow: "shadow-orange-500/20",
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
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth={strokeWidth}
            />
            <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={`url(#donut-${color})`}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
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
    <div className="space-y-8 pb-10 animate-pulse">
        <div>
            <div className="h-10 w-72 bg-white/5 rounded-2xl mb-3"></div>
            <div className="h-5 w-96 bg-white/5 rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-[2rem] p-6 bg-neutral-900/40 border border-white/5 h-56"></div>
            ))}
        </div>
        <div className="bg-neutral-900/40 border border-white/5 rounded-[2.5rem] p-8 h-64"></div>
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
                const config = {
                    headers: {
                        Authorization: `Bearer ${user?.token}`,
                    },
                };
                const response = await axios.get("/api/v1/admin/incident", config);

                if (response.data.success) {
                    setIncidents(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching incidents:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.token) {
            fetchIncidents();
        }
    }, [user?.token]);

    // Calculations for Stats Card
    const getAuthorityStats = (authId) => {
        const authIncidents = incidents.filter(
            (inc) => inc.assignedAuthority === authId
        );
        const total = authIncidents.length;
        const pending = authIncidents.filter((inc) =>
            ["OPEN", "IN_PROGRESS"].includes(inc.status)
        ).length;
        const resolved = authIncidents.filter(
            (inc) => inc.status === "RESOLVED"
        ).length;

        return { total, pending, resolved };
    };

    // Filtered incidents for detailed view
    const activeIncidents = incidents.filter((inc) => {
        if (selectedAuthority && inc.assignedAuthority !== selectedAuthority) {
            return false;
        }
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            return (
                inc.reportId?.toLowerCase().includes(search) ||
                inc.title?.toLowerCase().includes(search) ||
                inc.address?.toLowerCase().includes(search)
            );
        }
        return true;
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08, delayChildren: 0.1 },
        },
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0, scale: 0.95 },
        visible: {
            y: 0,
            opacity: 1,
            scale: 1,
            transition: { type: "spring", stiffness: 100, damping: 15 },
        },
    };

    const rowVariants = {
        hidden: { opacity: 0, x: -15 },
        visible: (i) => ({
            opacity: 1,
            x: 0,
            transition: { delay: i * 0.06, type: "spring", stiffness: 120, damping: 14 },
        }),
    };

    if (loading) {
        return <ShimmerSkeleton />;
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 pb-10"
        >
            {/* --- HEADER --- */}
            <motion.div variants={itemVariants}>
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight flex items-center gap-3">
                    <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                    >
                        <Building className="text-emerald-500" size={36} />
                    </motion.div>
                    Authorities Overview
                    <motion.div
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                        <Sparkles size={22} className="text-emerald-400/60" />
                    </motion.div>
                </h1>
                <p className="text-gray-400 text-lg">
                    Monitor and manage incidents delegated across regional authorities.
                </p>
            </motion.div>

            {/* --- AUTHORITY CARDS --- */}
            <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
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
                            onClick={() =>
                                setSelectedAuthority(isSelected ? null : auth.id)
                            }
                            className={`relative overflow-hidden rounded-[2rem] p-6 cursor-pointer transition-all duration-500 group ${isSelected
                                    ? "bg-neutral-800/80 border-white/20 shadow-2xl"
                                    : "bg-neutral-900/40 border-white/5 hover:bg-neutral-800/60 hover:border-white/10"
                                } border backdrop-blur-sm`}
                        >
                            {/* Hover glow background */}
                            <div
                                className={`absolute -right-10 -top-10 w-48 h-48 rounded-full bg-gradient-to-br ${auth.gradient} opacity-0 blur-3xl transition-opacity duration-700 ${isSelected ? "opacity-15" : "group-hover:opacity-10"}`}
                            ></div>
                            <div
                                className={`absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-gradient-to-br ${auth.gradient} opacity-0 blur-2xl transition-opacity duration-700 ${isSelected ? "opacity-10" : "group-hover:opacity-5"}`}
                            ></div>

                            <div className="flex justify-between items-start mb-5 relative z-10">
                                <motion.div
                                    whileHover={{ rotate: [0, -10, 10, 0] }}
                                    transition={{ duration: 0.5 }}
                                    className={`p-3.5 rounded-2xl bg-gradient-to-br ${auth.gradient} ${auth.shadow} shadow-2xl transition-transform duration-500 ${isSelected ? "scale-110" : "group-hover:scale-110"
                                        }`}
                                >
                                    <auth.icon
                                        size={22}
                                        className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                                    />
                                </motion.div>

                                {/* Donut Chart */}
                                <div className="relative flex items-center justify-center">
                                    <DonutChart percentage={resolutionPct} color={auth.color} size={52} />
                                    <span className="absolute text-[10px] font-black text-white">{resolutionPct}%</span>
                                </div>
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="text-xl font-bold text-white">
                                        {auth.name}
                                    </h3>
                                    {stats.pending > 0 && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="flex items-center justify-center px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black rounded-full gap-1"
                                        >
                                            <span className="relative flex h-1.5 w-1.5">
                                                <span className="animate-ping absolute h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative rounded-full h-1.5 w-1.5 bg-red-500"></span>
                                            </span>
                                            {stats.pending}
                                        </motion.span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mb-5">
                                    {auth.description}
                                </p>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 border border-white/5 group-hover:border-white/10 transition-all">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">
                                            Total
                                        </p>
                                        <p className="text-2xl font-black text-white tabular-nums">
                                            {stats.total}
                                        </p>
                                    </div>
                                    <div className="bg-emerald-500/5 backdrop-blur-sm rounded-xl p-3 border border-emerald-500/10 group-hover:border-emerald-500/20 transition-all">
                                        <p className="text-[10px] text-emerald-500/70 font-bold uppercase mb-0.5">
                                            Resolved
                                        </p>
                                        <p className="text-2xl font-black text-emerald-500 tabular-nums">
                                            {stats.resolved}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Expand indicator */}
                            <div className="flex justify-center mt-4 relative z-10">
                                <motion.div
                                    animate={{ y: isSelected ? 0 : [0, 3, 0] }}
                                    transition={{ duration: 1.5, repeat: isSelected ? 0 : Infinity }}
                                >
                                    {isSelected ? (
                                        <ChevronUp size={16} className="text-emerald-500" />
                                    ) : (
                                        <ChevronDown size={16} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
                                    )}
                                </motion.div>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* --- INCIDENT TABLE --- */}
            <motion.div
                layout
                variants={itemVariants}
                className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 hover:border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500"
            >
                <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h3 className="text-2xl font-black text-white flex items-center gap-3">
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={selectedAuthority || "all"}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {selectedAuthority
                                        ? `${AUTHORITIES.find((a) => a.id === selectedAuthority)?.name} Incidents`
                                        : "All Assigned Incidents"}
                                </motion.span>
                            </AnimatePresence>
                            <span className="bg-white/10 text-white text-xs px-3 py-1 rounded-full font-bold tabular-nums">
                                {activeIncidents.length}
                            </span>
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Showing incidents specific to authority jurisdiction.
                        </p>
                    </div>

                    <div className="relative group">
                        <Search
                            className="absolute left-3 top-3 text-gray-500 group-focus-within:text-emerald-500 transition-colors"
                            size={16}
                        />
                        <input
                            type="text"
                            placeholder="Search ID, Title, Address..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-black/40 border border-white/10 text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 w-full sm:w-64 hover:w-72 focus:w-80 transition-all duration-300"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/[0.03]">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Incident Details
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Location
                                </th>
                                {!selectedAuthority && (
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        Authority
                                    </th>
                                )}
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Reported
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence>
                                {activeIncidents.length > 0 ? (
                                    activeIncidents.map((incident, index) => (
                                        <motion.tr
                                            key={incident._id}
                                            custom={index}
                                            variants={rowVariants}
                                            initial="hidden"
                                            animate="visible"
                                            className="hover:bg-emerald-500/[0.03] transition-all duration-300 group"
                                        >
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-white font-bold text-base line-clamp-1 pr-4 group-hover:text-emerald-300 transition-colors">
                                                        {incident.title}
                                                    </span>
                                                    <span className="text-xs text-gray-500 font-mono mt-1">
                                                        {incident.reportId} •{" "}
                                                        {incident.category}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-start gap-2 text-gray-300 text-sm max-w-[200px]">
                                                    <MapPin
                                                        size={16}
                                                        className="text-gray-500 shrink-0 mt-0.5 group-hover:text-emerald-500 transition-colors"
                                                    />
                                                    <span className="line-clamp-2">
                                                        {incident.address || "Location not provided"}
                                                    </span>
                                                </div>
                                            </td>
                                            {!selectedAuthority && (
                                                <td className="px-6 py-5">
                                                    <span className="text-xs font-bold px-3 py-1.5 bg-white/5 border border-white/10 text-gray-300 rounded-xl whitespace-nowrap">
                                                        {incident.assignedAuthority?.replace("_", " ")}
                                                    </span>
                                                </td>
                                            )}
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <StatusBadge status={incident.status} />
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-400 font-mono">
                                                {new Date(incident.createdAt).toLocaleDateString()}
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={selectedAuthority ? "4" : "5"}
                                            className="px-6 py-16 text-center"
                                        >
                                            <div className="flex flex-col items-center justify-center text-gray-500">
                                                <motion.div
                                                    animate={{ y: [0, -8, 0] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                >
                                                    <Search size={48} className="mb-4 opacity-20" />
                                                </motion.div>
                                                <p className="text-lg font-medium text-white mb-1">
                                                    No incidents found
                                                </p>
                                                <p className="text-sm">
                                                    Try adjusting your search or filter criteria.
                                                </p>
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

// Extracted StatusBadge Component for reuse
const StatusBadge = ({ status }) => {
    const styles = {
        OPEN: "bg-red-500/10 text-red-500 border-red-500/20",
        IN_PROGRESS: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        RESOLVED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        VERIFIED: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        CLOSED: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    };

    const dotColors = {
        OPEN: "bg-red-500 animate-pulse",
        IN_PROGRESS: "bg-amber-500",
        RESOLVED: "bg-emerald-500",
        VERIFIED: "bg-blue-500",
        CLOSED: "bg-gray-500",
    };

    const currentStyle = styles[status] || styles.CLOSED;

    return (
        <span
            className={`px-3 py-1.5 rounded-xl text-xs font-black tracking-wider border ${currentStyle} flex items-center gap-2 w-fit uppercase`}
        >
            <span
                className={`w-1.5 h-1.5 rounded-full ${dotColors[status] || "bg-gray-500"}`}
            ></span>
            {status.replace("_", " ")}
        </span>
    );
};

export default AdminAuthorities;
