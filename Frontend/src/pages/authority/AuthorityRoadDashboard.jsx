import React, { useState, useEffect } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from "recharts";
import {
    Construction,
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
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay, type: "spring", stiffness: 100 }}
        whileHover={{ y: -8, scale: 1.02 }}
        className="relative overflow-hidden rounded-[2rem] p-8 bg-white/[0.02] border border-white/5 backdrop-blur-2xl group cursor-default shadow-lg"
    >
        {/* Futuristic Hover Glows */}
        <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-[50px] opacity-0 group-hover:opacity-30 transition-all duration-700 ${bgClass.split(' ')[0]}`} />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        <div className="flex items-start justify-between mb-6 relative z-10">
            <div className={`p-4 rounded-2xl border border-white/10 transition-colors duration-500 shadow-inner backdrop-blur-md ${bgClass}`}>
                <Icon size={26} className={iconClass} />
            </div>
        </div>

        <div className="relative z-10">
            {loading ? (
                <div className="h-10 w-24 bg-white/5 animate-pulse rounded-lg mb-2" />
            ) : (
                <h3 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 tracking-tight drop-shadow-sm mb-2">{value}</h3>
            )}
            <p className="text-gray-400 text-sm font-bold uppercase tracking-[0.2em]">{title}</p>
        </div>
    </motion.div>
);

// ─── Styles ───────────
const STATUS_STYLES = {
    New: "bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse",
    Accepted: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "In Progress": "bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]",
    Assessment: "bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]",
    Resolved: "bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]",
    "Work Completed": "bg-green-500/10 text-green-400 border-green-500/20",
    Rejected: "bg-red-500/10 text-red-400 border-red-500/20",
    Reopened: "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse",
    Revoked: "bg-gray-500/10 text-gray-300 border-gray-500/20",
    "High Urgency": "bg-red-500/10 text-red-400 border-red-500/20 animate-ping",
};

const COLORS = ["#F97316", "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e"];

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

const AuthorityRoadDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [stats, setStats] = useState({ new: 0, inProgress: 0, completed: 0, highUrgency: 0 });
    const [criticalIncidents, setCriticalIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);

    // Analytics state
    const [analytics, setAnalytics] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);
    const [timeRange, setTimeRange] = useState("Last 7 Days");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const mapStatusToLifecycle = (backendStatus) => {
        switch (backendStatus) {
            case "OPEN": return "New";
            case "ACCEPTED": return "Accepted";
            case "IN_PROGRESS": return "In Progress";
            case "VERIFIED": return "Assessment";
            case "RESOLVED": return "Resolved";
            case "CLOSED": return "Work Completed";
            case "REOPENED": return "Reopened";
            case "REJECTED": return "Rejected";
            case "REVOKED": return "Revoked";
            default: return "New";
        }
    };

    const getDaysOpen = (dateString) => {
        if (!dateString) return 0;
        const start = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - start);
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = user?.token || localStorage.getItem("token") || (user && user.accessToken ? user.accessToken : null);
                const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

                // Fetch Stats
                const statsRes = await fetch("/api/v1/authority/road/stats", { headers: authHeader });
                const statsData = await statsRes.json();
                if (statsData.success) setStats(statsData.data);
                setStatsLoading(false);

                // Fetch Critical Incidents
                const criticalRes = await fetch("/api/v1/authority/road/critical", { headers: authHeader });
                const criticalData = await criticalRes.json();
                if (criticalData.success) {
                    setCriticalIncidents(criticalData.data.map(item => ({
                        id: item._id,
                        reportId: item.reportId || `#ROA-${item._id.substring(item._id.length - 4).toUpperCase()}`,
                        category: item.category || "Infrastructure",
                        subtype: item.title,
                        loc: item.address || "Unknown",
                        urg: Math.min(100, (item.urgencyScore || 10) + (item.upvotes || 0)),
                        status: mapStatusToLifecycle(item.status),
                        days: getDaysOpen(item.createdAt)
                    })));
                }
            } catch (err) {
                console.error("Error fetching road dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    // Fetch Analytics
    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = user?.token || localStorage.getItem("token") || (user && user.accessToken ? user.accessToken : null);
                const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

                const res = await fetch("/api/v1/authority/road/analytics", { headers: authHeader });
                if (!res.ok) throw new Error("Failed to fetch analytics");
                const result = await res.json();
                if (result.success) setAnalytics(result.data);
            } catch (err) {
                console.error("Error fetching road analytics:", err);
            } finally {
                setAnalyticsLoading(false);
            }
        };

        fetchAnalytics();
    }, [user]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return "Good Morning, Officer";
        if (hour >= 12 && hour < 17) return "Good Afternoon, Officer";
        if (hour >= 17 && hour < 21) return "Good Evening, Officer";
        return "System Monitoring Active";
    };

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
        <div className="space-y-10 pb-16 relative">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none -translate-y-1/2" />
            
            {/* ── HEADER ── */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col gap-1 relative z-10"
            >
                <div className="flex flex-col mb-4">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-[10px] uppercase tracking-[0.3em] text-orange-400 font-black mb-2 w-max shadow-[0_0_15px_rgba(249,115,22,0.15)] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping" />
                        {getGreeting()}
                    </span>
                    <span className="text-xs uppercase tracking-[0.2em] text-gray-500 font-bold ml-1">
                        System Monitoring Active
                    </span>
                </div>
                <h1 className="text-4xl lg:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-50 to-orange-200 tracking-tight drop-shadow-lg leading-tight">
                    Command Center
                </h1>
                <p className="text-orange-100/70 text-lg font-medium max-w-2xl ml-1">
                    Live operational metrics and infrastructure health for the Road Authority.
                </p>
            </motion.div>

            {/* ── STATS CARDS ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="New Complaints"
                    value={stats.new}
                    icon={Construction}
                    bgClass="bg-blue-500/10 group-hover:bg-blue-500/20"
                    iconClass="text-blue-400"
                    loading={statsLoading}
                    delay={0.1}
                />
                <StatCard
                    title="In Progress"
                    value={stats.inProgress}
                    icon={Clock}
                    bgClass="bg-orange-500/10 group-hover:bg-orange-500/20"
                    iconClass="text-orange-400"
                    loading={statsLoading}
                    delay={0.2}
                />
                <StatCard
                    title="Work Completed"
                    value={stats.completed}
                    icon={CheckCircle}
                    bgClass="bg-green-500/10 group-hover:bg-green-500/20"
                    iconClass="text-green-400"
                    loading={statsLoading}
                    delay={0.3}
                />
                <StatCard
                    title="High Urgency"
                    value={stats.highUrgency}
                    icon={AlertTriangle}
                    bgClass="bg-red-500/10 group-hover:bg-red-500/20"
                    iconClass="text-red-400"
                    loading={statsLoading}
                    delay={0.4}
                />
            </div>

            {/* ── CRITICAL ITEMS TABLE ── */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="glass-card border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl relative group"
            >
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
                <div className="p-8 border-b border-white/5 flex items-center justify-between relative z-10">
                    <h3 className="text-xl font-black text-white flex items-center gap-3 tracking-tight">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse shadow-[0_0_15px_rgba(249,115,22,0.8)]" />
                        </div>
                        Critical Action Board
                    </h3>
                </div>

                <div className="overflow-x-auto">
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
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="py-20 text-center text-gray-500">
                                        <Loader2 className="animate-spin mx-auto mb-4" size={32} />
                                        <p className="font-bold tracking-widest uppercase text-xs">Loading Critical Items...</p>
                                    </td>
                                </tr>
                            ) : criticalIncidents.length > 0 ? (
                                criticalIncidents.map((row) => (
                                    <tr key={row.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 font-mono text-sm text-orange-400 font-bold">{row.reportId}</td>
                                        <td className="px-6 py-4 text-sm text-gray-300">{row.category}</td>
                                        <td className="px-6 py-4 text-sm text-white font-medium">{row.subtype}</td>
                                        <td className="px-6 py-4 text-sm text-gray-400">{row.loc}</td>
                                        <td className="px-6 py-4 text-sm font-black text-white">{row.urg}</td>
                                        <td className="px-6 py-4">
                                            {row.urg >= 75 && row.status !== "Resolved" ? (
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${STATUS_STYLES["High Urgency"]}`}>
                                                    <AlertTriangle size={12} />
                                                    HIGH URGENCY
                                                </span>
                                            ) : (
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${STATUS_STYLES[row.status]}`}>
                                                    {row.status === "Resolved" && <CheckCircle size={12} />}
                                                    {row.status}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-300">{row.days}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => navigate(`/authority/road/case/${row.id}`)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-orange-500/20 text-gray-300 hover:text-orange-300 border border-white/10 hover:border-orange-500/30 rounded-lg text-xs font-bold transition-all"
                                            >
                                                View <ArrowUpRight size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="py-20 text-center text-gray-500 font-medium">
                                        No critical attention items found.
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
                className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-4 border-t border-white/5"
            >
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-500/10">
                            <BarChart3 size={20} className="text-orange-400" />
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
                        className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-orange-500/20 text-white rounded-xl text-sm font-bold transition-all hover:bg-white/10"
                    >
                        <Filter size={16} className="text-orange-400" />
                        {timeRange}
                        <ChevronDown size={16} className={`transition-transform ${isFilterOpen ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                        {isFilterOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-2 w-48 bg-[#020617] border border-white/10 rounded-xl shadow-2xl z-50 p-1 backdrop-blur-3xl"
                            >
                                {["Last 7 Days", "Last 30 Days", "Last 3 Months"].map((range) => (
                                    <button
                                        key={range}
                                        onClick={() => { setTimeRange(range); setIsFilterOpen(false); }}
                                        className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${timeRange === range ? "bg-orange-500/10 text-orange-400" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                {analyticsStats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + i * 0.1 }}
                        className="glass-card border border-white/5 rounded-[2rem] p-8 relative overflow-hidden group hover:border-white/10 transition-colors"
                    >
                        <div className="absolute -top-10 -right-10 p-3 opacity-[0.03] group-hover:opacity-10 group-hover:scale-125 transition-all duration-700 text-white">
                            <stat.icon size={120} />
                        </div>
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">{stat.label}</p>
                        <div className="flex items-end gap-4">
                            {analyticsLoading ? (
                                <div className="h-10 w-20 bg-white/5 animate-pulse rounded-lg my-1" />
                            ) : (
                                <h3 className="text-4xl font-black text-white tracking-tight">{stat.value}</h3>
                            )}
                            <span className={`text-[11px] font-black px-2.5 py-1 rounded-xl uppercase tracking-wider ${stat.change.startsWith("+") ? "text-green-400 bg-green-400/10 border border-green-400/20" : "text-red-400 bg-red-400/10 border border-red-400/20"}`}>
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
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 rounded-lg bg-orange-500/10">
                            <BarChart3 size={20} className="text-orange-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Weekly Complaint Trend</h3>
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
                                    <Bar dataKey="count" fill="#F97316" radius={[4, 4, 0, 0]} barSize={32} />
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
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 rounded-lg bg-orange-500/10">
                            <PieChartIcon size={20} className="text-orange-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Issue Category Breakdown</h3>
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
                    className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 rounded-lg bg-orange-500/10">
                            <Users size={20} className="text-orange-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Complaints by Sector</h3>
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
                                    <Bar dataKey="count" fill="#F97316" radius={[0, 4, 4, 0]} barSize={20} />
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

export default AuthorityRoadDashboard;
