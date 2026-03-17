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
      whileHover={{ y: -2 }}
      onClick={interactive ? () => onOpen(alert) : undefined}
      className={`w-full text-left rounded-[1.7rem] border p-5 relative overflow-hidden transition-colors ${
        interactive ? "cursor-pointer hover:border-emerald-500/30" : ""
      }`}
      style={{
        background: "rgba(255,255,255,0.03)",
        borderColor: accent.border,
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className={`mt-1 p-3 rounded-2xl ${accent.text}`}
          style={{ background: accent.bg }}
        >
          <Icon size={20} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`text-[10px] font-black uppercase tracking-[0.18em] px-2.5 py-1 rounded-full ${accent.soft} ${accent.text}`}>
              {alert.severityLabel}
            </span>
            <span
              className={`text-[10px] font-black uppercase tracking-[0.18em] px-2.5 py-1 rounded-full ${
                alert.isOfficial
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-cyan-500/10 text-cyan-400"
              }`}
            >
              {alert.sourceLabel}
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.18em] px-2.5 py-1 rounded-full bg-white/5 text-wayanad-muted">
              {alert.categoryLabel}
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-lg font-black text-wayanad-text tracking-tight">
                {alert.title}
              </h3>
              <p className="text-sm text-wayanad-text/80 mt-2 leading-relaxed">
                {alert.message}
              </p>
            </div>

            <div className="text-left lg:text-right shrink-0">
              <p className="text-sm font-bold text-wayanad-text">{alert.relativeTime}</p>
              <p className="text-xs text-wayanad-muted mt-1">{alert.createdAtLabel}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
            <p className="text-xs font-bold text-wayanad-muted flex items-center gap-1.5">
              <MapPin size={12} />
              {alert.location}
            </p>

            {alert.actionTarget && (
              <span className="text-sm font-bold text-emerald-500 flex items-center gap-1">
                {alert.actionLabel}
                <ChevronRight size={15} />
              </span>
            )}
          </div>
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

      <motion.div variants={fadeUp} className="grid xl:grid-cols-[1.35fr_0.9fr] gap-5">
        <div className="glass-card rounded-[2rem] p-6 md:p-7 relative overflow-hidden">
          <div
            className="absolute -right-12 -top-12 h-36 w-36 rounded-full blur-3xl"
            style={{ background: "rgba(239,68,68,0.12)" }}
          />
          <div className="relative z-10">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-red-400/80 mb-2">
              Stay Informed
            </p>
            <h2 className="text-2xl md:text-3xl font-black text-wayanad-text tracking-tight">
              Watch urgent alerts before they become problems
            </h2>
            <p className="text-sm text-wayanad-muted mt-3 max-w-2xl">
              Official alerts come from township authorities. Community alerts come from residents and are always labeled separately.
            </p>

            <div className="grid grid-cols-3 gap-3 mt-6">
              {statCards.map((card) => (
                <div key={card.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <card.icon size={16} className="text-emerald-500 mb-3" />
                  <p className="text-2xl font-black text-wayanad-text">{card.value}</p>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-wayanad-muted font-black mt-1">
                    {card.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card rounded-[2rem] p-6 border border-cyan-500/15">
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-cyan-400/80 mb-2">
            Community Alerts
          </p>
          <h3 className="text-xl font-black text-wayanad-text tracking-tight">
            Share local updates responsibly
          </h3>
          <p className="text-sm text-wayanad-muted mt-3 leading-relaxed">
            Community alerts publish immediately and appear with a clear community label so residents can distinguish them from official warnings.
          </p>
          <button
            onClick={() => navigate("/create-alert")}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #0891b2, #06b6d4)" }}
          >
            <Plus size={16} />
            Create Community Alert
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
            <motion.div variants={fadeUp} className="glass-card rounded-[2rem] p-6 md:p-7 relative overflow-hidden">
              <div
                className="absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl"
                style={{ background: featuredAlert.type === "critical" ? "rgba(239,68,68,0.16)" : "rgba(16,185,129,0.14)" }}
              />

              <div className="relative z-10">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className={`text-[10px] font-black uppercase tracking-[0.18em] px-2.5 py-1 rounded-full ${getAccent(featuredAlert.type).soft} ${getAccent(featuredAlert.type).text}`}>
                    Featured {featuredAlert.severityLabel}
                  </span>
                  <span className={`text-[10px] font-black uppercase tracking-[0.18em] px-2.5 py-1 rounded-full ${
                    featuredAlert.isOfficial ? "bg-emerald-500/10 text-emerald-400" : "bg-cyan-500/10 text-cyan-400"
                  }`}>
                    {featuredAlert.sourceLabel}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] px-2.5 py-1 rounded-full bg-white/5 text-wayanad-muted">
                    {featuredAlert.categoryLabel}
                  </span>
                </div>

                <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
                  <div className="min-w-0">
                    <h2 className="text-2xl md:text-3xl font-black text-wayanad-text tracking-tight">
                      {featuredAlert.title}
                    </h2>
                    <p className="text-sm md:text-base text-wayanad-text/80 mt-3 leading-relaxed max-w-3xl">
                      {featuredAlert.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 mt-5 text-sm">
                      <span className="text-wayanad-muted flex items-center gap-1.5">
                        <MapPin size={14} />
                        {featuredAlert.location}
                      </span>
                      <span className="text-wayanad-muted">{featuredAlert.createdAtLabel}</span>
                    </div>
                  </div>

                  <div className="xl:text-right shrink-0">
                    <p className="text-sm font-black text-wayanad-text">{featuredAlert.relativeTime}</p>
                    <p className="text-xs text-wayanad-muted mt-1">
                      {featuredAlert.isActive ? "Active now" : "Older update"}
                    </p>

                    {featuredAlert.actionTarget && (
                      <button
                        onClick={() => openAlertAction(featuredAlert)}
                        className="mt-5 inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-white"
                        style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
                      >
                        {featuredAlert.actionLabel}
                        <ChevronRight size={16} />
                      </button>
                    )}
                  </div>
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
