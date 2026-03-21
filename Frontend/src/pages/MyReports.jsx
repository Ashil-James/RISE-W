import React, { useDeferredValue, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronRight,
  Clock3,
  FileText,
  MapPin,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { useReports } from "../context/ReportContext";
import {
  REPORT_BUCKET_OPTIONS,
  REPORT_SCOPE_OPTIONS,
  REPORT_SORT_OPTIONS,
} from "../utils/reportTracking";

const MyReports = () => {
  const navigate = useNavigate();
  const { reportedReports, supportedReports, loading } = useReports();
  const [scope, setScope] = useState("REPORTER");
  const [bucket, setBucket] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [authorityFilter, setAuthorityFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("recent_update");

  const deferredSearchTerm = useDeferredValue(searchTerm);
  const scopedReports = scope === "REPORTER" ? reportedReports : supportedReports;

  const bucketCounts = useMemo(() => {
    const counts = { ALL: scopedReports.length };
    REPORT_BUCKET_OPTIONS.forEach((option) => {
      if (option.id !== "ALL") {
        counts[option.id] = scopedReports.filter((report) => report.bucket === option.id).length;
      }
    });
    return counts;
  }, [scopedReports]);

  const authorityOptions = useMemo(
    () =>
      Array.from(new Set(scopedReports.map((report) => report.authority)))
        .filter(Boolean)
        .map((authority) => ({
          value: authority,
          label: scopedReports.find((report) => report.authority === authority)?.authorityLabel || authority,
        })),
    [scopedReports],
  );

  const statusOptions = useMemo(
    () =>
      Array.from(new Set(scopedReports.map((report) => report.rawStatus)))
        .filter(Boolean)
        .map((status) => ({
          value: status,
          label: scopedReports.find((report) => report.rawStatus === status)?.status || status,
        })),
    [scopedReports],
  );

  const filteredReports = useMemo(() => {
    const search = deferredSearchTerm.trim().toLowerCase();

    const nextReports = scopedReports.filter((report) => {
      const matchesBucket = bucket === "ALL" ? true : report.bucket === bucket;
      const matchesStatus = statusFilter === "ALL" ? true : report.rawStatus === statusFilter;
      const matchesAuthority = authorityFilter === "ALL" ? true : report.authority === authorityFilter;
      const matchesSearch = !search
        ? true
        : [
            report.issue,
            report.displayId,
            report.location,
            report.category,
            report.authorityLabel,
          ]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(search));

      return matchesBucket && matchesStatus && matchesAuthority && matchesSearch;
    });

    return [...nextReports].sort((left, right) => {
      if (sortBy === "oldest") {
        return new Date(left.submittedAt || 0).getTime() - new Date(right.submittedAt || 0).getTime();
      }

      if (sortBy === "newest") {
        return new Date(right.submittedAt || 0).getTime() - new Date(left.submittedAt || 0).getTime();
      }

      return new Date(right.lastUpdatedAt || 0).getTime() - new Date(left.lastUpdatedAt || 0).getTime();
    });
  }, [authorityFilter, bucket, deferredSearchTerm, scope, scopedReports, sortBy, statusFilter]);

  const emptyMessage =
    scope === "REPORTER"
      ? "You have not reported any incidents yet."
      : "You are not supporting any incidents yet.";

  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
  };
  const fadeUp = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 110, damping: 18 } },
  };

  return (
    <motion.div className="w-full max-w-6xl mx-auto" variants={stagger} initial="hidden" animate="visible">
      <motion.div className="flex items-center gap-4 mb-8" variants={fadeUp}>
        <motion.button
          onClick={() => navigate(-1)}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          className="p-2.5 -ml-2 rounded-xl glass-card text-wayanad-muted hover:text-wayanad-text transition-colors"
        >
          <ArrowLeft size={20} />
        </motion.button>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-wayanad-text tracking-tight">Case Tracker</h1>
          <p className="text-sm text-wayanad-muted">
            Follow authority progress, your required actions, and community-supported cases.
          </p>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="glass-card rounded-[2rem] p-4 md:p-5 mb-6">
        <div className="grid md:grid-cols-2 gap-3 mb-4">
          {REPORT_SCOPE_OPTIONS.map((option) => {
            const isActive = scope === option.id;
            const count = option.id === "REPORTER" ? reportedReports.length : supportedReports.length;

            return (
              <button
                key={option.id}
                onClick={() => setScope(option.id)}
                className={`rounded-2xl p-4 text-left transition-all border ${
                  isActive
                    ? "border-emerald-500/30 bg-emerald-500/10 text-wayanad-text"
                    : "border-white/10 bg-white/[0.02] text-wayanad-muted hover:text-wayanad-text"
                }`}
              >
                <p className="text-[11px] uppercase tracking-[0.2em] font-black text-emerald-500/80 mb-2">
                  {option.label}
                </p>
                <p className="text-3xl font-black">{count}</p>
                <p className="text-xs mt-2">{option.id === "REPORTER" ? "Cases you created" : "Cases you supported"}</p>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {REPORT_BUCKET_OPTIONS.map((option) => {
            const isActive = bucket === option.id;
            return (
              <button
                key={option.id}
                onClick={() => setBucket(option.id)}
                className={`px-4 py-2 rounded-2xl text-sm font-bold transition-colors ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg"
                    : "glass-card text-wayanad-muted hover:text-wayanad-text"
                }`}
              >
                {option.label}
                <span className="ml-2 text-xs opacity-80">{bucketCounts[option.id] || 0}</span>
              </button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-[1.5fr_repeat(3,minmax(0,1fr))] gap-3">
          <label className="glass-card rounded-2xl px-4 py-3 flex items-center gap-3">
            <Search size={16} className="text-wayanad-muted" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by title, report ID, location, or authority"
              className="bg-transparent outline-none w-full text-sm text-wayanad-text placeholder:text-wayanad-muted"
            />
          </label>

          <select
            value={authorityFilter}
            onChange={(event) => setAuthorityFilter(event.target.value)}
            className="glass-card rounded-2xl px-4 py-3 text-sm text-wayanad-text bg-transparent outline-none"
          >
            <option value="ALL">All authorities</option>
            {authorityOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-slate-900">
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="glass-card rounded-2xl px-4 py-3 text-sm text-wayanad-text bg-transparent outline-none"
          >
            <option value="ALL">All statuses</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-slate-900">
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="glass-card rounded-2xl px-4 py-3 text-sm text-wayanad-text bg-transparent outline-none"
          >
            {REPORT_SORT_OPTIONS.map((option) => (
              <option key={option.id} value={option.id} className="bg-slate-900">
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      <div className="space-y-4">
        {loading && scopedReports.length === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-[1.8rem] p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                <div className="flex flex-col lg:flex-row gap-4 mb-5">
                  <div className="flex-1 space-y-3">
                    <div className="flex gap-2">
                      <div className="h-6 w-20 bg-emerald-500/10 rounded-xl" />
                      <div className="h-6 w-24 bg-white/5 rounded-xl" />
                    </div>
                    <div className="h-8 w-3/4 bg-white/5 rounded-xl" />
                    <div className="h-4 w-1/2 bg-white/5 rounded-xl" />
                  </div>
                  <div className="w-32 h-12 bg-white/5 rounded-xl lg:ml-auto" />
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="h-24 bg-white/[0.02] rounded-2xl border border-white/5" />
                  <div className="h-24 bg-white/[0.02] rounded-2xl border border-white/5" />
                  <div className="h-24 bg-white/[0.02] rounded-2xl border border-white/5" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredReports.length === 0 ? (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 110, damping: 18 }}
            className="text-center py-20 glass-card rounded-[2rem]"
          >
            <FileText size={42} className="mx-auto mb-4 text-wayanad-muted opacity-30" />
            <p className="text-wayanad-text font-bold mb-2">No matching cases</p>
            <p className="text-wayanad-muted text-sm">
              {scopedReports.length === 0 ? emptyMessage : "Try clearing one of the filters to see more results."}
            </p>
          </motion.div>
        ) : (
          filteredReports.map((report, index) => (
            <motion.button
              key={report.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 110, damping: 18, delay: Math.min(index * 0.05, 0.4) }}
              onClick={() => navigate(`/my-reports/${report.id}`)}
              className="w-full text-left glass-card rounded-[1.8rem] p-5 md:p-6 group relative overflow-hidden hover-lift"
            >
              <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-emerald-500/15 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-5">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        {report.displayId}
                      </span>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-xl ${report.statusColor}`}>
                        {report.status}
                      </span>
                      {report.isSupporter && (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl text-cyan-400 bg-cyan-500/10 border border-cyan-500/20">
                          Supporting
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-black text-wayanad-text tracking-tight mb-2">
                      {report.issue}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-wayanad-muted">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} />
                        {report.location}
                      </span>
                      <span className="hidden md:inline text-white/10">•</span>
                      <span>{report.authorityLabel}</span>
                    </div>
                  </div>

                  <div className="text-left lg:text-right">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-wayanad-muted font-black mb-2">
                      Last Update
                    </p>
                    <p className="text-sm font-bold text-wayanad-text flex items-center gap-2 lg:justify-end">
                      <Clock3 size={14} className="text-emerald-500" />
                      {report.lastUpdatedLabel}
                    </p>
                    <p className="text-xs text-wayanad-muted mt-1">{report.lastUpdatedDateTime}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-wayanad-muted font-black mb-2">
                      What Happens Next
                    </p>
                    <p className="text-sm font-bold text-wayanad-text">{report.nextActionLabel}</p>
                    <p className="text-xs text-wayanad-muted mt-2 line-clamp-2">{report.nextActionDescription}</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-wayanad-muted font-black mb-2">
                      Latest Progress
                    </p>
                    <p className="text-sm font-bold text-wayanad-text line-clamp-2">
                      {report.latestUpdate?.note || report.statusMeaning}
                    </p>
                    <p className="text-xs text-wayanad-muted mt-2">
                      {report.latestUpdate?.actorLabel || report.authorityLabel}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-wayanad-muted font-black mb-2">
                      Community Support
                    </p>
                    <p className="text-sm font-bold text-wayanad-text flex items-center gap-2">
                      <Users size={15} className="text-emerald-500" />
                      {report.supportCount > 0 ? `${report.supportCount} supporters` : "Only your report"}
                    </p>
                    <p className="text-xs text-wayanad-muted mt-2 line-clamp-2">{report.communitySummary}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm">
                  <p className="text-wayanad-muted">
                    Submitted {report.submittedLabel}
                  </p>
                  <span className="text-emerald-500 font-bold flex items-center gap-1">
                    View case
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </motion.button>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default MyReports;
