import React, { useRef, useCallback, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight, Zap, AlertTriangle, Info, ArrowRight,
  CloudRain, FileText, Wrench, ShieldCheck, Archive
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { useAlerts } from "../context/AlertContext";
import { useReports } from "../context/ReportContext";
import { motion } from "framer-motion";
import axios from "axios";
import WeatherWidget from "../components/WeatherWidget";

const Home = () => {
  const { user } = useUser();
  const { alerts, loading: alertsLoading } = useAlerts();
  const { caseSummary, loading: reportsLoading } = useReports();
  const latestAlert = alerts.length > 0 ? alerts[0] : null;
  const heroRef = useRef(null);
  const [activeSurvey, setActiveSurvey] = useState(false);
  const summaryCards = [
    { label: "Action Needed", value: caseSummary.actionNeeded, icon: FileText, tint: "text-orange-400", border: "border-orange-500/20", bg: "bg-orange-500/10" },
    { label: "In Progress", value: caseSummary.inProgress, icon: Wrench, tint: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/10" },
    { label: "Awaiting Verification", value: caseSummary.awaitingVerification, icon: ShieldCheck, tint: "text-sky-400", border: "border-sky-500/20", bg: "bg-sky-500/10" },
    { label: "Closed", value: caseSummary.closed, icon: Archive, tint: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/10" },
  ];

  // Check for active post-storm survey
  useEffect(() => {
    const checkSurvey = async () => {
      if (!user?.token) return;
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get("/api/v1/weather/active-survey", config);
        if (data.success && data.data) setActiveSurvey(true);
      } catch { }
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

      {/* ── Live Weather Widget (Top Dashboard Status) ── */}
      <motion.div variants={fadeUp} className="mb-8 mt-2 z-20 relative">
        <WeatherWidget />
      </motion.div>

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

      <motion.div variants={fadeUp} className="w-full max-w-5xl mb-8">
        <div className="glass-card rounded-[2rem] p-6 md:p-7 relative overflow-hidden">
          <div
            className="absolute -right-16 -top-16 w-48 h-48 rounded-full blur-3xl"
            style={{ background: "rgba(16,185,129,0.12)" }}
          />

          <div className="relative z-10 flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-emerald-500/80 mb-2">
                My Cases
              </p>
              <h2 className="text-2xl md:text-3xl font-black text-wayanad-text tracking-tight">
                See what changed in your reports
              </h2>
              <p className="text-sm text-wayanad-muted mt-2 max-w-2xl">
                Track authority progress, verification requests, and your most recently updated case from one place.
              </p>
            </div>

            <Link
              to="/my-reports"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold text-wayanad-text border border-white/10 hover:border-emerald-500/30 hover:text-emerald-500 transition-colors w-fit"
            >
              Open Case Tracker
              <ChevronRight size={16} />
            </Link>
          </div>

          {reportsLoading ? (
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-2xl p-5 glass-card animate-pulse min-h-[110px]" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
                {summaryCards.map((card) => (
                  <div key={card.label} className={`rounded-2xl p-5 ${card.bg} border ${card.border}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bg} ${card.tint} border ${card.border} mb-4`}>
                      <card.icon size={18} />
                    </div>
                    <p className="text-2xl md:text-3xl font-black text-wayanad-text">{card.value}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-wayanad-muted font-bold mt-2">
                      {card.label}
                    </p>
                  </div>
                ))}
              </div>

              {caseSummary.mostRecentlyUpdated ? (
                <Link to={`/my-reports/${caseSummary.mostRecentlyUpdated.id}`} className="block">
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="rounded-[1.6rem] border border-white/10 p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4 hover:border-emerald-500/30 transition-colors"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          {caseSummary.mostRecentlyUpdated.displayId}
                        </span>
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-xl ${caseSummary.mostRecentlyUpdated.statusColor}`}>
                          {caseSummary.mostRecentlyUpdated.status}
                        </span>
                        <span className="text-xs text-wayanad-muted">
                          Updated {caseSummary.mostRecentlyUpdated.lastUpdatedLabel}
                        </span>
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-wayanad-text truncate">
                        {caseSummary.mostRecentlyUpdated.issue}
                      </h3>
                      <p className="text-sm text-wayanad-muted mt-1 truncate">
                        {caseSummary.mostRecentlyUpdated.nextActionLabel} · {caseSummary.mostRecentlyUpdated.authorityLabel}
                      </p>
                    </div>
                    <div className="text-sm text-emerald-500 font-bold flex items-center gap-2">
                      View latest case
                      <ChevronRight size={16} />
                    </div>
                  </motion.div>
                </Link>
              ) : (
                <div className="rounded-[1.6rem] border border-dashed border-white/10 p-6 text-center text-wayanad-muted">
                  Submit your first issue to start tracking live progress here.
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>


      {/* ── Post-Storm Survey Banner ── */}
      {activeSurvey && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="w-full max-w-md mb-8"
        >
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
      {alertsLoading ? (
        <div className="w-full max-w-3xl glass-card rounded-2xl p-4 flex items-center gap-4 animate-pulse relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-white/5"></div>
          <div className="w-10 h-10 rounded-xl bg-white/10 flex-shrink-0"></div>
          <div className="flex-1 py-1">
            <div className="h-2.5 bg-white/10 rounded w-24 mb-2"></div>
            <div className="h-3 bg-white/10 rounded w-48"></div>
          </div>
        </div>
      ) : latestAlert && (
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
