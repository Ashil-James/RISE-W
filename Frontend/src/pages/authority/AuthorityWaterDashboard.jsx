import React, { useState, useEffect, useMemo } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from "recharts";
import {
    Clipboard,
    Clock,
    CheckCircle,
    AlertTriangle,
    ArrowUpRight,
    ArrowRight,
    AlertCircle,
    Loader2,
    TrendingUp,
    Users,
    Filter,
    ChevronDown,
    BarChart3,
    PieChart as PieChartIcon,
    Activity,
    Search,
    ListFilter,
    LayoutGrid,
    Table2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// ─── Constants ──────────────────────────────────────────────────────────────────
const STATUS_TABS = [
    "All",
    "New",
    "Accepted",
    "Active Ops",
    "Assessment",
    "Resolved",
    "Reopened",
    "Rejected",
    "Revoked",
];

const URGENCY_LEVELS = ["Any Urgency", "Critical (75+)", "High (50-74)", "Low (0-49)"];

const STATUS_STYLES = {
    New: "bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse",
    Accepted: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "Active Ops": "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]",
    "In Progress": "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]",
    Assessment: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Resolved: "bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]",
    "Work Completed": "bg-green-500/10 text-green-400 border-green-500/20",
    Reopened: "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse",
    Rejected: "bg-red-500/10 text-red-400 border-red-500/20",
    Revoked: "bg-gray-500/10 text-gray-300 border-gray-500/20",
    "High Urgency": "bg-red-500/10 text-red-400 border-red-500/20",
};

const COLORS = ["#0EA5E9", "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e"];

// ─── Helpers ────────────────────────────────────────────────────────────────────
const mapStatusToLifecycle = (backendStatus) => {
    switch (backendStatus) {
        case "OPEN": return "New";
        case "ACCEPTED": return "Accepted";
        case "IN_PROGRESS": return "Active Ops";
        case "VERIFIED": return "Assessment";
        case "RESOLVED": return "Resolved";
        case "CLOSED": return "Work Completed";
        case "REOPENED": return "Reopened";
        case "REJECTED": return "Rejected";
        case "REVOKED": return "Revoked";
        default: return "New";
    }
};

const getDuration = (dateString) => {
    if (!dateString) return "Just now";
    const start = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 0) return `${diffDays}d`;
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    if (diffHours > 0) return `${diffHours}h`;
    const diffMins = Math.floor(diffTime / (1000 * 60));
    return `${diffMins}m`;
};

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning, Officer";
    if (hour >= 12 && hour < 17) return "Good Afternoon, Officer";
    if (hour >= 17 && hour < 21) return "Good Evening, Officer";
    return "System Monitoring Active";
};

