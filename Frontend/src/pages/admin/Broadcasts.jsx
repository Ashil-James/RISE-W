import React, { useState } from "react";
import {
  AlertTriangle,
  Send,
  MapPin,
  Radio,
  Search,
  Zap,
  CloudRain,
  CheckCircle,
  Info,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAlerts } from "../../context/AlertContext";
import { useUser } from "../../context/UserContext";
import ProximityMapPicker from "../../components/ProximityMapPicker";

const Broadcasts = () => {
  const { user } = useUser();
  const { alerts, refreshAlerts } = useAlerts();
  const [formData, setFormData] = useState({
    type: "Wildlife Alert",
    severity: "High",
    location: "",
    message: "",
  });

  const [isTargeted, setIsTargeted] = useState(false);
  const [targetCenter, setTargetCenter] = useState(null);
  const [targetRadiusKm, setTargetRadiusKm] = useState(1);

  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!user?.token) throw new Error("Authentication required");

      if (isTargeted && !targetCenter) {
        alert("Please drop a pin on the map to define the target area.");
        setLoading(false);
        return;
      }

      const payload = {
        ...formData,
        targetArea: isTargeted ? {
          center: targetCenter,
          radiusKm: targetRadiusKm
        } : null
      };

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      await axios.post("/api/v1/broadcasts", payload, config);

      setSent(true);
      if (refreshAlerts) refreshAlerts();

      setTimeout(() => {
        setSent(false);
        setFormData({ ...formData, location: "", message: "" });
        setTargetCenter(null);
        setIsTargeted(false);
      }, 3000);
    } catch (error) {
      console.error("Failed to send broadcast:", error);
      alert(error.response?.data?.message || error.message || "Failed to send broadcast");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* HEADER */}
      <div className="mb-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
            Broadcast Center
          </h1>
          <p className="text-gray-400 max-w-xl text-lg">
            Dispatch critical alerts to residents in real-time. Use with
            caution.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 text-sm font-bold animate-pulse">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          LIVE SYSTEM
        </div>
      </div>

      <div className="w-full">
        {/* COMPOSER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden"
        >
          {/* Decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            {/* Type & Severity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] ml-1">
                  Alert Category
                </label>
                <div className="relative group">
                  <select
                    className="w-full bg-black/40 border border-white/10 text-white rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none font-bold transition-all group-hover:border-emerald-500/30"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                  >
                    <option>Wildlife Alert</option>
                    <option>Road Blockage</option>
                    <option>Power Outage</option>
                    <option>Water Supply</option>
                    <option>Public Safety</option>
                  </select>
                  <div className="absolute right-5 top-4.5 pointer-events-none text-emerald-500">
                    <Radio
                      size={20}
                      className="drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] ml-1">
                  Severity Level
                </label>
                <div className="relative">
                  <select
                    className={`w-full bg-black/40 border border-white/10 text-white rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-${formData.severity === "High" ? "red" : formData.severity === "Medium" ? "orange" : "blue"}-500/50 appearance-none font-black tracking-wide`}
                    value={formData.severity}
                    onChange={(e) =>
                      setFormData({ ...formData, severity: e.target.value })
                    }
                  >
                    <option value="High">🔴 Critical</option>
                    <option value="Medium">🟠 Moderate</option>
                    <option value="Low">🔵 Info</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-3">
              <label className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] ml-1">
                Target Sector / Location
              </label>
              <div className="relative group">
                <MapPin
                  className="absolute left-5 top-4.5 text-gray-500 group-focus-within:text-emerald-500 transition-colors"
                  size={20}
                />
                <input
                  type="text"
                  required
                  className="w-full bg-black/40 border border-white/10 text-white rounded-2xl pl-14 pr-6 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 placeholder-gray-600 transition-all font-bold group-hover:border-white/20"
                  placeholder="e.g. Sector B, Main Market Area"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Targeted vs Global Toggle */}
            <div className="space-y-3">
              <label className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] ml-1">
                Distribution Scope
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setIsTargeted(false)}
                  className={`py-4 rounded-xl font-bold transition-all border ${!isTargeted ? 'bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-black/40 text-gray-400 border-white/5 hover:bg-white/5'}`}
                >
                  Global Broadcast
                </button>
                <button
                  type="button"
                  onClick={() => setIsTargeted(true)}
                  className={`py-4 rounded-xl font-bold transition-all border ${isTargeted ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-black/40 text-gray-400 border-white/5 hover:bg-white/5'}`}
                >
                  Proximity Targeted
                </button>
              </div>
            </div>

            {/* Proximity Map Viewer */}
            {isTargeted && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-2">
                <ProximityMapPicker
                  center={targetCenter}
                  setCenter={setTargetCenter}
                  radiusKm={targetRadiusKm}
                  setRadiusKm={setTargetRadiusKm}
                />
              </motion.div>
            )}

            {/* Message */}
            <div className="space-y-3">
              <label className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] ml-1">
                Alert Message
              </label>
              <textarea
                required
                rows="6"
                className="w-full bg-black/40 border border-white/10 text-white rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 placeholder-gray-600 transition-all resize-none font-bold leading-relaxed group-hover:border-white/20"
                placeholder="Describe the incident details clearly..."
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
              />
            </div>

            {/* Actions */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black py-5 rounded-2xl shadow-2xl shadow-red-600/30 flex items-center justify-center gap-4 transition-all transform hover:-translate-y-1 active:scale-95 tracking-widest uppercase text-sm disabled:opacity-50"
              >
                <Send
                  size={22}
                  className="drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                />
                {loading ? "Dispatching..." : "Dispatch Broadcast"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* SUCCESS MODAL */}
      <AnimatePresence>
        {sent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="bg-neutral-900 border border-emerald-500/30 p-10 rounded-[3rem] text-center max-w-sm w-full shadow-[0_0_80px_-10px_rgba(16,185,129,0.4)]"
            >
              <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <CheckCircle size={48} />
              </div>
              <h2 className="text-3xl font-black text-white mb-3 tracking-tight">
                Broadcast Sent!
              </h2>
              <p className="text-gray-400 mb-8 font-medium">
                The alert has been dispatched to all residents in the target
                sector.
              </p>
              <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3 }}
                  className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,1)]"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HISTORY TABLE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-12 bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl"
      >
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <Radio size={20} className="text-emerald-500" />
            Sent Broadcast History
          </h2>
          <div className="relative group">
            <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search history..."
              className="bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-gray-500">
              <tr>
                <th className="px-8 py-4">Title</th>
                <th className="px-8 py-4">Category</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Target</th>
                <th className="px-8 py-4 text-right">Sent Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <tr key={alert.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {alert.title}
                      </p>
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5 max-w-xs truncate">
                        {alert.message}
                      </p>
                    </td>
                    <td className="px-8 py-5 text-sm text-gray-400 font-medium">
                      {alert.category}
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md tracking-wider ${alert.type === 'critical' ? 'bg-red-500/10 text-red-500' :
                        alert.type === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-blue-500/10 text-blue-500'
                        }`}>
                        {alert.type === 'critical' ? 'High' : alert.type === 'warning' ? 'Medium' : 'Low'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-xs text-gray-400 font-bold">
                      <MapPin size={12} className="inline mr-1" /> {alert.location}
                    </td>
                    <td className="px-8 py-5 text-right text-xs font-mono text-gray-500 uppercase tracking-tighter">
                      {new Date(alert.time).toLocaleDateString()} at {new Date(alert.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-8 py-12 text-center text-gray-600 italic">
                    No broadcast history found.
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

export default Broadcasts;
