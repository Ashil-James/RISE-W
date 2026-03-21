import React, { useDeferredValue, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  CloudRain,
  Info,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAlerts } from "../context/AlertContext";

const ICONS = {
  AlertTriangle,
  CloudRain,
  Info,
  Zap,
};

const SOURCE_FILTERS = [
  { id: "ALL", label: "All" },
  { id: "OFFICIAL", label: "Official" },
  { id: "COMMUNITY", label: "Community" },
];

const SEVERITY_FILTERS = [
  { id: "ALL", label: "Any Severity" },
  { id: "critical", label: "Critical" },
  { id: "warning", label: "Warning" },
  { id: "info", label: "Info" },
];

const getAccent = (tone) => {
  switch (tone) {
    case "critical":
      return {
        border: "rgba(239,68,68,0.26)",
        bg: "rgba(239,68,68,0.08)",
        soft: "bg-red-500/10",
        text: "text-red-400",
      };
    case "warning":
      return {
        border: "rgba(245,158,11,0.24)",
        bg: "rgba(245,158,11,0.08)",
        soft: "bg-amber-500/10",
        text: "text-amber-400",
      };
    default:
      return {
        border: "rgba(59,130,246,0.24)",
        bg: "rgba(59,130,246,0.08)",
        soft: "bg-sky-500/10",
        text: "text-sky-400",
      };
  }
};

