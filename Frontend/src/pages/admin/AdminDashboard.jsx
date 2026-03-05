import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "../../context/UserContext";

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
          // Take only the first 5 for the dashboard feed
          const allIncidents = incidentsRes.data.data.map(inc => ({
            id: inc.reportId || `#${inc._id.substring(0, 8)}`,
            type: inc.type,
            loc: inc.location?.address || "Unknown Location",
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

    if (user?.token) {
      fetchDashboardData();
    }
  }, [user?.token]);

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-gray-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            System Operational • {new Date().toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/admin/broadcasts')}
            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-medium transition-all flex items-center gap-2"
          >
            <AlertTriangle size={18} /> Broadcast Alert
          </button>
          <button className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2">
            <ArrowUpRight size={18} /> Generate Report
          </button>
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
          className="lg:col-span-2 bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl"
          variants={itemVariants}
        >
          <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-xl font-black text-white flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]"></div>
              Live Incident Feed
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
              <input 
                type="text" 
                placeholder="Search ID or Type..." 
                className="bg-black/40 border border-white/10 text-white text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-emerald-500 w-48 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Issue Details</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {reports.length > 0 ? (
                  reports.map((report) => (
                    <tr
                      key={report.id}
                      className="hover:bg-white/5 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-white font-bold text-sm">{report.type}</span>
                          <span className="text-xs text-gray-500 font-mono">{report.id} • {report.date}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-300 text-sm">
                          <MapPin size={14} className="text-gray-500" />
                          {report.loc}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={report.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 bg-white/5 hover:bg-emerald-500 hover:text-white text-gray-400 rounded-lg transition-all">
                          <ArrowUpRight size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500 italic">
                      No incidents found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-white/5 text-center">
            <button className="text-sm text-gray-400 hover:text-white font-medium transition-colors">
              View All Activity
            </button>
          </div>
        </motion.div>

        {/* RIGHT: QUICK ALERTS & INSIGHTS */}
        <motion.div className="space-y-6" variants={itemVariants}>
          
          {/* Active Alerts Card */}
          <div className="bg-gradient-to-br from-red-900/40 to-neutral-900/80 backdrop-blur-xl border border-red-500/20 rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
              <AlertTriangle size={100} className="text-red-500 rotate-12" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Active Alerts</h3>
            <p className="text-red-400 text-sm mb-6">System Broadcasts</p>
            
            <div className="space-y-3">
              <div className="bg-black/40 rounded-xl p-3 border-l-4 border-red-500 flex justify-between items-center">
                <div>
                  <h4 className="text-white font-bold text-sm">Emergency Protocols</h4>
                  <p className="text-xs text-gray-400">Manage all system wide alerts</p>
                </div>
                <div className="h-2 w-2 rounded-full bg-red-500 animate-ping"></div>
              </div>
            </div>

            <button 
               onClick={() => navigate('/admin/broadcasts')}
               className="w-full mt-6 bg-red-600/20 border border-red-500/30 hover:bg-red-600 hover:text-white text-red-400 py-3 rounded-xl font-bold text-sm transition-all"
            >
              Manage Broadcasts
            </button>
          </div>

          {/* Quick Stats / Mini Chart Placeholder */}
          <div className="bg-neutral-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-400" />
              Efficiency
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Resolution Rate</span>
                  <span className="text-white font-bold">
                    {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${stats.total > 0 ? (stats.resolved / stats.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Pending Rate</span>
                  <span className="text-white font-bold">
                    {stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}%
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

        </motion.div>
      </div>
    </motion.div>
  );
};

// --- HELPER COMPONENTS ---

const StatsCard = ({ title, value, trend, icon: Icon, color, isAlert }) => {
  const colors = {
    blue: "from-blue-600 to-cyan-500 text-blue-100 shadow-blue-500/20",
    amber: "from-amber-500 to-orange-500 text-amber-100 shadow-amber-500/20",
    emerald: "from-emerald-500 to-cyan-500 text-emerald-100 shadow-emerald-500/20",
    purple: "from-purple-600 to-violet-500 text-purple-100 shadow-purple-500/20",
  };

  const bgStyles = colors[color] || colors.blue;

  return (
    <div className={`relative overflow-hidden rounded-[2rem] p-6 bg-neutral-900/40 border border-white/5 hover:border-emerald-500/30 transition-all duration-500 group`}>
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full bg-gradient-to-br ${bgStyles} opacity-5 blur-2xl group-hover:opacity-20 transition-opacity`}></div>
      
      <div className="flex justify-between items-start mb-5">
        <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${bgStyles} shadow-2xl group-hover:scale-110 transition-transform duration-500`}>
          <Icon size={22} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
        </div>
        {trend && (
          <span className={`text-xs font-black px-2.5 py-1 rounded-full bg-black/40 border border-white/5 ${isAlert ? 'text-red-400' : 'text-emerald-400'}`}>
            {trend}
          </span>
        )}
      </div>
      
      <div>
        <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
        <p className="text-gray-400 text-sm font-medium">{title}</p>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    Pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    "In Progress": "bg-blue-500/10 text-blue-500 border-blue-500/20",
    Resolved: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || "bg-gray-800 text-gray-400"} flex items-center gap-1.5 w-fit`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'Pending' ? 'bg-amber-500' : status === 'Resolved' ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
      {status}
    </span>
  );
};

export default AdminDashboard;