import React, { useState, useEffect } from "react";
import {
    Zap,
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
const StatCard = ({ title, value, icon: Icon, delay, bgClass, iconClass, loading }) => (
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
            {loading ? (
                <Loader2 size={24} className="animate-spin text-gray-500 mb-1" />
            ) : (
                <h3 className="text-3xl font-black text-white mb-1 tracking-tight">{value}</h3>
            )}
            <p className="text-gray-400 text-sm font-medium">{title}</p>
        </div>
    </motion.div>
);

// ─── Styles ───────────
const STATUS_STYLES = {
    OPEN: "bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse",
    REOPENED: "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse",
    ACCEPTED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    IN_PROGRESS: "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]",
    RESOLVED: "bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]",
    VERIFIED: "bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]",
    CLOSED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    REJECTED: "bg-red-500/10 text-red-400 border-red-500/20",
    REVOKED: "bg-gray-500/10 text-gray-300 border-gray-500/20",
    "High Urgency": "bg-red-500/10 text-red-400 border-red-500/20 animate-ping",
};

const AuthorityPowerDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [stats, setStats] = useState({ new: 0, inProgress: 0, completed: 0, highUrgency: 0 });
    const [criticalItems, setCriticalItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return "Good Morning, Officer";
        if (hour >= 12 && hour < 17) return "Good Afternoon, Officer";
        if (hour >= 17 && hour < 21) return "Good Evening, Officer";
        return "System Monitoring Active";
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = user?.token || localStorage.getItem("token") || (user && user.accessToken ? user.accessToken : null);
                const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

                // Fetch Stats
                const statsRes = await fetch("/api/v1/authority/power/stats", { headers: authHeader });
                const statsData = await statsRes.json();

                // Fetch Critical Items
                const criticalRes = await fetch("/api/v1/authority/power/critical", { headers: authHeader });
                const criticalData = await criticalRes.json();

                if (statsData.success) setStats(statsData.data);
                if (criticalData.success) {
                    const formatted = criticalData.data.map(item => ({
                        id: item._id,
                        reportId: item.reportId || `#POW-${item._id.substring(item._id.length - 4).toUpperCase()}`,
                        category: item.category || "Power Issue",
                        subtype: item.title || "Undisclosed Issue",
                        loc: item.address || "Location Unavailable",
                        urg: Math.min(100, (item.urgencyScore || 10) + (item.upvotes || 0)),
                        status: item.status,
                        days: Math.floor((new Date() - new Date(item.createdAt)) / (1000 * 60 * 60 * 24))
                    }));
                    setCriticalItems(formatted);
                }
            } catch (err) {
                console.error("Error fetching power dashboard data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    return (
        <div className="space-y-8 pb-12">
            {/* ── HEADER ── */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col gap-1"
            >
                <div className="flex flex-col mb-2">
                    <span className="text-xs uppercase tracking-[0.3em] text-amber-400 font-bold mb-1">
                        {getGreeting()}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-gray-500 font-medium">
                        Power Authority Control Center Online
                    </span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
                    Executive Dashboard
                </h1>
                <p className="text-gray-400 font-medium">
                    Operational status for the POWER Authority
                </p>
            </motion.div>

            {/* ── STATS CARDS ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="New Complaints"
                    value={stats.new}
                    icon={AlertCircle}
                    bgClass="bg-blue-500/10 group-hover:bg-blue-500/20"
                    iconClass="text-blue-400"
                    delay={0.1}
                    loading={loading}
                />
                <StatCard
                    title="In Progress"
                    value={stats.inProgress}
                    icon={Clock}
                    bgClass="bg-amber-500/10 group-hover:bg-amber-500/20"
                    iconClass="text-amber-400"
                    delay={0.2}
                    loading={loading}
                />
                <StatCard
                    title="Work Completed"
                    value={stats.completed}
                    icon={CheckCircle}
                    bgClass="bg-green-500/10 group-hover:bg-green-500/20"
                    iconClass="text-green-400"
                    delay={0.3}
                    loading={loading}
                />
                <StatCard
                    title="High Urgency"
                    value={stats.highUrgency}
                    icon={AlertTriangle}
                    bgClass="bg-red-500/10 group-hover:bg-red-500/20"
                    iconClass="text-red-400"
                    delay={0.4}
                    loading={loading}
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
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                        Critical Attention Items
                    </h3>
                    {loading && <Loader2 size={18} className="animate-spin text-amber-500" />}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black/20 text-xs uppercase tracking-wider text-gray-500 font-bold border-b border-white/5">
                                <th className="px-6 py-4">Report ID</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Sub-Type</th>
                                <th className="px-5 py-4">Location</th>
                                <th className="px-6 py-4">Urgency</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Days Open</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="py-20 text-center text-amber-500 font-medium">
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <Loader2 size={32} className="animate-spin" />
                                            <span className="text-sm font-bold tracking-widest uppercase">Fetching Diagnostics...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={8} className="py-20 text-center text-red-400 font-medium">
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <AlertTriangle size={32} />
                                            <span className="text-sm font-bold uppercase tracking-widest">Failed to Synchronize: {error}</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : criticalItems.length > 0 ? (
                                criticalItems.map((row) => (
                                    <tr key={row.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 font-mono text-sm text-amber-400 font-bold">{row.reportId}</td>
                                        <td className="px-6 py-4 text-sm text-gray-300">{row.category}</td>
                                        <td className="px-6 py-4 text-sm text-white font-medium">{row.subtype}</td>
                                        <td className="px-6 py-4 text-sm text-gray-400">{row.loc}</td>
                                        <td className="px-6 py-4 text-sm font-black text-white">{row.urg}</td>
                                        <td className="px-6 py-4">
                                            {row.urg >= 75 && !["RESOLVED", "VERIFIED", "CLOSED"].includes(row.status) ? (
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${STATUS_STYLES["High Urgency"]}`}>
                                                    <AlertTriangle size={12} />
                                                    HIGH URGENCY
                                                </span>
                                            ) : (
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${STATUS_STYLES[row.status] || "text-gray-400 border-white/10"}`}>
                                                    {(row.status === "RESOLVED" || row.status === "VERIFIED" || row.status === "CLOSED") && <CheckCircle size={12} />}
                                                    {row.status}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-300">{row.days === 0 ? "Today" : `${row.days} d`}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => navigate(`/authority/power/case/${row.id}`)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-amber-500/20 text-gray-300 hover:text-amber-300 border border-white/10 hover:border-amber-500/30 rounded-lg text-xs font-bold transition-all"
                                            >
                                                View <ArrowUpRight size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-gray-500 font-medium">
                                        No critical items currently require immediate attention.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};

export default AuthorityPowerDashboard;
