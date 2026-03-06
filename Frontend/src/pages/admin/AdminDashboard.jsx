import React, { useState, useEffect, useRef } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Eye,
  Users,
  Search,
  Filter,
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
const useAnimatedCounter = (target, duration = 1500) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView || target === 0) return;

    let start = 0;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);

      setCount(current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration, isInView]);

  return { count, ref };
};

// --- SHIMMER SKELETON ---
const ShimmerSkeleton = () => (
  <div className="space-y-8 pb-10 animate-pulse">
    {/* Header Skeleton */}
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <div className="h-10 w-64 bg-white/5 rounded-2xl mb-3"></div>
        <div className="h-4 w-48 bg-white/5 rounded-lg"></div>
      </div>
      <div className="flex gap-3">
        <div className="h-10 w-40 bg-white/5 rounded-xl"></div>
        <div className="h-10 w-40 bg-white/5 rounded-xl"></div>
      </div>
    </div>

    {/* Stats Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-[2rem] p-6 bg-neutral-900/40 border border-white/5 h-36">
          <div className="flex justify-between mb-5">
            <div className="w-12 h-12 rounded-2xl bg-white/5"></div>
            <div className="h-6 w-12 rounded-full bg-white/5"></div>
          </div>
          <div className="h-8 w-16 bg-white/5 rounded-lg mb-2"></div>
          <div className="h-4 w-24 bg-white/5 rounded-lg"></div>
        </div>
      ))}
    </div>

    {/* Table Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-neutral-900/40 border border-white/5 rounded-[2.5rem] p-8">
        <div className="h-6 w-48 bg-white/5 rounded-lg mb-8"></div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-4 mb-6">
            <div className="h-4 w-1/3 bg-white/5 rounded-lg"></div>
            <div className="h-4 w-1/4 bg-white/5 rounded-lg"></div>
            <div className="h-4 w-1/6 bg-white/5 rounded-lg"></div>
          </div>
        ))}
      </div>
      <div className="bg-neutral-900/40 border border-white/5 rounded-3xl p-6 h-64"></div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);

  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    users: 0,
  });

  // Reports state
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        };

        // Fetch Stats and Incidents in parallel
        const [statsRes, incidentsRes] = await Promise.all([
          axios.get("/api/v1/admin/stats", config),
          axios.get("/api/v1/admin/incident", config),
        ]);

        if (statsRes.data.success) {
          const s = statsRes.data.data;
          setStats({
            total: s.totalIncidents,
            pending: s.openIncidents,
            resolved: s.resolvedIncidents,
            users: s.totalUsers,
          });
        }

        if (incidentsRes.data.success) {
          const allIncidents = incidentsRes.data.data.map((inc) => ({
            id: inc.reportId || `#${inc._id.substring(0, 8)}`,
            type: inc.title,
            reporter: inc.reportedBy?.name || "Anonymous",
            loc: inc.address || "Unknown Location",
            date: new Date(inc.createdAt).toLocaleDateString(),
            status:
              inc.status.charAt(0).toUpperCase() +
              inc.status.slice(1).toLowerCase(),
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

    if (user?.token) {
      fetchDashboardData();
    }
  }, [user?.token]);

  // Animation Variants
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
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.08, type: "spring", stiffness: 120, damping: 14 },
    }),
  };

  if (loading) {
    return <ShimmerSkeleton />;
  }

  const resolutionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;
  const pendingRate = stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0;

  return (
    <motion.div
      className="space-y-8 pb-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* --- HEADER --- */}
      <motion.div
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight flex items-center gap-3">
            Admin Dashboard
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles size={28} className="text-emerald-400" />
            </motion.div>
          </h1>
          <p className="text-gray-400 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            System Operational • {new Date().toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/admin/broadcasts")}
            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 rounded-xl font-medium transition-all flex items-center gap-2 backdrop-blur-sm"
          >
            <AlertTriangle size={18} /> Broadcast Alert
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -2, boxShadow: "0 20px 40px -15px rgba(16,185,129,0.4)" }}
            whileTap={{ scale: 0.97 }}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
          >
            <ArrowUpRight size={18} /> Generate Report
          </motion.button>
        </div>
      </motion.div>

      {/* --- STATS GRID --- */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={itemVariants}
      >
        <StatsCard
          title="Total Reports"
          value={stats.total}
          trend="+12%"
          icon={Activity}
          color="blue"
        />
        <StatsCard
          title="Pending Review"
          value={stats.pending}
          trend="+4"
          icon={Clock}
          color="amber"
          isAlert
        />
        <StatsCard
          title="Resolved"
          value={stats.resolved}
          trend="+8%"
          icon={CheckCircle}
          color="emerald"
        />
        <StatsCard
          title="Active Users"
          value={stats.users}
          trend="+24"
          icon={Users}
          color="purple"
        />
      </motion.div>

      {/* --- MAIN CONTENT SPLIT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: RECENT ACTIVITY TABLE */}
        <motion.div
          className="lg:col-span-2 bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl hover:border-white/10 transition-all duration-500"
          variants={itemVariants}
        >
          <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-xl font-black text-white flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,1)]"></span>
              </span>
              Live Incident Feed
            </h3>
            <div className="relative group">
              <Search
                className="absolute left-3 top-2.5 text-gray-500 group-focus-within:text-emerald-500 transition-colors"
                size={16}
              />
              <input
                type="text"
                placeholder="Search ID or Type..."
                className="bg-black/40 border border-white/10 text-white text-sm rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 w-48 hover:w-56 focus:w-64 transition-all duration-300"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/[0.03]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Issue Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence>
                  {reports.length > 0 ? (
                    reports.map((report, index) => (
                      <motion.tr
                        key={report.id}
                        custom={index}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        className="hover:bg-emerald-500/[0.03] transition-all duration-300 group cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-white font-bold text-sm group-hover:text-emerald-300 transition-colors">
                              {report.type}
                            </span>
                            <span className="text-xs text-gray-500 font-mono">
                              {report.reporter} • {report.date} • {report.id}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-300 text-sm">
                            <MapPin size={14} className="text-gray-500 group-hover:text-emerald-500 transition-colors" />
                            <span className="max-w-[180px] truncate">{report.loc}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={report.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <motion.button
                            whileHover={{ scale: 1.15, rotate: 45 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 bg-white/5 hover:bg-emerald-500 hover:text-white hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] text-gray-400 rounded-lg transition-all"
                          >
                            <ArrowUpRight size={16} />
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-6 py-12 text-center text-gray-500 italic"
                      >
                        No incidents found.
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-white/5 text-center">
            <motion.button
              whileHover={{ letterSpacing: "0.1em" }}
              className="text-sm text-gray-400 hover:text-emerald-400 font-medium transition-all duration-300"
            >
              View All Activity →
            </motion.button>
          </div>
        </motion.div>

        {/* RIGHT: QUICK ALERTS & INSIGHTS */}
        <motion.div className="space-y-6" variants={itemVariants}>
          {/* Active Alerts Card */}
          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.3 } }}
            className="bg-gradient-to-br from-red-900/40 to-neutral-900/80 backdrop-blur-xl border border-red-500/20 hover:border-red-500/40 rounded-3xl p-6 relative overflow-hidden group transition-all duration-500"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 group-hover:rotate-6 transition-all duration-700">
              <AlertTriangle size={100} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Active Alerts</h3>
            <p className="text-red-400 text-sm mb-6">System Broadcasts</p>

            <div className="space-y-3">
              <motion.div
                whileHover={{ x: 4 }}
                className="bg-black/40 rounded-xl p-3 border-l-4 border-red-500 flex justify-between items-center cursor-pointer hover:bg-black/60 transition-all"
              >
                <div>
                  <h4 className="text-white font-bold text-sm">
                    Emergency Protocols
                  </h4>
                  <p className="text-xs text-gray-400">
                    Manage all system wide alerts
                  </p>
                </div>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
              </motion.div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/admin/broadcasts")}
              className="w-full mt-6 bg-red-600/20 border border-red-500/30 hover:bg-red-600 hover:text-white hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] text-red-400 py-3 rounded-xl font-bold text-sm transition-all duration-300"
            >
              Manage Broadcasts
            </motion.button>
          </motion.div>

          {/* Efficiency Card */}
          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.3 } }}
            className="bg-neutral-900/50 backdrop-blur-xl border border-white/5 hover:border-white/10 rounded-3xl p-6 transition-all duration-500"
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-400" />
              Efficiency
            </h3>
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Resolution Rate</span>
                  <span className="text-white font-bold">{resolutionRate}%</span>
                </div>
                <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${resolutionRate}%` }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Pending Rate</span>
                  <span className="text-white font-bold">{pendingRate}%</span>
                </div>
                <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pendingRate}%` }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.7 }}
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// --- HELPER COMPONENTS ---

