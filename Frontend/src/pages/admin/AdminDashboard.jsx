import React, { useState, useEffect, useRef } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Users,
  Search,
  ArrowUpRight,
  Clock,
  MapPin,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "../../context/UserContext";

// --- ANIMATED COUNTER HOOK ---
const useAnimatedCounter = (target, duration = 1800) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView || target === 0) return;
    const startTime = performance.now();
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration, isInView]);

  return { count, ref };
};

// --- SHIMMER SKELETON ---
const ShimmerSkeleton = () => (
  <div className="space-y-8 pb-10">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <div className="h-10 w-64 rounded-2xl mb-3 bg-gradient-to-r from-white/[0.03] via-white/[0.06] to-white/[0.03] animate-pulse"></div>
        <div className="h-4 w-48 rounded-lg bg-gradient-to-r from-white/[0.03] via-white/[0.06] to-white/[0.03] animate-pulse"></div>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-[2rem] p-6 h-40 animate-pulse" style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
          border: "1px solid rgba(255,255,255,0.03)",
        }}></div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 rounded-[2.5rem] p-8 h-72 animate-pulse" style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
        border: "1px solid rgba(255,255,255,0.03)",
      }}></div>
      <div className="rounded-3xl p-6 h-72 animate-pulse" style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
        border: "1px solid rgba(255,255,255,0.03)",
      }}></div>
    </div>
  </div>
);

