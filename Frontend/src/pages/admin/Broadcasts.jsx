import React, { useState } from "react";
import {
  AlertTriangle,
  Send,
  MapPin,
  Radio,
  CheckCircle,
  Info,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAlerts } from "../../context/AlertContext";

const Broadcasts = () => {
  const { refreshAlerts } = useAlerts();
  const [formData, setFormData] = useState({
    type: "Wildlife Alert",
    severity: "High",
    location: "",
    message: "",
  });

  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      await axios.post("/api/v1/broadcasts", formData, config);

      setSent(true);
      if (refreshAlerts) refreshAlerts();

      setTimeout(() => {
        setSent(false);
        setFormData({ ...formData, location: "", message: "" });
      }, 3000);
    } catch (error) {
      console.error("Failed to send broadcast:", error);
      alert(error.response?.data?.message || "Failed to send broadcast");
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
    </div>
  );
};

export default Broadcasts;