const StatsCard = ({ title, value, trend, icon: Icon, color, isAlert }) => {
  const { count, ref } = useAnimatedCounter(value);

  const colors = {
    blue: {
      gradient: "from-blue-600 to-cyan-500",
      text: "text-blue-100",
      shadow: "shadow-blue-500/20",
      glow: "group-hover:shadow-[0_0_40px_-5px_rgba(59,130,246,0.4)]",
      border: "hover:border-blue-500/30",
    },
    amber: {
      gradient: "from-amber-500 to-orange-500",
      text: "text-amber-100",
      shadow: "shadow-amber-500/20",
      glow: "group-hover:shadow-[0_0_40px_-5px_rgba(245,158,11,0.4)]",
      border: "hover:border-amber-500/30",
    },
    emerald: {
      gradient: "from-emerald-500 to-cyan-500",
      text: "text-emerald-100",
      shadow: "shadow-emerald-500/20",
      glow: "group-hover:shadow-[0_0_40px_-5px_rgba(16,185,129,0.4)]",
      border: "hover:border-emerald-500/30",
    },
    purple: {
      gradient: "from-purple-600 to-violet-500",
      text: "text-purple-100",
      shadow: "shadow-purple-500/20",
      glow: "group-hover:shadow-[0_0_40px_-5px_rgba(139,92,246,0.4)]",
      border: "hover:border-purple-500/30",
    },
  };

  const c = colors[color] || colors.blue;

  return (
    <motion.div
      ref={ref}
      whileHover={{ y: -6, transition: { type: "spring", stiffness: 300 } }}
      className={`relative overflow-hidden rounded-[2rem] p-6 bg-neutral-900/40 backdrop-blur-sm border border-white/5 ${c.border} ${c.glow} transition-all duration-500 group cursor-default`}
    >
      {/* Hover glow background */}
      <div
        className={`absolute -right-4 -top-4 w-32 h-32 rounded-full bg-gradient-to-br ${c.gradient} opacity-0 blur-3xl group-hover:opacity-20 transition-opacity duration-700`}
      ></div>
      <div
        className={`absolute -left-4 -bottom-4 w-24 h-24 rounded-full bg-gradient-to-br ${c.gradient} opacity-0 blur-2xl group-hover:opacity-10 transition-opacity duration-700`}
      ></div>

      <div className="flex justify-between items-start mb-5 relative z-10">
        <motion.div
          whileHover={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.5 }}
          className={`p-3.5 rounded-2xl bg-gradient-to-br ${c.gradient} ${c.shadow} shadow-2xl group-hover:scale-110 transition-transform duration-500`}
        >
          <Icon
            size={22}
            className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
          />
        </motion.div>
        {trend && (
          <span
            className={`text-xs font-black px-2.5 py-1 rounded-full bg-black/40 border border-white/5 backdrop-blur-sm ${isAlert ? "text-red-400" : "text-emerald-400"}`}
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

const StatusBadge = ({ status }) => {
  const styles = {
    Pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    "In progress": "bg-blue-500/10 text-blue-500 border-blue-500/20",
    Resolved: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    Open: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  const dotColors = {
    Pending: "bg-amber-500",
    "In progress": "bg-blue-500",
    Resolved: "bg-emerald-500",
    Open: "bg-red-500 animate-pulse",
  };

  return (
    <span
      className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${styles[status] || "bg-gray-800 text-gray-400 border-gray-700"} flex items-center gap-1.5 w-fit`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${dotColors[status] || "bg-gray-500"}`}
      ></span>
      {status}
    </span>
  );
};

export default AdminDashboard;
