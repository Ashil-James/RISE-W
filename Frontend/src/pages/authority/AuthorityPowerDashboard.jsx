import React, { useState, useEffect } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from "recharts";
import {
    Zap,
    Clock,
    CheckCircle,
    AlertTriangle,
    ArrowUpRight,
    AlertCircle,
    Loader2,
    TrendingUp,
    Users,
    Filter,
    ChevronDown,
    BarChart3,
    PieChart as PieChartIcon,
    Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// ─── StatCard Component ────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon: Icon, delay, bgClass, iconClass, loading }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        whileHover={{ y: -5, scale: 1.02 }}
        className="relative overflow-hidden rounded-xl p-6 bg-emerald-900/5 dark:bg-white/5 border border-emerald-900/10 dark:border-white/10 backdrop-blur-xl group cursor-default"
    >
        {/* Hover Glow */}
        <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-emerald-900/5 dark:bg-white/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="flex items-start justify-between mb-4 relative z-10">
            <div className={`p-3.5 rounded-xl border border-emerald-900/5 dark:border-white/5 transition-colors duration-300 ${bgClass}`}>
                <Icon size={22} className={iconClass} />
            </div>
        </div>

        <div className="relative z-10">
            {loading ? (
                <Loader2 size={24} className="animate-spin text-gray-500 mb-1" />
            ) : (
                <h3 className="text-3xl font-black text-emerald-950 dark:text-white mb-1 tracking-tight">{value}</h3>
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

const COLORS = ["#F59E0B", "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e"];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#0f172a] border border-emerald-900/10 dark:border-white/10 p-3 rounded-lg backdrop-blur-md shadow-2xl">
                <p className="text-emerald-950 dark:text-white font-bold text-xs mb-1">{label || payload[0].name}</p>
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

const AuthorityPowerDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [stats, setStats] = useState({ new: 0, inProgress: 0, completed: 0, highUrgency: 0 });
    const [criticalItems, setCriticalItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Analytics state
    const [analytics, setAnalytics] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);
    const [timeRange, setTimeRange] = useState("Last 7 Days");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

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

    // Fetch Analytics
    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = user?.token || localStorage.getItem("token") || (user && user.accessToken ? user.accessToken : null);
                const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

                const res = await fetch("/api/v1/authority/power/analytics", { headers: authHeader });
                if (!res.ok) throw new Error("Failed to fetch analytics");
                const result = await res.json();
                if (result.success) setAnalytics(result.data);
            } catch (err) {
                console.error("Error fetching power analytics:", err);
            } finally {
                setAnalyticsLoading(false);
            }
        };

        fetchAnalytics();
    }, [user]);

    const weeklyData = analytics?.weeklyTrend || [];
    const categoryData = analytics?.categories || [];
    const sectorData = analytics?.sectors || [];
    const dataStats = analytics?.stats || { total: 0, resolved: 0, avgTime: 0, rate: 0 };

    const analyticsStats = [
        { label: "Total Complaints Received", value: analyticsLoading ? "-" : dataStats.total.toString(), icon: Activity, change: "+0%" },
        { label: "Complaints Resolved", value: analyticsLoading ? "-" : dataStats.resolved.toString(), icon: CheckCircle, change: "+0%" },
        { label: "Avg Resolution Time", value: analyticsLoading ? "-" : `${dataStats.avgTime} hrs`, icon: Clock, change: "-0%" },
        { label: "Resolution Rate %", value: analyticsLoading ? "-" : `${dataStats.rate}%`, icon: TrendingUp, change: "+0%" },
    ];

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
                <h1 className="text-3xl lg:text-4xl font-black text-emerald-950 dark:text-white tracking-tight">
                    Operations Dashboard
                </h1>
                <p className="text-gray-400 font-medium">
                    Operational status & analytics for the POWER Authority
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
                className="bg-emerald-900/5 dark:bg-white/5 border border-emerald-900/10 dark:border-white/10 rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl"
            >
                <div className="p-6 border-b border-emerald-900/10 dark:border-white/10 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-emerald-950 dark:text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                        Critical Attention Items
                    </h3>
                    {loading && <Loader2 size={18} className="animate-spin text-amber-500" />}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-emerald-900/5 dark:bg-black/20 text-xs uppercase tracking-wider text-gray-500 font-bold border-b border-emerald-900/5 dark:border-white/5">
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
                                    <tr key={row.id} className="hover:bg-emerald-900/5 hover:dark:hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 font-mono text-sm text-amber-400 font-bold">{row.reportId}</td>
                                        <td className="px-6 py-4 text-sm text-gray-300">{row.category}</td>
                                        <td className="px-6 py-4 text-sm text-emerald-950 dark:text-white font-medium">{row.subtype}</td>
                                        <td className="px-6 py-4 text-sm text-gray-400">{row.loc}</td>
                                        <td className="px-6 py-4 text-sm font-black text-emerald-950 dark:text-white">{row.urg}</td>
                                        <td className="px-6 py-4">
                                            {row.urg >= 75 && !["RESOLVED", "VERIFIED", "CLOSED"].includes(row.status) ? (
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${STATUS_STYLES["High Urgency"]}`}>
                                                    <AlertTriangle size={12} />
                                                    HIGH URGENCY
                                                </span>
                                            ) : (
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${STATUS_STYLES[row.status] || "text-gray-400 border-emerald-900/10 dark:border-white/10"}`}>
                                                    {(row.status === "RESOLVED" || row.status === "VERIFIED" || row.status === "CLOSED") && <CheckCircle size={12} />}
                                                    {row.status}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-300">{row.days === 0 ? "Today" : `${row.days} d`}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => navigate(`/authority/power/case/${row.id}`)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-900/5 dark:bg-white/5 hover:bg-amber-500/20 text-gray-300 hover:text-amber-300 border border-emerald-900/10 dark:border-white/10 hover:border-amber-500/30 rounded-lg text-xs font-bold transition-all"
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

            {/* ══════════════════════════════════════════════════════════════════════
                ── ANALYTICS SECTION ──
               ══════════════════════════════════════════════════════════════════════ */}

            {/* Analytics Header with Filter */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-4 border-t border-emerald-900/5 dark:border-white/5"
            >
                <div>
                    <h2 className="text-2xl font-black text-emerald-950 dark:text-white tracking-tight flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-500/10">
                            <BarChart3 size={20} className="text-amber-400" />
                        </div>
                        Reports & Analytics
                    </h2>
                    <p className="text-gray-400 text-sm font-medium mt-1">
                        Operational insights and complaint resolution statistics
                    </p>
                </div>

                {/* Filter Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-900/5 dark:bg-white/5 border border-amber-500/20 text-emerald-950 dark:text-white rounded-xl text-sm font-bold transition-all hover:bg-emerald-900/10 hover:dark:hover:bg-white/10"
                    >
                        <Filter size={16} className="text-amber-400" />
                        {timeRange}
                        <ChevronDown size={16} className={`transition-transform ${isFilterOpen ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                        {isFilterOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-2 w-48 bg-[#020617] border border-emerald-900/10 dark:border-white/10 rounded-xl shadow-2xl z-50 p-1 backdrop-blur-3xl"
                            >
                                {["Last 7 Days", "Last 30 Days", "Last 3 Months"].map((range) => (
                                    <button
                                        key={range}
                                        onClick={() => { setTimeRange(range); setIsFilterOpen(false); }}
                                        className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${timeRange === range ? "bg-amber-500/10 text-amber-400" : "text-gray-400 hover:bg-emerald-900/5 hover:dark:hover:bg-white/5 hover:text-emerald-950 hover:dark:hover:text-white"}`}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Analytics Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {analyticsStats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + i * 0.1 }}
                        className="bg-emerald-900/5 dark:bg-white/5 border border-emerald-900/10 dark:border-white/10 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <stat.icon size={64} />
                        </div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">{stat.label}</p>
                        <div className="flex items-end gap-3">
                            {analyticsLoading ? (
                                <Loader2 size={24} className="animate-spin text-gray-500 my-1" />
                            ) : (
                                <h3 className="text-3xl font-black text-emerald-950 dark:text-white tracking-tight">{stat.value}</h3>
                            )}
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${stat.change.startsWith("+") ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10"}`}>
                                {stat.change}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Weekly Trend */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 }}
                    className="bg-emerald-900/5 dark:bg-white/5 border border-emerald-900/10 dark:border-white/10 rounded-2xl p-6 backdrop-blur-xl"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 rounded-lg bg-amber-500/10">
                            <BarChart3 size={20} className="text-amber-400" />
                        </div>
                        <h3 className="text-lg font-bold text-emerald-950 dark:text-white">Weekly Complaint Trend</h3>
                    </div>
                    <div className="h-80 w-full">
                        {analyticsLoading ? (
                            <div className="w-full h-full flex justify-center items-center"><Loader2 className="animate-spin text-gray-500" /></div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
                                    <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </motion.div>

                {/* Category Breakdown */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    className="bg-emerald-900/5 dark:bg-white/5 border border-emerald-900/10 dark:border-white/10 rounded-2xl p-6 backdrop-blur-xl"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 rounded-lg bg-amber-500/10">
                            <PieChartIcon size={20} className="text-amber-400" />
                        </div>
                        <h3 className="text-lg font-bold text-emerald-950 dark:text-white">Issue Category Breakdown</h3>
                    </div>
                    <div className="h-80 w-full">
                        {analyticsLoading ? (
                            <div className="w-full h-full flex justify-center items-center"><Loader2 className="animate-spin text-gray-500" /></div>
                        ) : categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="w-full h-full flex justify-center items-center"><span className="text-gray-500">No Data Available</span></div>
                        )}
                    </div>
                </motion.div>

                {/* Sector Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3 }}
                    className="lg:col-span-2 bg-emerald-900/5 dark:bg-white/5 border border-emerald-900/10 dark:border-white/10 rounded-2xl p-6 backdrop-blur-xl"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 rounded-lg bg-amber-500/10">
                            <Users size={20} className="text-amber-400" />
                        </div>
                        <h3 className="text-lg font-bold text-emerald-950 dark:text-white">Complaints by Sector</h3>
                    </div>
                    <div className="h-64 w-full">
                        {analyticsLoading ? (
                            <div className="w-full h-full flex justify-center items-center"><Loader2 className="animate-spin text-gray-500" /></div>
                        ) : sectorData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={sectorData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={120} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="count" fill="#F59E0B" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="w-full h-full flex justify-center items-center"><span className="text-gray-500">No Data Available</span></div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AuthorityPowerDashboard;