const AlertCard = ({ alert, onOpen }) => {
  const Icon = ICONS[alert.icon] || Info;
  const accent = getAccent(alert.type);
  const interactive = typeof onOpen === "function" && Boolean(alert.actionTarget);

  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.005 }}
      whileTap={{ scale: 0.99 }}
      onClick={interactive ? () => onOpen(alert) : undefined}
      className={`w-full text-left rounded-[1.5rem] border p-4 md:p-5 relative overflow-hidden transition-all duration-300 group ${
        interactive ? "cursor-pointer hover:border-emerald-500/40 hover:bg-white/[0.03]" : ""
      }`}
      style={{
        background: "rgba(255,255,255,0.02)",
        borderColor: accent.border,
      }}
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 min-w-0 flex items-center gap-4">
          <div className={`p-2.5 rounded-xl shrink-0 ${accent.text}`} style={{ background: accent.bg }}>
            <Icon size={18} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${accent.soft} ${accent.text}`}>
                {alert.severityLabel}
              </span>
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                alert.isOfficial ? "bg-emerald-500/10 text-emerald-400" : "bg-cyan-500/10 text-cyan-400"
              }`}>
                {alert.sourceLabel}
              </span>
            </div>
            
            <h3 className="text-[1.1rem] font-bold text-wayanad-text truncate">
              {alert.title}
            </h3>
            
            <div className="flex items-center gap-2.5 text-xs text-wayanad-muted mt-1.5">
              <span className="flex items-center gap-1 min-w-0">
                <MapPin size={12} className="shrink-0 text-white/40" />
                <span className="truncate">{alert.location}</span>
              </span>
              <span className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
              <span className="truncate">{alert.categoryLabel}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-5 pl-14 md:pl-0">
          <div className="flex flex-col items-start md:items-end shrink-0">
            <span className="text-[10px] uppercase tracking-wider text-wayanad-muted font-bold mb-1">
              {alert.createdAtLabel}
            </span>
            <div className="flex items-center gap-1.5 text-sm font-medium text-wayanad-text">
              {alert.relativeTime}
            </div>
          </div>
          
          {interactive && (
            <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-emerald-500/10 group-hover:text-emerald-500 group-hover:border-emerald-500/30 transition-all shrink-0">
              <ChevronRight size={16} className="translate-x-0 group-hover:translate-x-0.5 transition-transform" />
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
};

const Alerts = () => {
  const navigate = useNavigate();
  const { alerts, loading, refreshAlerts } = useAlerts();
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const deferredSearchTerm = useDeferredValue(searchTerm);

  const filteredAlerts = useMemo(() => {
    const search = deferredSearchTerm.trim().toLowerCase();

    return alerts.filter((alert) => {
      const matchesSource =
        sourceFilter === "ALL" ? true : alert.sourceType === sourceFilter;
      const matchesSeverity =
        severityFilter === "ALL" ? true : alert.type === severityFilter;
      const matchesSearch = !search
        ? true
        : [alert.title, alert.message, alert.location, alert.categoryLabel]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(search));

      return matchesSource && matchesSeverity && matchesSearch;
    });
  }, [alerts, deferredSearchTerm, severityFilter, sourceFilter]);

  const featuredAlert = useMemo(
    () =>
      filteredAlerts.find((alert) => alert.isActive && alert.type === "critical" && alert.isOfficial) ||
      filteredAlerts.find((alert) => alert.isActive) ||
      filteredAlerts[0] ||
      null,
    [filteredAlerts],
  );

  const featuredAlertId = featuredAlert?.id || null;
  const activeAlerts = filteredAlerts.filter((alert) => alert.id !== featuredAlertId && alert.isActive);
  const olderAlerts = filteredAlerts.filter((alert) => alert.id !== featuredAlertId && !alert.isActive);

  const statCards = [
    { label: "Active", value: alerts.filter((alert) => alert.isActive).length, icon: ShieldAlert },
    { label: "Official", value: alerts.filter((alert) => alert.isOfficial).length, icon: AlertTriangle },
    { label: "Community", value: alerts.filter((alert) => alert.isCommunity).length, icon: Users },
  ];

  const openAlertAction = (alert) => {
    if (!alert.actionTarget) return;
    navigate(alert.actionTarget);
  };

  const fadeUp = {
    hidden: { y: 18, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 110, damping: 18 } },
  };

  return (
    <motion.div
      className="w-full max-w-6xl mx-auto relative pb-24 space-y-6"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
    >
      <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
        <div className="flex items-center gap-4">
          <motion.button
            onClick={() => navigate(-1)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            className="p-2.5 -ml-2 rounded-xl glass-card text-wayanad-muted hover:text-wayanad-text transition-colors"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <div>
            <h1 className="text-3xl font-black text-wayanad-text tracking-tight">Alert Dashboard</h1>
            <p className="text-sm text-wayanad-muted">
              Official warnings and community updates, clearly separated in one place.
            </p>
          </div>
        </div>

        <button
          onClick={refreshAlerts}
          className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 glass-card text-sm font-bold text-wayanad-muted hover:text-wayanad-text transition-colors"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </motion.div>

      <motion.div variants={fadeUp} className="flex flex-col md:flex-row gap-4 mb-2">
        <div className="flex-1 glass-card rounded-[1.5rem] p-5 md:p-6 flex items-center justify-between border border-white/5">
          <div>
            <h2 className="text-xl font-bold text-wayanad-text tracking-tight mb-3">
              Alerts Overview
            </h2>
            <div className="flex flex-wrap gap-4 text-sm font-medium text-wayanad-text">
              <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5"><ShieldAlert size={14} className="text-red-400"/> {alerts.filter((a) => a.isActive).length} Active</span>
              <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5"><AlertTriangle size={14} className="text-emerald-500"/> {alerts.filter((a) => a.isOfficial).length} Official</span>
              <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5"><Users size={14} className="text-cyan-400"/> {alerts.filter((a) => a.isCommunity).length} Community</span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-[1.5rem] p-5 md:p-6 border border-cyan-500/20 flex flex-col justify-center bg-cyan-500/5">
            <p className="text-sm text-cyan-100/80 mb-3 max-w-[200px] leading-snug">
              Share local updates to keep your neighbors informed.
            </p>
            <button
              onClick={() => navigate("/create-alert")}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition-transform hover:scale-105"
              style={{ background: "linear-gradient(135deg, #0891b2, #06b6d4)" }}
            >
              <Plus size={16} strokeWidth={2.5} />
              Publish Alert
            </button>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="glass-card rounded-[2rem] p-4 md:p-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          {SOURCE_FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSourceFilter(filter.id)}
              className={`px-4 py-2 rounded-2xl text-sm font-bold transition-colors ${
                sourceFilter === filter.id
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg"
                  : "bg-white/[0.03] text-wayanad-muted hover:text-wayanad-text"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-3">
          <label className="glass-card rounded-2xl px-4 py-3 flex items-center gap-3">
            <Search size={16} className="text-wayanad-muted" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search title, message, location, or category"
              className="bg-transparent outline-none w-full text-sm text-wayanad-text placeholder:text-wayanad-muted"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {SEVERITY_FILTERS.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSeverityFilter(filter.id)}
                className={`px-4 py-2 rounded-2xl text-sm font-bold transition-colors ${
                  severityFilter === filter.id
                    ? "bg-white text-slate-900"
                    : "bg-white/[0.03] text-wayanad-muted hover:text-wayanad-text"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <motion.div key={index} variants={fadeUp} className="glass-card rounded-[1.8rem] min-h-[180px] animate-pulse" />
          ))}
        </div>
      ) : filteredAlerts.length === 0 ? (
        <motion.div variants={fadeUp} className="glass-card rounded-[2rem] p-12 text-center">
          <ShieldAlert size={42} className="mx-auto text-wayanad-muted opacity-30 mb-4" />
          <h3 className="text-xl font-black text-wayanad-text mb-2">No matching alerts</h3>
          <p className="text-sm text-wayanad-muted">
            Try adjusting your filters or publish a community update if people nearby should know about something.
          </p>
        </motion.div>
      ) : (
        <>
          {featuredAlert && (
            <motion.div variants={fadeUp} className="glass-card rounded-[1.8rem] p-6 relative overflow-hidden border border-red-500/30 group mb-6">
              <div
                className="absolute top-0 right-0 h-64 w-64 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"
                style={{ background: featuredAlert.type === "critical" ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)" }}
              />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${getAccent(featuredAlert.type).soft} ${getAccent(featuredAlert.type).text}`}>
                      Featured {featuredAlert.severityLabel}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                      featuredAlert.isOfficial ? "bg-emerald-500/10 text-emerald-400" : "bg-cyan-500/10 text-cyan-400"
                    }`}>
                      {featuredAlert.sourceLabel}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-white/5 text-wayanad-muted">
                      {featuredAlert.categoryLabel}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-wayanad-text mb-2 truncate">
                    {featuredAlert.title}
                  </h2>
                  <p className="text-sm text-wayanad-text/80 line-clamp-1 max-w-2xl">
                    {featuredAlert.message}
                  </p>

                  <div className="flex items-center gap-3 mt-3 text-xs text-wayanad-muted">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={12} className="text-white/40" />
                      <span className="truncate">{featuredAlert.location}</span>
                    </span>
                    <span className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
                    <span>{featuredAlert.createdAtLabel}</span>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 shrink-0 md:min-w-[160px]">
                  <div className="text-left md:text-right">
                    <p className="text-lg font-bold text-wayanad-text">{featuredAlert.relativeTime}</p>
                    <p className="text-[11px] uppercase tracking-wider text-red-400 font-bold mt-1">
                      {featuredAlert.isActive ? "Active now" : "Older update"}
                    </p>
                  </div>

                  {featuredAlert.actionTarget && (
                    <button
                      onClick={() => openAlertAction(featuredAlert)}
                      className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white bg-white/5 hover:bg-emerald-500 hover:text-white transition-colors border border-white/10 hover:border-emerald-500"
                    >
                      {featuredAlert.actionLabel}
                      <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeAlerts.length > 0 && (
            <motion.div variants={fadeUp} className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-400" />
                <h3 className="text-lg font-black text-wayanad-text tracking-tight">Active Now</h3>
              </div>
              <div className="space-y-4">
                {activeAlerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} onOpen={openAlertAction} />
                ))}
              </div>
            </motion.div>
          )}

          {olderAlerts.length > 0 && (
            <motion.div variants={fadeUp} className="space-y-4">
              <div className="flex items-center gap-2">
                <Info size={16} className="text-wayanad-muted" />
                <h3 className="text-lg font-black text-wayanad-text tracking-tight">Earlier Updates</h3>
              </div>
              <div className="space-y-4 opacity-95">
                {olderAlerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} onOpen={openAlertAction} />
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default Alerts;
