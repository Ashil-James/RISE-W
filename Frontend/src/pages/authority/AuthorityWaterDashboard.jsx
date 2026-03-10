import React, { useState, useEffect } from "react";
import {
    Clipboard,
    Clock,
    CheckCircle,
    AlertTriangle,
    ArrowUpRight,
    AlertCircle,
    Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// ─── StatCard Component ────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon: Icon, delay, bgClass, iconClass }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        whileHover={{ y: -5, scale: 1.02 }}
        className="relative overflow-hidden rounded-xl p-6 bg-white/5 border border-white/10 backdrop-blur-xl group cursor-default"
    >
        {/* Hover Glow */}
        <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="flex items-start justify-between mb-4 relative z-10">
            <div className={`p-3.5 rounded-xl border border-white/5 transition-colors duration-300 ${bgClass}`}>
                <Icon size={22} className={iconClass} />
            </div>
        </div>

        <div className="relative z-10">
            <h3 className="text-3xl font-black text-white mb-1 tracking-tight">{value}</h3>
            <p className="text-gray-400 text-sm font-medium">{title}</p>
        </div>
    </motion.div>
);

const STATUS_STYLES = {
    New: "bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse",
    "In Progress": "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]",
    Resolved: "bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]",
    "Work Completed": "bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]",
    Rejected: "bg-red-500/10 text-red-400 border-red-500/20",
    "High Urgency": "bg-red-500/10 text-red-400 border-red-500/20 animate-ping",
    Accepted: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Reopened: "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse",
    Assessment: "bg-amber-500/10 text-amber-400 border-amber-500/20"
};

const mapStatusToLifecycle = (backendStatus) => {
    switch (backendStatus) {
        case "OPEN": return "New";
        case "ACCEPTED": return "Accepted";
        case "IN_PROGRESS": return "In Progress";
        case "VERIFIED": return "Assessment";
        case "RESOLVED": return "Resolved";
        case "CLOSED": return "Work Completed";
        case "REOPENED": return "Reopened";
        default: return "New";
    }
};

const getDuration = (dateString) => {
    if (!dateString) return "Just now";
    const start = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 0) return `${diffDays} Days`;
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    if (diffHours > 0) return `${diffHours} Hrs`;
    const diffMins = Math.floor(diffTime / (1000 * 60));
    return `${diffMins} Mins`;
};

const AuthorityWaterDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // API Data
    const [incidents, setIncidents] = useState([]);
    const [stats, setStats] = useState({ new: 0, inProgress: 0, completed: 0, highUrgency: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchIncidents = async () => {
            try {
                const token = user?.token || localStorage.getItem("token") || (user && user.accessToken ? user.accessToken : null);
                const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

                const res = await fetch("/api/v1/authority/water/incidents", {
                    headers: authHeader,
                });

                if (!res.ok) throw new Error("Failed to fetch dashboard data");
                const result = await res.json();

                if (result.success) {
                    const formatted = result.data.map(item => ({
                        id: item._id,
                        ref: item.reportId || `#REQ-${item._id.substring(item._id.length - 4).toUpperCase()}`,
                        category: item.category || "Water Supply",
                        subtype: item.title || "Undisclosed Issue",
                        loc: item.address || "Location Unavailable",
                        urg: item.urgencyScore || 10,
                        status: mapStatusToLifecycle(item.status),
                        days: getDuration(item.createdAt),
                    }));

                    setIncidents(formatted);

                    // Compute stats
                    const newCount = formatted.filter(i => i.status === "New").length;
                    const inProgCount = formatted.filter(i => i.status === "In Progress" || i.status === "Accepted" || i.status === "Assessment").length;
                    const compCount = formatted.filter(i => i.status === "Resolved" || i.status === "Work Completed").length;
                    const urgCount = formatted.filter(i => i.urg >= 75 && i.status !== "Resolved" && i.status !== "Work Completed").length;

                    setStats({ new: newCount, inProgress: inProgCount, completed: compCount, highUrgency: urgCount });
                }
            } catch (err) {
                console.error("Error fetching authority dashboard stats:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchIncidents();
    }, [user]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return "Good Morning, Officer";
        if (hour >= 12 && hour < 17) return "Good Afternoon, Officer";
        if (hour >= 17 && hour < 21) return "Good Evening, Officer";
        return "System Monitoring Active";
    };

    const criticalItems = incidents.filter(i => i.urg >= 50 && i.status !== "Resolved" && i.status !== "Work Completed")
        .sort((a, b) => b.urg - a.urg)
        .slice(0, 5); // top 5 critical items

    return (
        <div className="space-y-8 pb-12">
            {/* ── HEADER ── */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col gap-1"
            >
                <div className="flex flex-col mb-2">
                    <span className="text-xs uppercase tracking-[0.3em] text-sky-400 font-bold mb-1">
                        {getGreeting()}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-gray-500 font-medium">
                        Water Authority Control Center Online
                    </span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
                    Executive Dashboard
                </h1>
                <p className="text-gray-400 font-medium">
                    Operational status for the WATER Authority
                </p>
            </motion.div>

            {/* ── STATS CARDS ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="New Complaints"
                    value={loading ? "-" : stats.new}
                    icon={AlertCircle}
                    bgClass="bg-blue-500/10 group-hover:bg-blue-500/20"
                    iconClass="text-blue-400"
                    delay={0.1}
                />
                <StatCard
                    title="In Progress"
                    value={loading ? "-" : stats.inProgress}
                    icon={Clock}
                    bgClass="bg-amber-500/10 group-hover:bg-amber-500/20"
                    iconClass="text-amber-400"
                    delay={0.2}
                />
                <StatCard
                    title="Work Completed"
                    value={loading ? "-" : stats.completed}
                    icon={CheckCircle}
                    bgClass="bg-green-500/10 group-hover:bg-green-500/20"
                    iconClass="text-green-400"
                    delay={0.3}
                />
                <StatCard
                    title="High Urgency"
                    value={loading ? "-" : stats.highUrgency}
                    icon={AlertTriangle}
                    bgClass="bg-red-500/10 group-hover:bg-red-500/20"
                    iconClass="text-red-400"
                    delay={0.4}
                />
            </div>

            {/* ── CRITICAL ITEMS TABLE ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl"
            >
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                        Critical Attention Items
                    </h3>
                </div>

                <div className="overflow-x-auto min-h-[200px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-48 text-sky-400">
                            <Loader2 size={32} className="animate-spin mb-4" />
                            <span className="text-sm font-bold tracking-widest uppercase">Fetching Diagnostics...</span>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-48 text-red-400">
                            <AlertTriangle size={32} className="mb-4" />
                            <span className="text-sm font-bold uppercase">Failed to synchronize: {error}</span>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-black/20 text-xs uppercase tracking-wider text-gray-500 font-bold border-b border-white/5">
                                    <th className="px-6 py-4">Report ID</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Sub-Type</th>
                                    <th className="px-6 py-4">Location</th>
                                    <th className="px-6 py-4">Urgency</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Days Open</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {criticalItems.length > 0 ? (
                                    criticalItems.map((row) => (
                                        <tr key={row.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4 font-mono text-sm text-sky-400 font-bold">{row.ref}</td>
                                            <td className="px-6 py-4 text-sm text-gray-300">{row.category}</td>
                                            <td className="px-6 py-4 text-sm text-white font-medium">{row.subtype}</td>
                                            <td className="px-6 py-4 text-sm text-gray-400">{row.loc}</td>
                                            <td className="px-6 py-4 text-sm font-black text-white">{row.urg}</td>
                                            <td className="px-6 py-4">
                                                {row.urg >= 75 && row.status !== "Resolved" && row.status !== "Work Completed" ? (
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${STATUS_STYLES["High Urgency"]}`}>
                                                        <AlertTriangle size={12} />
                                                        HIGH URGENCY
                                                    </span>
                                                ) : (
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${STATUS_STYLES[row.status] || STATUS_STYLES["New"]}`}>
                                                        {(row.status === "Resolved" || row.status === "Work Completed") && <CheckCircle size={12} />}
                                                        {row.status}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-gray-300">{row.days}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => navigate(`/authority/water/case/${row.id}`)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-sky-500/20 text-gray-300 hover:text-sky-300 border border-white/10 hover:border-sky-500/30 rounded-lg text-xs font-bold transition-all"
                                                >
                                                    View <ArrowUpRight size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="py-20 text-center text-gray-500 font-medium">
                                            No critical items found matching attention criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default AuthorityWaterDashboard;
