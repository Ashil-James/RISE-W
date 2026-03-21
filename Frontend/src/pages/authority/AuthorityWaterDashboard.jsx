import React, { useState, useEffect } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, AreaChart, Area
} from "recharts";
import {
    Droplets, Clock, CheckCircle, AlertTriangle, ArrowRight, AlertCircle,
    Activity, TrendingUp, Filter, Layers, BarChart3, PieChart as PieChartIcon, Users, RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const COLORS = ["#0ea5e9", "#3b82f6", "#8b5cf6", "#ec4899", "#10b981"];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 dark:bg-[#020617]/90 border border-slate-200 dark:border-white/10 p-4 rounded-xl backdrop-blur-xl shadow-xl z-50">
                <p className="text-slate-900 dark:text-white font-bold text-xs mb-1">{label || payload[0].name}</p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].color || payload[0].fill }} />
                    <p className="text-slate-700 dark:text-slate-300 text-sm font-medium">
                        {payload[0].value} {payload[0].name === "count" ? "Complaints" : ""}
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

const StatCard = ({ title, value, icon: Icon, delay, loading }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        className="flex flex-col p-6 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-3xl shadow-sm"
    >
        <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-sky-50 dark:bg-sky-500/10 text-sky-500 dark:text-sky-400 rounded-2xl">
                <Icon size={24} strokeWidth={2.5} />
            </div>
            <div className="px-3 py-1 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider rounded-full">
                Today
            </div>
        </div>
        <div>
            <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">
                {loading ? "..." : value}
            </h3>
            <p className="text-slate-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest">{title}</p>
        </div>
    </motion.div>
);

const AuthorityWaterDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [currentTime, setCurrentTime] = useState(new Date());

    const [stats, setStats] = useState({ new: 0, inProgress: 0, completed: 0, highUrgency: 0 });
    const [loading, setLoading] = useState(true);

    const [analytics, setAnalytics] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);

    // Clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = user?.token || localStorage.getItem("token") || (user && user.accessToken ? user.accessToken : null);
                const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

                const statsRes = await fetch("/api/v1/authority/water/stats", { headers: authHeader });
                const statsData = await statsRes.json();
                if (statsData.success) setStats(statsData.data);

                const analyticsRes = await fetch("/api/v1/authority/water/analytics", { headers: authHeader });
                const analyticsData = await analyticsRes.json();
                if (analyticsData.success) setAnalytics(analyticsData.data);
            } catch (err) {
                console.error("Error fetching water dashboard data:", err);
            } finally {
                setLoading(false);
                setAnalyticsLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    const weeklyData = analytics?.weeklyTrend || [];
    const categoryData = analytics?.categories || [];
    const sectorData = analytics?.sectors || [];

    return (
        <div className="space-y-6 pb-12">
            {/* HERO PANEL */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden rounded-3xl bg-white dark:bg-white/[0.02] p-8 border border-slate-200 dark:border-white/5 shadow-sm"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 dark:bg-sky-500/5 blur-3xl -mx-20 -my-20 rounded-full" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[10px] font-black uppercase tracking-widest border border-sky-200 dark:border-sky-500/20">
                                System Online
                            </span>
                            <span className="text-slate-500 dark:text-white/40 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                                <Layers size={14} /> Water Authority
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                            Command Center
                        </h1>
                        <p className="text-slate-500 dark:text-gray-400 font-medium text-sm max-w-lg">
                            Real-time infrastructure pulse, anomaly detection, and resolution analytics.
                        </p>
                    </div>

                    <div className="text-left md:text-right">
                        <p className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums">
                            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </p>
                        <p className="text-sky-600 dark:text-sky-400 font-bold text-xs uppercase tracking-widest mt-1">
                            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* METRICS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Critical Action Req" value={stats.highUrgency} icon={AlertTriangle} delay={0.1} loading={loading} />
                <StatCard title="New Incidents" value={stats.new} icon={AlertCircle} delay={0.2} loading={loading} />
                <StatCard title="In Resolution" value={stats.inProgress} icon={RefreshCw} delay={0.3} loading={loading} />
                <StatCard title="Resolved Today" value={stats.completed} icon={CheckCircle} delay={0.4} loading={loading} />
            </div>

            {/* ANALYTICS ROW 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* WEEKLY TREND */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-2 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-3xl p-6 lg:p-8 shadow-sm flex flex-col"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-500/10">
                            <BarChart3 size={18} className="text-sky-600 dark:text-sky-400" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">Weekly Complaint Trend</h3>
                            <p className="text-slate-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest">Reports over last 7 days</p>
                        </div>
                    </div>
                    <div className="h-72 w-full mt-auto">
                        {analyticsLoading ? (
                            <div className="w-full h-full flex justify-center items-center"><RefreshCw className="animate-spin text-sky-400" /></div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.15} vertical={false} />
                                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#e2e8f0', opacity: 0.4 }} />
                                    <Bar dataKey="count" fill="#0ea5e9" radius={[6, 6, 0, 0]} maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </motion.div>

                {/* SYSTEM PULSE */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white dark:bg-white/[0.02] rounded-3xl p-6 lg:p-8 border border-slate-200 dark:border-white/5 shadow-sm flex flex-col"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-500/10">
                            <Activity size={18} className="text-sky-600 dark:text-sky-400" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-0.5">System Pulse</h2>
                            <p className="text-slate-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest">7-Day Velocity</p>
                        </div>
                    </div>

                    <div className="flex-1 min-h-[200px] w-full flex items-end">
                        {analyticsLoading ? (
                            <div className="w-full h-full flex justify-center items-center">
                                <RefreshCw className="animate-spin text-sky-500" size={24} />
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={weeklyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorCountWater" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.15} vertical={false} />
                                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickMargin={15} />
                                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickMargin={10} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }} />
                                    <Area type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorCountWater)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* ANALYTICS ROW 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* COMPLAINTS BY SECTOR */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="lg:col-span-2 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-3xl p-6 lg:p-8 shadow-sm flex flex-col"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-500/10">
                            <Users size={18} className="text-sky-600 dark:text-sky-400" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">Complaints by Sector</h3>
                            <p className="text-slate-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest">Geographic Distribution</p>
                        </div>
                    </div>
                    <div className="h-64 w-full mt-auto">
                        {analyticsLoading ? (
                            <div className="w-full h-full flex justify-center items-center"><RefreshCw className="animate-spin text-sky-400" /></div>
                        ) : sectorData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={sectorData} margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.15} horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={100} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#e2e8f0', opacity: 0.4 }} />
                                    <Bar dataKey="count" fill="#0ea5e9" radius={[0, 6, 6, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="w-full h-full flex justify-center items-center"><span className="text-slate-400 text-sm">No Data</span></div>
                        )}
                    </div>
                </motion.div>

                {/* ISSUE TYPES */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-3xl p-6 lg:p-8 shadow-sm flex flex-col"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-500/10">
                            <PieChartIcon size={18} className="text-sky-600 dark:text-sky-400" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">Issue Types</h3>
                            <p className="text-slate-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest">Categorical Breakdown</p>
                        </div>
                    </div>
                    <div className="h-64 w-full mt-auto">
                        {analyticsLoading ? (
                            <div className="w-full h-full flex justify-center items-center"><RefreshCw className="animate-spin text-sky-400" /></div>
                        ) : categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={categoryData} cx="50%" cy="45%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#64748b', paddingTop: '10px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="w-full h-full flex justify-center items-center"><span className="text-slate-400 text-sm">No Data</span></div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AuthorityWaterDashboard;
