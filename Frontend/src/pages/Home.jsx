import React, { useRef, useCallback, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  Zap,
  AlertTriangle,
  Info,
  ArrowRight,
  CloudRain,
  FileText,
  Wrench,
  ShieldCheck,
  Archive,
  Plus,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { useAlerts } from "../context/AlertContext";
import { useReports } from "../context/ReportContext";
import { motion } from "framer-motion";
import axios from "axios";
import WeatherWidget from "../components/WeatherWidget";
import { useTranslation } from "react-i18next";

const Home = () => {
  const { user } = useUser();
  const { t } = useTranslation();
  const { alerts, loading: alertsLoading } = useAlerts();
  const { caseSummary, loading: reportsLoading } = useReports();
  const latestAlert = alerts.length > 0 ? alerts[0] : null;
  const heroRef = useRef(null);
  const [activeSurvey, setActiveSurvey] = useState(false);
  const summaryCards = [
    {
      label: t("home.actionNeeded"),
      value: caseSummary.actionNeeded,
      icon: FileText,
      tint: "text-orange-400",
      border: "border-orange-500/20",
      bg: "bg-orange-500/10",
    },
    {
      label: t("home.inProgress"),
      value: caseSummary.inProgress,
      icon: Wrench,
      tint: "text-amber-400",
      border: "border-amber-500/20",
      bg: "bg-amber-500/10",
    },
    {
      label: t("home.awaitingVerification"),
      value: caseSummary.awaitingVerification,
      icon: ShieldCheck,
      tint: "text-sky-400",
      border: "border-sky-500/20",
      bg: "bg-sky-500/10",
    },
    {
      label: t("home.closed"),
      value: caseSummary.closed,
      icon: Archive,
      tint: "text-emerald-400",
      border: "border-emerald-500/20",
      bg: "bg-emerald-500/10",
    },
  ];

  // Check for active post-storm survey
  useEffect(() => {
    const checkSurvey = async () => {
      if (!user?.token) return;
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(
          "/api/v1/weather/active-survey",
          config,
        );
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
      case "critical":
        return <AlertTriangle size={18} />;
      case "warning":
        return <Zap size={18} />;
      default:
        return <Info size={18} />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case "critical":
        return "text-red-500 bg-red-500/10";
      case "warning":
        return "text-yellow-500 bg-yellow-500/10";
      default:
        return "text-blue-500 bg-blue-500/10";
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const diff = Math.floor((Date.now() - date) / 60000);
    if (diff < 1) return t("report.justNow");
    if (diff < 60) return `${diff}${t("report.mAgo") || 'm ago'}`;
    const h = Math.floor(diff / 60);
    if (h < 24) return `${h}${t("report.hAgo")}`;
    return date.toLocaleDateString();
  };

  const stagger = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };
  const fadeUp = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 20 },
    },
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[80vh] relative z-10"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      {/* ── Live Weather Widget (Top Dashboard Status) ── */}
      <motion.div variants={fadeUp} className="mb-8 mt-2 z-20 relative">
        <WeatherWidget />
      </motion.div>

      {/* ── Hero (with subtle cursor spotlight) ── */}
      <motion.div
        ref={heroRef}
        onMouseMove={handleMouseMove}
        variants={fadeUp}
        className="text-center mb-10 space-y-4 relative w-full max-w-2xl group"
      >
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -z-10 rounded-3xl"
          style={{
            background:
              "radial-gradient(500px circle at var(--mx, 50%) var(--my, 50%), rgba(16,185,129,0.06), transparent 60%)",
          }}
        />

        <h1
          className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 tracking-tight"
          style={{ transform: "translateZ(0)", WebkitTransform: "translateZ(0)" }}
        >
          {t("home.title")}
        </h1>
        <p className="text-wayanad-muted text-base md:text-lg font-medium max-w-xl mx-auto">
          {t("home.subtitle")}
        </p>
      </motion.div>

      {/* ── Report Button & My Cases ── */}
      <motion.div variants={fadeUp} className="w-full max-w-3xl mb-10 space-y-6">
        <div className="flex justify-center w-full mb-8">
          <Link to="/report" className="block w-full max-w-sm">
            <motion.button
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative w-full h-14 rounded-[1.5rem] font-black text-lg text-white flex items-center justify-center gap-2 overflow-hidden transition-all shadow-[0_8px_30px_-5px_rgba(244,63,94,0.4)] hover:shadow-[0_12px_40px_-5px_rgba(244,63,94,0.5)] border border-rose-500/50"
              style={{
                background: "linear-gradient(135deg, #ef4444, #f43f5e)",
              }}
            >
              <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out skew-x-12" />
              <Plus size={20} strokeWidth={3} className="relative z-10 group-hover:rotate-90 transition-transform duration-300" />
              <span className="relative z-10 tracking-wide">{t("home.reportBtn")}</span>
            </motion.button>
          </Link>
        </div>

        {/* My Cases Section */}
        <div className="glass-card rounded-[2rem] p-6 lg:p-8 border border-white/5 shadow-2xl">
          <div className="flex items-center justify-between pb-5 border-b border-white/5 mb-5">
            <h2 className="text-lg md:text-xl font-black text-wayanad-text flex items-center gap-2.5">
              <Archive size={20} className="text-emerald-500" /> 
              {t("home.myCasesTitle")}
            </h2>
            <Link
              to="/my-reports"
              className="text-sm font-bold text-emerald-500 flex items-center gap-1.5 hover:text-emerald-400 transition-colors border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 rounded-xl hover:bg-emerald-500/20"
            >
              {t("home.openTracker")}
              <ChevronRight size={16} />
            </Link>
          </div>

          {reportsLoading ? (
            <div className="animate-pulse flex flex-col gap-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-20 border border-white/5 rounded-2xl bg-white/5" />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {summaryCards.map((card) => (
                  <div
                    key={card.label}
                    className="flex flex-col items-center justify-center text-center p-4 rounded-[1.2rem] border border-white/5 bg-white/[0.015] hover:bg-white/[0.03] transition-colors"
                  >
                    <div className={`p-2 rounded-xl mb-3 ${card.bg} ${card.tint}`}>
                      <card.icon size={18} strokeWidth={2} />
                    </div>
                    <span className="text-2xl font-black text-wayanad-text leading-none mb-1.5">
                      {card.value}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-wayanad-muted font-black truncate max-w-full">
                      {card.label}
                    </span>
                  </div>
                ))}
              </div>

              {caseSummary.mostRecentlyUpdated && (
                <div className="mt-2 text-center md:text-left">
                  <Link
                    to={`/my-reports/${caseSummary.mostRecentlyUpdated.id}`}
                    className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 md:p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-emerald-500/30 transition-all shadow-md"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4 min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg shrink-0 ${caseSummary.mostRecentlyUpdated.statusColor}`}>
                          {caseSummary.mostRecentlyUpdated.status}
                        </span>
                        <div className="h-1 w-1 rounded-full bg-white/20 hidden md:block" />
                        <span className="text-[10px] font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 shrink-0">
                          {caseSummary.mostRecentlyUpdated.displayId}
                        </span>
                      </div>
                      
                      <div className="h-1 w-1 rounded-full bg-white/20 hidden md:block" />
                      
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-wayanad-text truncate">
                          {caseSummary.mostRecentlyUpdated.issue}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-5 pl-2 md:pl-0">
                      <div className="flex items-center gap-2 text-xs font-medium text-wayanad-muted shrink-0">
                        <span className="truncate max-w-[120px]">{caseSummary.mostRecentlyUpdated.authorityLabel}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
                        <span className="shrink-0">{caseSummary.mostRecentlyUpdated.lastUpdatedLabel}</span>
                      </div>
                      <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 group-hover:border-emerald-500/30 transition-colors">
                        <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </div>
              )}
            </div>
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
                background:
                  "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(6,182,212,0.05))",
                border: "1px solid rgba(59,130,246,0.2)",
                boxShadow: "0 4px 20px -5px rgba(59,130,246,0.3)",
              }}
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-blue-500" />
              <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-500 flex-shrink-0">
                <CloudRain size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-blue-400 text-xs font-black uppercase tracking-wider">
                  Post-Storm Survey Active
                </h4>
                <p className="text-wayanad-muted text-sm mt-0.5">
                  Report damages in your area now
                </p>
              </div>
              <ChevronRight
                size={16}
                className="text-blue-400 group-hover:translate-x-1 transition-transform flex-shrink-0"
              />
            </motion.div>
          </Link>
        </motion.div>
      )}

      {/* ── Subtext ── */}

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
      ) : (
        latestAlert && (
          <Link to="/alerts" className="w-full max-w-3xl">
            <motion.div
              className="w-full glass-card rounded-2xl p-4 flex items-center gap-4 group cursor-pointer relative overflow-hidden hover-lift"
              variants={fadeUp}
            >
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${latestAlert.type === "critical" ? "bg-red-500" : latestAlert.type === "warning" ? "bg-yellow-500" : "bg-blue-500"}`}
              ></div>

              <div
                className={`p-2 rounded-xl flex-shrink-0 ${
                  latestAlert.type === "critical"
                    ? "text-white bg-red-600"
                    : getAlertColor(latestAlert.type).split(" ")[1] +
                      " " +
                      getAlertColor(latestAlert.type).split(" ")[0]
                }`}
              >
                {getAlertIcon(latestAlert.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4
                    className={`${latestAlert.type === "critical" ? "text-red-500" : getAlertColor(latestAlert.type).split(" ")[0]} text-xs font-bold uppercase tracking-wider`}
                  >
                    {latestAlert.title}
                  </h4>
                  {latestAlert.isAuthority ? (
                    <span className="bg-emerald-500/20 text-emerald-500 text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase">
                      Official
                    </span>
                  ) : (
                    <span className="bg-blue-500/20 text-blue-500 text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase">
                      Community
                    </span>
                  )}
                </div>
                <p className="text-wayanad-muted text-sm line-clamp-1">
                  {latestAlert.message}
                </p>
              </div>
              <span className="text-wayanad-muted text-xs font-medium flex-shrink-0">
                {getTimeAgo(latestAlert.time)}
              </span>
              <ChevronRight
                size={14}
                className="text-wayanad-muted group-hover:text-emerald-500 group-hover:translate-x-1 transition-all flex-shrink-0"
              />
            </motion.div>
          </Link>
        )
      )}
    </motion.div>
  );
};

export default Home;
