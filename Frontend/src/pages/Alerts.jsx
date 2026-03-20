import React, { useDeferredValue, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

const getStatusColor = (tone) => {
  switch (tone) {
    case "critical": return "bg-red-500 text-red-500";
    case "warning": return "bg-orange-500 text-orange-500";
    default: return "bg-blue-500 text-blue-500";
  }
};

const AlertCard = ({ alert, onOpen }) => {
  const Icon = ICONS[alert.icon] || Info;
  const statusColorCombo = getStatusColor(alert.type);
  const statusBg = statusColorCombo.split(' ')[0];
  const statusText = statusColorCombo.split(' ')[1];
  const interactive = typeof onOpen === "function" && Boolean(alert.actionTarget);

  return (
    <motion.button
      whileHover={{ scale: interactive ? 1.002 : 1, y: interactive ? -2 : 0 }}
      onClick={interactive ? () => onOpen(alert) : undefined}
      className={`w-full text-left rounded-[1.5rem] p-6 lg:p-8 relative overflow-hidden transition-all duration-300 group border border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] hover:border-black/20 dark:hover:border-white/20 hover:shadow-sm ${
        interactive ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex flex-col md:flex-row gap-6 md:items-start w-full">
        
        <div className={`p-4 rounded-xl flex-shrink-0 bg-neutral-100 dark:bg-[#111] border border-black/5 dark:border-white/5`}>
          <Icon size={24} className="text-black dark:text-white" />
        </div>

        <div className="flex-1 min-w-0 w-full space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${statusBg}`}></div>
              <span className={`text-[10px] md:text-xs font-bold uppercase tracking-[0.1em] text-neutral-900 dark:text-neutral-100`}>
                {alert.severityLabel}
              </span>
            </div>
            <span className="text-neutral-300 dark:text-neutral-700">/</span>
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.1em] text-neutral-500 dark:text-neutral-400 border border-black/10 dark:border-white/10 px-2 py-0.5 rounded-md">
              {alert.sourceLabel}
            </span>
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.1em] text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-[#111] px-2 py-0.5 rounded-md">
              {alert.categoryLabel}
            </span>
          </div>

          <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
            <div className="min-w-0 pr-4">
              <h3 className="text-xl md:text-2xl font-semibold text-black dark:text-white tracking-tight mb-2 line-clamp-2">
                {alert.title}
              </h3>
              <p className="text-sm md:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium line-clamp-3 max-w-2xl">
                {alert.message}
              </p>
            </div>

            <div className="text-left xl:text-right flex-shrink-0 mt-2 xl:mt-0 xl:min-w-[120px]">
              <p className="text-sm font-semibold text-black dark:text-white">{alert.relativeTime}</p>
              <p className="text-[10px] md:text-xs text-neutral-500 dark:text-neutral-500 mt-1 font-bold tracking-[0.1em] uppercase">{alert.createdAtLabel}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-black/5 dark:border-white/5">
            <p className="text-xs md:text-sm font-medium text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
              <MapPin size={16} className="text-neutral-400" />
              <span className="line-clamp-1">{alert.location}</span>
            </p>

            {alert.actionTarget && (
              <div className="text-xs md:text-sm font-semibold flex items-center gap-1.5 px-4 py-2 rounded-lg transition-colors text-black dark:text-white bg-neutral-100 dark:bg-[#111] group-hover:bg-neutral-200 dark:group-hover:bg-[#1a1a1a]">
                {alert.actionLabel}
                <ChevronRight size={16} className="text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors group-hover:translate-x-0.5 transform" />
              </div>
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

  const openAlertAction = (alert) => {
    if (!alert.actionTarget) return;
    navigate(alert.actionTarget);
  };

  const fadeUp = {
    hidden: { y: 15, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <motion.div
      className="w-full max-w-5xl mx-auto relative pb-24 space-y-8 lg:pt-12"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
    >
      <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-6 border-b border-black/10 dark:border-white/10">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="mb-6 px-4 py-2 rounded-lg text-sm font-medium text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white bg-neutral-100 dark:bg-[#111] border border-black/5 dark:border-white/5 transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white tracking-tight">System Alerts</h1>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
           <button
             onClick={() => navigate("/create-alert")}
             className="px-6 py-2.5 rounded-xl font-semibold text-sm text-white dark:text-black bg-black dark:bg-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
           >
             <Plus size={16} /> New Alert
           </button>
           <button
             onClick={refreshAlerts}
             className="px-4 py-2.5 rounded-xl font-medium text-sm text-black dark:text-white border border-black/10 dark:border-white/10 hover:bg-neutral-50 dark:hover:bg-[#111] transition-colors flex items-center justify-center gap-2"
           >
             <RefreshCw size={16} />
           </button>
        </div>
      </motion.div>

      {/* ── Enterprise Search & Filter Bar ── */}
      <motion.div variants={fadeUp} className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
        <label className="flex-1 flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-xl relative focus-within:border-black/30 dark:focus-within:border-white/30 transition-colors">
          <Search size={18} className="text-neutral-400" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search alerts by title, location, or content..."
            className="bg-transparent outline-none w-full text-sm font-medium text-black dark:text-white placeholder:text-neutral-400"
          />
        </label>
        
        <div className="flex flex-wrap items-center gap-2">
          {SOURCE_FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSourceFilter(filter.id)}
              className={`px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-[0.1em] transition-colors border ${
                sourceFilter === filter.id
                  ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                  : "bg-white dark:bg-[#0a0a0a] text-neutral-500 dark:text-neutral-400 border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 hover:text-black dark:hover:text-white"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </motion.div>

      {loading ? (
        <div className="space-y-4 mt-8">
          {Array.from({ length: 3 }).map((_, index) => (
            <motion.div key={index} variants={fadeUp} className="bg-neutral-100 dark:bg-[#111] rounded-[1.5rem] min-h-[160px] animate-pulse border border-black/5 dark:border-white/5" />
          ))}
        </div>
      ) : filteredAlerts.length === 0 ? (
        <motion.div variants={fadeUp} className="py-24 text-center border border-dashed border-black/20 dark:border-white/20 rounded-[2rem] mt-8 bg-white dark:bg-[#0a0a0a]">
          <ShieldAlert size={48} className="mx-auto text-neutral-300 dark:text-neutral-700 mb-6" />
          <h3 className="text-xl font-semibold text-black dark:text-white mb-2 tracking-tight">No alerts found</h3>
          <p className="text-neutral-500 dark:text-neutral-400 font-medium">
            There are no alerts matching your current filters and search terms.
          </p>
          <button onClick={() => { setSearchTerm(''); setSourceFilter('ALL'); setSeverityFilter('ALL'); }} className="mt-6 text-sm font-semibold text-black dark:text-white underline underline-offset-4 hover:opacity-80">
            Clear all filters
          </button>
        </motion.div>
      ) : (
        <div className="space-y-10 mt-8">
          {featuredAlert && (
            <motion.div variants={fadeUp} className="space-y-5">
              <div className="flex items-center gap-3 px-1">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-[pulse_2s_ease-in-out_infinite]"></div>
                <h3 className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 tracking-[0.15em] uppercase">Featured Priority</h3>
              </div>
              <AlertCard alert={featuredAlert} onOpen={openAlertAction} />
            </motion.div>
          )}

          {activeAlerts.length > 0 && (
            <motion.div variants={fadeUp} className="space-y-5">
              <div className="flex items-center gap-3 px-1">
                <AlertTriangle size={14} className="text-neutral-400" />
                <h3 className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 tracking-[0.15em] uppercase">Active Alerts</h3>
              </div>
              <div className="space-y-4">
                {activeAlerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} onOpen={openAlertAction} />
                ))}
              </div>
            </motion.div>
          )}

          {olderAlerts.length > 0 && (
            <motion.div variants={fadeUp} className="space-y-5">
              <div className="flex items-center gap-3 px-1 pt-8 border-t border-black/10 dark:border-white/10">
                <Info size={14} className="text-neutral-400" />
                <h3 className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 tracking-[0.15em] uppercase">Earlier Updates</h3>
              </div>
              <div className="space-y-4">
                {olderAlerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} onOpen={openAlertAction} />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default Alerts;
