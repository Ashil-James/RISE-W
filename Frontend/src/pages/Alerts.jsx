import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, CloudRain, Zap, Info, Plus } from "lucide-react";
import { useAlerts } from "../context/AlertContext";
import { motion, AnimatePresence } from "framer-motion";

const getIconComponent = (iconName) => {
  const icons = { AlertTriangle, Zap, CloudRain, Info };
  return icons[iconName] || Info;
};

const Alerts = () => {
  const navigate = useNavigate();
  const { alerts } = useAlerts();

  const getAccent = (type) => {
    switch (type) {
      case "critical": return { border: "#ef4444", bg: "rgba(239,68,68,0.06)", glow: "rgba(239,68,68,0.15)", text: "text-red-500", icon: "text-red-500" };
      case "warning": return { border: "#f59e0b", bg: "rgba(245,158,11,0.06)", glow: "rgba(245,158,11,0.12)", text: "text-yellow-500", icon: "text-yellow-500" };
      case "info": return { border: "#3b82f6", bg: "rgba(59,130,246,0.06)", glow: "rgba(59,130,246,0.12)", text: "text-blue-500", icon: "text-blue-500" };
      default: return { border: "#6b7280", bg: "rgba(107,114,128,0.06)", glow: "rgba(107,114,128,0.1)", text: "text-gray-500", icon: "text-gray-500" };
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    const h = Math.floor(diff / 60);
    if (h < 24) return `${h}h ago`;
    return date.toLocaleDateString();
  };

  const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };
  const fadeUp = { hidden: { y: 24, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 18 } } };

  return (
    <motion.div className="w-full max-w-2xl mx-auto relative pb-24" variants={stagger} initial="hidden" animate="visible">

      {/* Header */}
      <motion.div className="flex items-center justify-between mb-8" variants={fadeUp}>
        <div className="flex items-center gap-4">
          <motion.button
            onClick={() => navigate(-1)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2.5 -ml-2 rounded-xl glass-card text-wayanad-muted hover:text-wayanad-text transition-colors"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <div>
            <h1 className="text-2xl font-bold text-wayanad-text">Safety Alerts</h1>
            <p className="text-sm text-wayanad-muted">Live updates from Township & Community</p>
          </div>
        </div>
      </motion.div>

      {/* FAB */}
      <motion.button
        onClick={() => navigate("/create-alert")}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 text-white p-4 rounded-full z-20 flex items-center justify-center group"
        style={{
          background: "linear-gradient(135deg, #ef4444, #dc2626)",
          boxShadow: "0 4px 25px rgba(220,38,38,0.4), 0 0 40px rgba(220,38,38,0.15)",
        }}
      >
        <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
      </motion.button>

      {/* Alert Feed */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <motion.div variants={fadeUp} className="text-center py-20 glass-card rounded-2xl">
            <AlertTriangle size={40} className="mx-auto mb-3 text-wayanad-muted opacity-30" />
            <p className="text-wayanad-muted font-medium">No active alerts.</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {alerts.map((alert, index) => {
              const Icon = getIconComponent(alert.icon);
              const accent = getAccent(alert.type);

              return (
                <motion.div
                  key={alert.id}
                  variants={fadeUp}
                  className="glass-card rounded-2xl p-5 relative overflow-hidden group transition-all duration-300 hover:translate-x-1"
                  style={{
                    borderLeft: `3px solid ${accent.border}`,
                    boxShadow: alert.type === "critical"
                      ? `0 4px 24px rgba(0,0,0,0.06), 0 0 20px ${accent.glow}`
                      : undefined,
                  }}
                >
                  {/* Background accent glow on hover */}
                  <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-0 blur-3xl group-hover:opacity-40 transition-opacity duration-700"
                    style={{ background: accent.border }}></div>

                  <div className="flex items-start gap-4 relative z-10">
                    <div className={`mt-0.5 p-2.5 rounded-xl ${accent.icon}`}
                      style={{ background: accent.bg, boxShadow: `0 4px 12px ${accent.glow}` }}>
                      <Icon size={22} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-bold text-wayanad-text">{alert.title}</h3>
                            {alert.isAuthority ? (
                              <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tight">Official</span>
                            ) : (
                              <span className="bg-blue-500/15 text-blue-600 dark:text-blue-400 text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tight">Community</span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-mono text-wayanad-muted px-2 py-1 rounded-lg flex-shrink-0"
                          style={{ background: "var(--glass-bg)" }}>
                          {getTimeAgo(alert.time)}
                        </span>
                      </div>
                      <p className="text-wayanad-text/80 mt-1.5 text-sm leading-relaxed">{alert.message}</p>
                      {alert.location && (
                        <p className="mt-2 text-xs font-bold text-wayanad-muted flex items-center gap-1">
                          <Zap size={10} className="text-current" /> {alert.location}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {alerts.length > 0 && (
          <motion.div variants={fadeUp} className="text-center py-8">
            <p className="text-xs text-wayanad-muted uppercase tracking-widest">End of Updates</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Alerts;