// --- LIQUID GLASS CARD WRAPPER ---
const GlassCard = ({ children, className = "", ...props }) => (
  <motion.div
    className={`relative overflow-hidden ${className}`}
    style={{
      background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
      backdropFilter: "blur(20px) saturate(1.5)",
      WebkitBackdropFilter: "blur(20px) saturate(1.5)",
      border: "1px solid rgba(255,255,255,0.06)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
    }}
    {...props}
  >
    <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
    {children}
  </motion.div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, users: 0 });
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const config = { headers: { Authorization: `Bearer ${user?.token}` } };
        const [statsRes, incidentsRes] = await Promise.all([
          axios.get("/api/v1/admin/stats", config),
          axios.get("/api/v1/admin/incident", config),
        ]);

        if (statsRes.data.success) {
          const s = statsRes.data.data;
          setStats({ total: s.totalIncidents, pending: s.openIncidents, resolved: s.resolvedIncidents, users: s.totalUsers });
        }

        if (incidentsRes.data.success) {
          const allIncidents = incidentsRes.data.data.map((inc) => ({
            id: inc.reportId || `#${inc._id.substring(0, 8)}`,
            type: inc.title,
            reporter: inc.reportedBy?.name || "Anonymous",
            loc: inc.address || "Unknown Location",
            date: new Date(inc.createdAt).toLocaleDateString(),
            status: inc.status.charAt(0).toUpperCase() + inc.status.slice(1).toLowerCase(),
            priority: inc.priority || "Medium",
          }));
          setReports(allIncidents.slice(0, 5));
        }
      } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchDashboardData();
  }, [user?.token]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0, scale: 0.95 },
    visible: { y: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } },
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.08, type: "spring", stiffness: 120, damping: 14 } }),
  };

  if (loading) return <ShimmerSkeleton />;

  const resolutionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;
  const pendingRate = stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0;

  return (
    <motion.div className="space-y-8 pb-10" variants={containerVariants} initial="hidden" animate="visible">
      {/* --- HEADER --- */}
      <motion.div className="flex flex-col md:flex-row md:items-end justify-between gap-4" variants={itemVariants}>
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight flex items-center gap-3">
            Admin Dashboard
            <Sparkles size={28} className="text-emerald-400" />
          </h1>
          <p className="text-gray-400 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" style={{ boxShadow: "0 0 8px rgba(16,185,129,0.6)" }}></span>
            </span>
            System Operational • {new Date().toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/admin/broadcasts")}
            className="px-5 py-2.5 text-white rounded-xl font-medium transition-all flex items-center gap-2"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <AlertTriangle size={18} /> Broadcast Alert
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -2, boxShadow: "0 20px 50px -15px rgba(16,185,129,0.5)" }}
            whileTap={{ scale: 0.97 }}
            className="px-5 py-2.5 text-white rounded-xl font-bold transition-all flex items-center gap-2"
            style={{
              background: "linear-gradient(135deg, #10b981, #06b6d4)",
              boxShadow: "0 8px 30px -5px rgba(16,185,129,0.4)",
            }}
          >
            <ArrowUpRight size={18} /> Generate Report
          </motion.button>
        </div>
      </motion.div>

      {/* --- STATS GRID --- */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" variants={itemVariants}>
        <StatsCard title="Total Reports" value={stats.total} trend="+12%" icon={Activity} color="blue" />
        <StatsCard title="Pending Review" value={stats.pending} trend="+4" icon={Clock} color="amber" isAlert />
        <StatsCard title="Resolved" value={stats.resolved} trend="+8%" icon={CheckCircle} color="emerald" />
        <StatsCard title="Active Users" value={stats.users} trend="+24" icon={Users} color="purple" />
      </motion.div>

      {/* --- MAIN CONTENT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: INCIDENT TABLE */}
        <GlassCard className="lg:col-span-2 rounded-[2.5rem]" variants={itemVariants}>
          <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-xl font-black text-white flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative rounded-full h-3 w-3 bg-emerald-500" style={{ boxShadow: "0 0 12px rgba(16,185,129,1)" }}></span>
              </span>
              Live Incident Feed
            </h3>
            <div className="relative group">
              <Search className="absolute left-3 top-2.5 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={16} />
              <input
                type="text"
                placeholder="Search ID or Type..."
                className="border text-white text-sm rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 w-48 hover:w-56 focus:w-64 transition-all duration-300"
                style={{
                  background: "rgba(0,0,0,0.3)",
                  borderColor: "rgba(255,255,255,0.08)",
                  backdropFilter: "blur(10px)",
                }}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Issue Details</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                <AnimatePresence>
                  {reports.length > 0 ? (
                    reports.map((report, index) => (
                      <motion.tr
                        key={report.id}
                        custom={index}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        className="group cursor-pointer transition-all duration-300"
                        style={{ background: "transparent" }}
                        whileHover={{ backgroundColor: "rgba(16,185,129,0.03)" }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-white font-bold text-sm group-hover:text-emerald-300 transition-colors">{report.type}</span>
                            <span className="text-xs text-gray-500 font-mono">{report.reporter} • {report.date} • {report.id}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-300 text-sm">
                            <MapPin size={14} className="text-gray-500 group-hover:text-emerald-500 transition-colors" />
                            <span className="max-w-[180px] truncate">{report.loc}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4"><StatusBadge status={report.status} /></td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 rounded-lg text-gray-400 hover:text-white transition-all" style={{ background: "rgba(255,255,255,0.03)" }}>
                            <ArrowUpRight size={16} />
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-500 italic">No incidents found.</td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-white/[0.03] text-center">
            <button className="text-sm text-gray-400 hover:text-emerald-400 font-medium transition-all duration-300 hover:tracking-wider">
              View All Activity →
            </button>
          </div>
        </GlassCard>

        {/* RIGHT SIDEBAR */}
        <motion.div className="space-y-6" variants={itemVariants}>
          {/* Active Alerts */}
          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.3 } }}
            className="rounded-3xl p-6 relative overflow-hidden group transition-all duration-500"
            style={{
              background: "linear-gradient(135deg, rgba(153,27,27,0.2), rgba(10,15,25,0.6))",
              backdropFilter: "blur(20px) saturate(1.5)",
              border: "1px solid rgba(239,68,68,0.15)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)",
            }}
          >
            <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent"></div>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-25 transition-opacity duration-700">
              <AlertTriangle size={100} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Active Alerts</h3>
            <p className="text-red-400 text-sm mb-6">System Broadcasts</p>

            <div className="rounded-xl p-3 border-l-4 border-red-500 flex justify-between items-center cursor-pointer transition-all hover:bg-white/[0.02]" style={{
              background: "rgba(0,0,0,0.3)",
              backdropFilter: "blur(10px)",
            }}>
              <div>
                <h4 className="text-white font-bold text-sm">Emergency Protocols</h4>
                <p className="text-xs text-gray-400">Manage all system wide alerts</p>
              </div>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/admin/broadcasts")}
              className="w-full mt-6 text-red-400 py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:text-white"
              style={{
                background: "linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.05))",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              Manage Broadcasts
            </motion.button>
          </motion.div>

          {/* Efficiency */}
          <GlassCard className="rounded-3xl p-6" whileHover={{ y: -4, transition: { duration: 0.3 } }}>
            <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <TrendingUp size={18} className="text-cyan-400" />
              Efficiency
            </h3>
            <div className="space-y-5">
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Resolution Rate</span>
                  <span className="text-white font-bold tabular-nums">{resolutionRate}%</span>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${resolutionRate}%` }}
                    transition={{ duration: 1.8, ease: "easeOut", delay: 0.5 }}
                    className="h-full rounded-full"
                    style={{
                      background: "linear-gradient(90deg, #10b981, #06b6d4)",
                      boxShadow: "0 0 15px rgba(16,185,129,0.4)",
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Pending Rate</span>
                  <span className="text-white font-bold tabular-nums">{pendingRate}%</span>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pendingRate}%` }}
                    transition={{ duration: 1.8, ease: "easeOut", delay: 0.7 }}
                    className="h-full rounded-full"
                    style={{
                      background: "linear-gradient(90deg, #f59e0b, #f97316)",
                      boxShadow: "0 0 15px rgba(245,158,11,0.4)",
                    }}
                  />
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
};

// --- STATS CARD ---
const StatsCard = ({ title, value, trend, icon: Icon, color, isAlert }) => {
  const { count, ref } = useAnimatedCounter(value);

  const gradients = {
    blue: { bg: "linear-gradient(135deg, #3b82f6, #06b6d4)", glow: "rgba(59,130,246,0.4)", accent: "rgba(59,130,246,0.08)" },
    amber: { bg: "linear-gradient(135deg, #f59e0b, #f97316)", glow: "rgba(245,158,11,0.4)", accent: "rgba(245,158,11,0.08)" },
    emerald: { bg: "linear-gradient(135deg, #10b981, #06b6d4)", glow: "rgba(16,185,129,0.4)", accent: "rgba(16,185,129,0.08)" },
    purple: { bg: "linear-gradient(135deg, #8b5cf6, #6366f1)", glow: "rgba(139,92,246,0.4)", accent: "rgba(139,92,246,0.08)" },
  };
  const g = gradients[color] || gradients.blue;

  return (
    <motion.div
      ref={ref}
      whileHover={{ y: -8, transition: { type: "spring", stiffness: 300 } }}
      className="relative overflow-hidden rounded-[2rem] p-6 cursor-default group"
      style={{
        background: `linear-gradient(135deg, rgba(255,255,255,0.03), ${g.accent})`,
        backdropFilter: "blur(20px) saturate(1.5)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      <div
        className="absolute -right-6 -top-6 w-36 h-36 rounded-full opacity-0 blur-3xl group-hover:opacity-30 transition-opacity duration-700"
        style={{ background: g.bg }}
      ></div>
      <div
        className="absolute -left-6 -bottom-6 w-24 h-24 rounded-full opacity-0 blur-2xl group-hover:opacity-15 transition-opacity duration-700"
        style={{ background: g.bg }}
      ></div>

      <div className="flex justify-between items-start mb-5 relative z-10">
        <div
          className="p-3.5 rounded-2xl shadow-2xl group-hover:scale-110 transition-transform duration-500"
          style={{
            background: g.bg,
            boxShadow: `0 8px 25px -5px ${g.glow}`,
          }}
        >
          <Icon size={22} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
        </div>
        {trend && (
          <span
            className={`text-xs font-black px-2.5 py-1 rounded-full backdrop-blur-sm ${isAlert ? "text-red-400" : "text-emerald-400"}`}
            style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            {trend}
          </span>
        )}
      </div>

      <div className="relative z-10">
        <h3 className="text-3xl font-black text-white mb-1 tabular-nums tracking-tight">{count}</h3>
        <p className="text-gray-400 text-sm font-medium">{title}</p>
      </div>
    </motion.div>
  );
};

// --- STATUS BADGE ---
const StatusBadge = ({ status }) => {
  const styles = {
    Pending: { bg: "rgba(245,158,11,0.08)", color: "#f59e0b", border: "rgba(245,158,11,0.15)" },
    "In progress": { bg: "rgba(59,130,246,0.08)", color: "#3b82f6", border: "rgba(59,130,246,0.15)" },
    Resolved: { bg: "rgba(16,185,129,0.08)", color: "#10b981", border: "rgba(16,185,129,0.15)" },
    Open: { bg: "rgba(239,68,68,0.08)", color: "#ef4444", border: "rgba(239,68,68,0.15)" },
  };
  const s = styles[status] || { bg: "rgba(107,114,128,0.08)", color: "#6b7280", border: "rgba(107,114,128,0.15)" };

  return (
    <span
      className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 w-fit"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${status === "Open" ? "animate-pulse" : ""}`} style={{ background: s.color }}></span>
      {status}
    </span>
  );
};

export default AdminDashboard;