// ─── Sub‑components ─────────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon: Icon, delay, bgClass, iconClass, loading }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay, type: "spring", stiffness: 100 }}
        whileHover={{ y: -6, scale: 1.02 }}
        className="relative overflow-hidden rounded-2xl p-6 bg-white/[0.03] border border-white/5 backdrop-blur-2xl group cursor-default"
    >
        <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full blur-[40px] opacity-0 group-hover:opacity-25 transition-all duration-700 ${bgClass.split(' ')[0]}`} />
        <div className="flex items-start justify-between mb-4 relative z-10">
            <div className={`p-3 rounded-xl border border-white/10 transition-colors duration-500 shadow-inner backdrop-blur-md ${bgClass}`}>
                <Icon size={22} className={iconClass} />
            </div>
        </div>
        <div className="relative z-10">
            {loading ? (
                <div className="h-8 w-20 bg-white/5 animate-pulse rounded-lg mb-1" />
            ) : (
                <h3 className="text-3xl font-black text-white tracking-tight mb-0.5">{value}</h3>
            )}
            <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.15em]">{title}</p>
        </div>
    </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#0f172a] border border-white/10 p-3 rounded-lg backdrop-blur-md shadow-2xl">
                <p className="text-white font-bold text-xs mb-1">{label || payload[0].name}</p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].color || payload[0].fill }} />
                    <p className="text-[#e2e8f0] text-sm font-medium">
                        {payload[0].value} {payload[0].name === "count" ? "Complaints" : ""}
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

// ─── Main Component ─────────────────────────────────────────────────────────────
const AuthorityWaterDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // ── View toggle ──
    const [activeView, setActiveView] = useState("overview"); // "overview" | "complaints"

    // ── Dashboard data ──
    const [stats, setStats] = useState({ new: 0, inProgress: 0, completed: 0, highUrgency: 0 });
    const [criticalIncidents, setCriticalIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ── Analytics ──
    const [analytics, setAnalytics] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);
    const [timeRange, setTimeRange] = useState("Last 7 Days");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // ── Matrix data ──
    const [allIncidents, setAllIncidents] = useState([]);
    const [matrixLoading, setMatrixLoading] = useState(true);
    const [matrixError, setMatrixError] = useState(null);

    // ── Matrix filters ──
    const [statusTab, setStatusTab] = useState("All");
    const [search, setSearch] = useState("");
    const [urgencyFilter, setUrgencyFilter] = useState("Any Urgency");
    const [isUrgencyOpen, setIsUrgencyOpen] = useState(false);

    // ── Fetch dashboard data ──
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = user?.token || localStorage.getItem("token") || (user && user.accessToken ? user.accessToken : null);
                const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

                const statsRes = await fetch("/api/v1/authority/water/stats", { headers: authHeader });
                if (statsRes.ok) {
                    const statsResult = await statsRes.json();
                    if (statsResult.success) setStats(statsResult.data);
                }

                const criticalRes = await fetch("/api/v1/authority/water/critical", { headers: authHeader });
                if (criticalRes.ok) {
                    const criticalResult = await criticalRes.json();
                    if (criticalResult.success) {
                        setCriticalIncidents(criticalResult.data.map(item => ({
                            id: item._id,
                            ref: item.reportId || `#REQ-${item._id.substring(item._id.length - 4).toUpperCase()}`,
                            category: item.category || "Water Supply",
                            subtype: item.title || "Undisclosed Issue",
                            loc: item.address || "Location Unavailable",
                            urg: Math.min(100, (item.urgencyScore || 10) + (item.upvotes || 0)),
                            status: mapStatusToLifecycle(item.status),
                            days: getDuration(item.createdAt),
                        })));
                    }
                }
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [user]);

    // ── Fetch analytics ──
    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = user?.token || localStorage.getItem("token") || (user && user.accessToken ? user.accessToken : null);
                const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
                const res = await fetch("/api/v1/authority/water/analytics", { headers: authHeader });
                if (!res.ok) throw new Error("Failed to fetch analytics");
                const result = await res.json();
                if (result.success) setAnalytics(result.data);
            } catch (err) {
                console.error("Error fetching analytics:", err);
            } finally {
                setAnalyticsLoading(false);
            }
        };
        fetchAnalytics();
    }, [user]);

    // ── Fetch all incidents (for complaints tab) ──
    useEffect(() => {
        const fetchAllIncidents = async () => {
            try {
                const token = user?.token || localStorage.getItem("token") || (user && user.accessToken ? user.accessToken : null);
                const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
                const res = await fetch("/api/v1/authority/water/incidents", { headers: authHeader });
                if (!res.ok) throw new Error("Failed to fetch incidents");
                const result = await res.json();
                if (result.success) {
                    setAllIncidents(result.data.map(item => ({
                        id: item._id,
                        ref: item.reportId || `#REQ-${item._id.substring(item._id.length - 4).toUpperCase()}`,
                        category: item.category || "Water Supply",
                        subtype: item.title || "Undisclosed Issue",
                        loc: item.address || "Location Unavailable",
                        urg: Math.min(100, (item.urgencyScore || 10) + (item.upvotes || 0)),
                        lifecycle: mapStatusToLifecycle(item.status),
                        duration: getDuration(item.createdAt),
                    })));
                }
            } catch (err) {
                console.error("Error fetching incidents:", err);
                setMatrixError(err.message);
            } finally {
                setMatrixLoading(false);
            }
        };
        fetchAllIncidents();
    }, [user]);

    // ── Memoized filtered list ──
    const filteredIncidents = useMemo(() => {
        return allIncidents.filter((row) => {
            if (statusTab !== "All" && row.lifecycle !== statusTab && !(statusTab === "Resolved" && row.lifecycle === "Work Completed")) return false;
            if (search && !row.ref.toLowerCase().includes(search.toLowerCase()) && !row.subtype.toLowerCase().includes(search.toLowerCase()) && !row.loc.toLowerCase().includes(search.toLowerCase())) return false;
            if (urgencyFilter === "Critical (75+)" && row.urg < 75) return false;
            if (urgencyFilter === "High (50-74)" && (row.urg < 50 || row.urg >= 75)) return false;
            if (urgencyFilter === "Low (0-49)" && row.urg >= 50) return false;
            return true;
        });
    }, [allIncidents, statusTab, search, urgencyFilter]);

    // ── Derived analytics ──
    const weeklyData = analytics?.weeklyTrend || [];
    const categoryData = analytics?.categories || [];
    const sectorData = analytics?.sectors || [];
    const dataStats = analytics?.stats || { total: 0, resolved: 0, avgTime: 0, rate: 0 };

    const analyticsStats = [
        { label: "Total Received", value: analyticsLoading ? "-" : dataStats.total.toString(), icon: Activity, change: "+0%" },
        { label: "Resolved", value: analyticsLoading ? "-" : dataStats.resolved.toString(), icon: CheckCircle, change: "+0%" },
        { label: "Avg Resolution", value: analyticsLoading ? "-" : `${dataStats.avgTime}h`, icon: Clock, change: "-0%" },
        { label: "Resolution Rate", value: analyticsLoading ? "-" : `${dataStats.rate}%`, icon: TrendingUp, change: "+0%" },
    ];

    return (
        <div className="space-y-8 pb-12">
            {/* ══ HEADER ══ */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-1">
                <div className="flex flex-col mb-3">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-[10px] uppercase tracking-[0.3em] text-sky-400 font-black mb-2 w-max">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                        {getGreeting()}
                    </span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
                    Command Center
                </h1>
                <p className="text-gray-400 font-medium">
                    Water Authority — live operations and case management
                </p>
            </motion.div>

            {/* ══ VIEW SWITCHER ══ */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="inline-flex items-center gap-1 p-1.5 bg-white/5 border border-white/10 rounded-xl backdrop-blur-xl">
                    <button
                        onClick={() => setActiveView("overview")}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                            activeView === "overview"
                                ? "text-sky-400 bg-sky-500/15 shadow-[0_0_15px_rgba(56,189,248,0.15)]"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                    >
                        <LayoutGrid size={16} />
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveView("complaints")}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                            activeView === "complaints"
                                ? "text-sky-400 bg-sky-500/15 shadow-[0_0_15px_rgba(56,189,248,0.15)]"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                    >
                        <Table2 size={16} />
                        All Complaints
                        {allIncidents.length > 0 && (
                            <span className="ml-1 px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-black text-gray-300">
                                {allIncidents.length}
                            </span>
                        )}
                    </button>
                </div>
            </motion.div>

            <AnimatePresence mode="wait">
                {activeView === "overview" ? (
                    <motion.div key="overview" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }} className="space-y-8">
                        {/* ── STATS CARDS ── */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            <StatCard title="New Complaints" value={loading ? "-" : stats.new} icon={AlertCircle} bgClass="bg-blue-500/10 group-hover:bg-blue-500/20" iconClass="text-blue-400" loading={loading} delay={0.1} />
                            <StatCard title="In Progress" value={loading ? "-" : stats.inProgress} icon={Clock} bgClass="bg-amber-500/10 group-hover:bg-amber-500/20" iconClass="text-amber-400" loading={loading} delay={0.15} />
                            <StatCard title="Completed" value={loading ? "-" : stats.completed} icon={CheckCircle} bgClass="bg-green-500/10 group-hover:bg-green-500/20" iconClass="text-green-400" loading={loading} delay={0.2} />
                            <StatCard title="High Urgency" value={loading ? "-" : stats.highUrgency} icon={AlertTriangle} bgClass="bg-red-500/10 group-hover:bg-red-500/20" iconClass="text-red-400" loading={loading} delay={0.25} />
                        </div>

                        {/* ── CRITICAL ITEMS TABLE ── */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl">
                            <div className="p-5 border-b border-white/5 flex items-center justify-between">
                                <h3 className="text-base font-black text-white flex items-center gap-2.5 tracking-tight">
                                    <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
                                        <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
                                    </div>
                                    Priority Queue
                                </h3>
                                <button onClick={() => setActiveView("complaints")} className="text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1">
                                    View all <ArrowRight size={12} />
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center h-48 text-sky-400">
                                        <Loader2 size={28} className="animate-spin mb-3" />
                                        <span className="text-xs font-bold tracking-widest uppercase">Loading...</span>
                                    </div>
                                ) : error ? (
                                    <div className="flex flex-col items-center justify-center h-48 text-red-400">
                                        <AlertTriangle size={28} className="mb-3" />
                                        <span className="text-xs font-bold uppercase">Failed: {error}</span>
                                    </div>
                                ) : criticalIncidents.length > 0 ? (
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-black/20 text-[10px] uppercase tracking-wider text-gray-500 font-bold border-b border-white/5">
                                                <th className="px-5 py-3">Report ID</th>
                                                <th className="px-5 py-3">Issue</th>
                                                <th className="px-5 py-3">Location</th>
                                                <th className="px-5 py-3">Urgency</th>
                                                <th className="px-5 py-3">Status</th>
                                                <th className="px-5 py-3">Age</th>
                                                <th className="px-5 py-3 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {criticalIncidents.slice(0, 5).map((row) => (
                                                <tr key={row.id} className="hover:bg-white/[0.03] transition-colors">
                                                    <td className="px-5 py-3.5 font-mono text-sm text-sky-400 font-bold">{row.ref}</td>
                                                    <td className="px-5 py-3.5 text-sm text-white font-medium">{row.subtype}</td>
                                                    <td className="px-5 py-3.5 text-sm text-gray-400 max-w-[200px] truncate">{row.loc}</td>
                                                    <td className="px-5 py-3.5 text-sm font-black text-white">{row.urg}</td>
                                                    <td className="px-5 py-3.5">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${STATUS_STYLES[row.status] || STATUS_STYLES["New"]}`}>
                                                            {row.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-sm font-bold text-gray-400">{row.days}</td>
                                                    <td className="px-5 py-3.5 text-right">
                                                        <button onClick={() => navigate(`/authority/water/case/${row.id}`)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-sky-500/20 text-gray-300 hover:text-sky-300 border border-white/10 hover:border-sky-500/30 rounded-lg text-xs font-bold transition-all">
                                                            View <ArrowUpRight size={13} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="py-16 text-center text-gray-500 font-medium text-sm">
                                        No critical items found.
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* ── ANALYTICS ── */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-4 border-t border-white/5">
                            <div>
                                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-sky-500/10"><BarChart3 size={18} className="text-sky-400" /></div>
                                    Analytics
                                </h2>
                                <p className="text-gray-400 text-sm font-medium mt-0.5">Resolution performance and complaint trends</p>
                            </div>
                            <div className="relative">
                                <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-sky-500/20 text-white rounded-xl text-sm font-bold transition-all hover:bg-white/10">
                                    <Filter size={14} className="text-sky-400" />
                                    {timeRange}
                                    <ChevronDown size={14} className={`transition-transform ${isFilterOpen ? "rotate-180" : ""}`} />
                                </button>
                                <AnimatePresence>
                                    {isFilterOpen && (
                                        <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 mt-2 w-44 bg-[#020617] border border-white/10 rounded-xl shadow-2xl z-50 p-1 backdrop-blur-3xl">
                                            {["Last 7 Days", "Last 30 Days", "Last 3 Months"].map((range) => (
                                                <button key={range} onClick={() => { setTimeRange(range); setIsFilterOpen(false); }} className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${timeRange === range ? "bg-sky-500/10 text-sky-400" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}>
                                                    {range}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Analytics Stat Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {analyticsStats.map((stat, i) => (
                                <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.08 }} className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 relative overflow-hidden group">
                                    <div className="absolute -top-6 -right-6 opacity-[0.04] group-hover:opacity-10 transition-opacity duration-500 text-white">
                                        <stat.icon size={80} />
                                    </div>
                                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.15em] mb-2">{stat.label}</p>
                                    <div className="flex items-end gap-2">
                                        {analyticsLoading ? (
                                            <div className="h-8 w-16 bg-white/5 animate-pulse rounded-lg" />
                                        ) : (
                                            <h3 className="text-2xl font-black text-white tracking-tight">{stat.value}</h3>
                                        )}
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-lg ${stat.change.startsWith("+") ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10"}`}>
                                            {stat.change}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 backdrop-blur-xl">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="p-1.5 rounded-lg bg-sky-500/10"><BarChart3 size={16} className="text-sky-400" /></div>
                                    <h3 className="text-sm font-bold text-white">Weekly Trend</h3>
                                </div>
                                <div className="h-64 w-full">
                                    {analyticsLoading ? (
                                        <div className="w-full h-full flex justify-center items-center"><Loader2 className="animate-spin text-gray-500" /></div>
                                    ) : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={weeklyData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
                                                <Bar dataKey="count" fill="#0EA5E9" radius={[4, 4, 0, 0]} barSize={28} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 backdrop-blur-xl">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="p-1.5 rounded-lg bg-sky-500/10"><PieChartIcon size={16} className="text-sky-400" /></div>
                                    <h3 className="text-sm font-bold text-white">Category Breakdown</h3>
                                </div>
                                <div className="h-64 w-full">
                                    {analyticsLoading ? (
                                        <div className="w-full h-full flex justify-center items-center"><Loader2 className="animate-spin text-gray-500" /></div>
                                    ) : categoryData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={5} dataKey="value">
                                                    {categoryData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="w-full h-full flex justify-center items-center"><span className="text-gray-500 text-sm">No data</span></div>
                                    )}
                                </div>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="lg:col-span-2 bg-white/[0.03] border border-white/5 rounded-2xl p-5 backdrop-blur-xl">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="p-1.5 rounded-lg bg-sky-500/10"><Users size={16} className="text-sky-400" /></div>
                                    <h3 className="text-sm font-bold text-white">Complaints by Sector</h3>
                                </div>
                                <div className="h-48 w-full">
                                    {analyticsLoading ? (
                                        <div className="w-full h-full flex justify-center items-center"><Loader2 className="animate-spin text-gray-500" /></div>
                                    ) : sectorData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart layout="vertical" data={sectorData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                                                <XAxis type="number" hide />
                                                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={120} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar dataKey="count" fill="#0EA5E9" radius={[0, 4, 4, 0]} barSize={18} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="w-full h-full flex justify-center items-center"><span className="text-gray-500 text-sm">No data</span></div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                ) : (
                    /* ══════════════════════════════════════════════════════════════════
                       ── ALL COMPLAINTS TAB ──
                       ══════════════════════════════════════════════════════════════════ */
                    <motion.div key="complaints" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }} className="space-y-5">
                        {/* Status Tabs */}
                        <div className="flex flex-wrap gap-1.5 p-1.5 bg-white/5 border border-white/10 rounded-xl backdrop-blur-xl">
                            {STATUS_TABS.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setStatusTab(tab)}
                                    className={`relative px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                                        statusTab === tab
                                            ? "text-sky-400 bg-sky-500/15 shadow-[0_0_15px_rgba(56,189,248,0.15)]"
                                            : "text-gray-400 hover:text-white hover:bg-white/5"
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Search & Urgency */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <div className="relative flex-1">
                                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Search by ID, issue, or location..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full bg-black/30 border border-white/10 text-white text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-sky-500/50 transition-colors placeholder:text-gray-600"
                                />
                            </div>
                            <div className="relative">
                                <button onClick={() => setIsUrgencyOpen(!isUrgencyOpen)} className="flex items-center gap-2 px-4 py-2.5 bg-black/30 border border-white/10 hover:border-white/20 text-gray-300 rounded-xl text-sm font-bold transition-colors w-44 justify-between">
                                    <div className="flex items-center gap-2 shrink-0">
                                        <ListFilter size={14} className="text-sky-400" />
                                        <span className="truncate">{urgencyFilter === "Any Urgency" ? "Urgency" : urgencyFilter}</span>
                                    </div>
                                    <ChevronDown size={14} />
                                </button>
                                <AnimatePresence>
                                    {isUrgencyOpen && (
                                        <motion.div initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }} className="absolute right-0 top-full mt-2 w-44 bg-[#020617] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-2xl">
                                            {URGENCY_LEVELS.map((level) => (
                                                <button key={level} onClick={() => { setUrgencyFilter(level); setIsUrgencyOpen(false); }} className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-sky-500/15 hover:text-sky-300 ${urgencyFilter === level ? "text-sky-400 bg-sky-500/10 font-bold" : "text-gray-400"}`}>
                                                    {level}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Complaint Table */}
                        <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl">
                            <div className="overflow-x-auto">
                                {matrixLoading ? (
                                    <div className="flex flex-col items-center justify-center h-64 text-sky-400">
                                        <Loader2 size={28} className="animate-spin mb-3" />
                                        <span className="text-xs font-bold tracking-widest uppercase">Loading complaints...</span>
                                    </div>
                                ) : matrixError ? (
                                    <div className="flex flex-col items-center justify-center h-64 text-red-400">
                                        <AlertTriangle size={28} className="mb-3" />
                                        <span className="text-xs font-bold uppercase">Failed: {matrixError}</span>
                                    </div>
                                ) : (
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-black/20 text-[10px] uppercase tracking-wider text-gray-500 font-bold border-b border-white/5">
                                                <th className="px-5 py-3">Ref ID</th>
                                                <th className="px-5 py-3">Category</th>
                                                <th className="px-5 py-3">Issue</th>
                                                <th className="px-5 py-3">Location</th>
                                                <th className="px-5 py-3">Urgency</th>
                                                <th className="px-5 py-3">Status</th>
                                                <th className="px-5 py-3">Age</th>
                                                <th className="px-5 py-3 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {filteredIncidents.length > 0 ? (
                                                filteredIncidents.map((row) => (
                                                    <tr key={row.id} className="hover:bg-white/[0.03] transition-colors">
                                                        <td className="px-5 py-3.5 font-mono text-sm text-sky-400 font-bold">{row.ref}</td>
                                                        <td className="px-5 py-3.5 text-sm text-gray-300">{row.category}</td>
                                                        <td className="px-5 py-3.5 text-sm text-white font-medium">{row.subtype}</td>
                                                        <td className="px-5 py-3.5 text-sm text-gray-400 max-w-[180px] truncate">{row.loc}</td>
                                                        <td className="px-5 py-3.5 text-sm font-black text-white">{row.urg}</td>
                                                        <td className="px-5 py-3.5">
                                                            {row.urg >= 75 && row.lifecycle !== "Resolved" && row.lifecycle !== "Work Completed" ? (
                                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${STATUS_STYLES["High Urgency"]}`}>
                                                                    <AlertTriangle size={11} /> HIGH
                                                                </span>
                                                            ) : (
                                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${STATUS_STYLES[row.lifecycle] || STATUS_STYLES["New"]}`}>
                                                                    {(row.lifecycle === "Resolved" || row.lifecycle === "Work Completed") && <CheckCircle size={11} />}
                                                                    {row.lifecycle}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-5 py-3.5 text-sm font-bold text-gray-400">{row.duration}</td>
                                                        <td className="px-5 py-3.5 text-right">
                                                            <button
                                                                onClick={() => navigate(`/authority/water/case/${row.id}`)}
                                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-white border border-sky-500/30 rounded-lg text-xs font-bold transition-all group/btn"
                                                            >
                                                                View
                                                                <ArrowRight size={13} className="group-hover/btn:translate-x-0.5 transition-transform" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={8} className="py-16 text-center text-gray-500 font-medium text-sm">
                                                        No complaints match your current filters.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AuthorityWaterDashboard;
