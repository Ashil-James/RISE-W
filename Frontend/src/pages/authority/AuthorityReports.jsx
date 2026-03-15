import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from "recharts";
import {
    TrendingUp,
    Users,
    CheckCircle,
    Clock,
    ChevronDown,
    Filter,
    BarChart3,
    PieChart as PieChartIcon,
    Activity,
    Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

const AuthorityReports = () => {
    const location = useLocation();
    const { user } = useAuth();
    const [timeRange, setTimeRange] = useState("Last 7 Days");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const isPower = location.pathname.includes("/power");
    const isRoad = location.pathname.includes("/road");
    // defaults to water

    // API Data state
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = user?.token || localStorage.getItem("token") || (user && user.accessToken ? user.accessToken : null);
                const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

                const endpoint = isPower
                    ? "/api/v1/authority/power/analytics"
                    : isRoad
                        ? "/api/v1/authority/road/analytics"
                        : "/api/v1/authority/water/incidents";

                const res = await fetch(endpoint, {
                    headers: authHeader,
                });

                if (!res.ok) throw new Error("Failed to fetch reports data");
                const result = await res.json();

                if (result.success) {
                    if (isPower || isRoad) {
                        setAnalytics(result.data);
                    }
                }
            } catch (err) {
                console.error("Error fetching authority reports stats:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [user, isPower]);

    const themeColor = isPower ? "#F59E0B" : isRoad ? "#F97316" : "#0EA5E9";
    const themeAccent = isPower ? "text-amber-400" : isRoad ? "text-orange-400" : "text-sky-400";
    const themeBg = isPower ? "bg-amber-500/10" : isRoad ? "bg-orange-500/10" : "bg-sky-500/10";
    const themeBorder = isPower ? "border-amber-500/20" : isRoad ? "border-orange-500/20" : "border-sky-500/20";

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return "Good Morning, Officer";
        if (hour >= 12 && hour < 17) return "Good Afternoon, Officer";
        if (hour >= 17 && hour < 21) return "Good Evening, Officer";
        return "System Monitoring Active";
    };

    // --- DATA CALCULATION LOGIC ---
    const weeklyData = analytics?.weeklyTrend || [];
    const categoryData = analytics?.categories || [];
    const sectorData = analytics?.sectors || [];
    const dataStats = analytics?.stats || { total: 0, resolved: 0, avgTime: 0, rate: 0 };

    const stats = [
        { label: "Total Complaints Received", value: loading ? "-" : dataStats.total.toString(), icon: Activity, change: "+0%" },
        { label: "Complaints Resolved", value: loading ? "-" : dataStats.resolved.toString(), icon: CheckCircle, change: "+0%" },
        { label: "Avg Resolution Time", value: loading ? "-" : `${dataStats.avgTime} hrs`, icon: Clock, change: "-0%" },
        { label: "Resolution Rate %", value: loading ? "-" : `${dataStats.rate}%`, icon: TrendingUp, change: "+0%" },
    ];

    const COLORS = [themeColor, "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e"];

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

    return (
        <div className="space-y-8 pb-12">
            {/* --- HEADER --- */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col md:flex-row md:items-end justify-between gap-6"
            >
                <div className="flex flex-col gap-1">
                    <div className="flex flex-col mb-2">
                        <span className={`text-xs uppercase tracking-[0.3em] ${themeAccent} font-bold mb-1`}>
                            {getGreeting()}
                        </span>
                        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-medium lowercase">
                            Monitoring Infrastructure Operations
                        </span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
                        Reports & Analytics
                    </h1>
                    <p className="text-gray-400 font-medium">
                        Operational insights and complaint resolution statistics
                    </p>
                </div>

                {/* Filter Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`flex items-center gap-2 px-4 py-2.5 bg-white/5 border ${themeBorder} text-white rounded-xl text-sm font-bold transition-all hover:bg-white/10`}
                    >
                        <Filter size={16} className={themeAccent} />
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
                                        className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${timeRange === range ? `${themeBg} ${themeAccent}` : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* --- STAT CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group"
                    >
                        <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform duration-500`}>
                            <stat.icon size={64} />
                        </div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">{stat.label}</p>
                        <div className="flex items-end gap-3">
                            {loading ? (
                                <Loader2 size={24} className="animate-spin text-gray-500 my-1" />
                            ) : (
                                <h3 className="text-3xl font-black text-white tracking-tight">{stat.value}</h3>
                            )}
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${stat.change.startsWith("+") ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10"}`}>
                                {stat.change}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* --- CHARTS GRID --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Weekly Trend */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className={`p-2 rounded-lg ${themeBg}`}>
                            <BarChart3 size={20} className={themeAccent} />
                        </div>
                        <h3 className="text-lg font-bold text-white">Weekly Complaint Trend</h3>
                    </div>
                    <div className="h-80 w-full">
                        {loading ? (
                            <div className="w-full h-full flex justify-center items-center"><Loader2 className="animate-spin text-gray-500" /></div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#94a3b8"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#94a3b8"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
                                    <Bar
                                        dataKey="count"
                                        fill={themeColor}
                                        radius={[4, 4, 0, 0]}
                                        barSize={32}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </motion.div>

                {/* Category Breakdown */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className={`p-2 rounded-lg ${themeBg}`}>
                            <PieChartIcon size={20} className={themeAccent} />
                        </div>
                        <h3 className="text-lg font-bold text-white">Issue Category Breakdown</h3>
                    </div>
                    <div className="h-80 w-full">
                        {loading ? (
                            <div className="w-full h-full flex justify-center items-center"><Loader2 className="animate-spin text-gray-500" /></div>
                        ) : categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
                                    />
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
                    transition={{ delay: 0.6 }}
                    className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className={`p-2 rounded-lg ${themeBg}`}>
                            <Users size={20} className={themeAccent} />
                        </div>
                        <h3 className="text-lg font-bold text-white">Complaints by Sector</h3>
                    </div>
                    <div className="h-64 w-full">
                        {loading ? (
                            <div className="w-full h-full flex justify-center items-center"><Loader2 className="animate-spin text-gray-500" /></div>
                        ) : sectorData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={sectorData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        stroke="#94a3b8"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        width={120}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar
                                        dataKey="count"
                                        fill={themeColor}
                                        radius={[0, 4, 4, 0]}
                                        barSize={20}
                                    />
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

export default AuthorityReports;
