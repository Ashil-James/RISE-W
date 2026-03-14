import React, { useRef, useCallback, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Zap, AlertTriangle, Info, ArrowRight, CloudRain } from "lucide-react";
import { useUser } from "../context/UserContext";
import { useAlerts } from "../context/AlertContext";
import { motion } from "framer-motion";
import axios from "axios";

const Home = () => {
  const { user } = useUser();
  const { alerts } = useAlerts();
  const latestAlert = alerts.length > 0 ? alerts[0] : null;
  const heroRef = useRef(null);
  const [activeSurvey, setActiveSurvey] = useState(false);

  // Check for active post-storm survey
  useEffect(() => {
    const checkSurvey = async () => {
      if (!user?.token) return;
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get("/api/v1/weather/active-survey", config);
        if (data.success && data.data) setActiveSurvey(true);
      } catch {}
    };
    checkSurvey();
  }, [user?.token]);

  const handleMouseMove = useCallback((e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    heroRef.current.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    heroRef.current.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }, []);

  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical': return <AlertTriangle size={18} />;
      case 'warning': return <Zap size={18} />;
      default: return <Info size={18} />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'critical': return 'text-red-500 bg-red-500/10';
      case 'warning': return 'text-yellow-500 bg-yellow-500/10';
      default: return 'text-blue-500 bg-blue-500/10';
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const diff = Math.floor((Date.now() - date) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    const h = Math.floor(diff / 60);
    if (h < 24) return `${h}h ago`;
    return date.toLocaleDateString();
  };

  const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } } };
  const fadeUp = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 20 } } };

  return (
    <motion.div className="flex flex-col items-center justify-center min-h-[80vh] relative z-10" variants={stagger} initial="hidden" animate="visible">

      {/* ── Hero (with subtle cursor spotlight) ── */}
      <motion.div
        ref={heroRef}
        onMouseMove={handleMouseMove}
        variants={fadeUp}
        className="text-center mb-12 space-y-6 relative py-4 w-full max-w-2xl group"
      >
        {/* Subtle cursor spotlight — no container, just ambient glow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -z-10 rounded-3xl"
          style={{ background: "radial-gradient(500px circle at var(--mx, 50%) var(--my, 50%), rgba(16,185,129,0.06), transparent 60%)" }} />

        <h1 
          className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 tracking-tight drop-shadow-sm"
          style={{ transform: "translateZ(0)", WebkitTransform: "translateZ(0)" }}
        >
          Township Portal
        </h1>
        <p className="text-wayanad-muted text-lg md:text-xl font-medium max-w-2xl mx-auto">
          Report and track critical issues in your sector instantly.
        </p>
      </motion.div>

      {/* ── Report Button ── */}
      <motion.div variants={fadeUp} className="w-full max-w-md mb-8">
        <Link to="/report">
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="group relative w-full h-16 rounded-2xl font-bold text-lg text-white flex items-center justify-center gap-3 overflow-hidden transition-all"
            style={{
              background: "linear-gradient(135deg, #ff0f39, #ff4b6e)",
              boxShadow: "0 10px 40px -10px rgba(255,15,57,0.5)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
            <span className="relative z-10">Report Incident</span>
            <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </Link>
      </motion.div>

      {/* ── Post-Storm Survey Banner ── */}
      {activeSurvey && (
        <motion.div variants={fadeUp} className="w-full max-w-md mb-8">
          <Link to="/survey">
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="w-full rounded-2xl p-4 flex items-center gap-4 cursor-pointer relative overflow-hidden group"
              style={{
                background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(6,182,212,0.05))",
                border: "1px solid rgba(59,130,246,0.2)",
                boxShadow: "0 4px 20px -5px rgba(59,130,246,0.3)",
              }}
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-blue-500" />
              <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-500 flex-shrink-0">
                <CloudRain size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-blue-400 text-xs font-black uppercase tracking-wider">Post-Storm Survey Active</h4>
                <p className="text-wayanad-muted text-sm mt-0.5">Report damages in your area now</p>
              </div>
              <ChevronRight size={16} className="text-blue-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
            </motion.div>
          </Link>
        </motion.div>
      )}

      {/* ── Subtext ── */}
      <motion.div className="mb-12" variants={fadeUp}>
        <p className="text-[10px] font-bold tracking-[0.3em] text-emerald-500/80 uppercase">
          Maintenance • Utilities • Safety
        </p>
      </motion.div>

      {/* ── Alert Ticker ── */}
      {latestAlert && (
        <Link to="/alerts" className="w-full max-w-3xl">
          <motion.div
            className="w-full glass-card rounded-2xl p-4 flex items-center gap-4 group cursor-pointer relative overflow-hidden"
            variants={fadeUp}
            whileHover={{ scale: 1.01, y: -2 }}
          >
            <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${latestAlert.type === 'critical' ? 'bg-red-500' : latestAlert.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>

            <div className={`p-2 rounded-xl flex-shrink-0 ${latestAlert.type === 'critical' ? 'text-white bg-red-600' :
              getAlertColor(latestAlert.type).split(' ')[1] + ' ' + getAlertColor(latestAlert.type).split(' ')[0]
              }`}>
              {getAlertIcon(latestAlert.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className={`${latestAlert.type === 'critical' ? 'text-red-500' : getAlertColor(latestAlert.type).split(' ')[0]} text-xs font-bold uppercase tracking-wider`}>
                  {latestAlert.title}
                </h4>
                {latestAlert.isAuthority ? (
                  <span className="bg-emerald-500/20 text-emerald-500 text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase">Official</span>
                ) : (
                  <span className="bg-blue-500/20 text-blue-500 text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase">Community</span>
                )}
              </div>
              <p className="text-wayanad-muted text-sm line-clamp-1">{latestAlert.message}</p>
            </div>
            <span className="text-wayanad-muted text-xs font-medium flex-shrink-0">{getTimeAgo(latestAlert.time)}</span>
            <ChevronRight size={14} className="text-wayanad-muted group-hover:text-emerald-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </motion.div>
        </Link>
      )}
    </motion.div>
  );
};

export default Home;
