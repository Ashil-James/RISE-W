import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  MapPin,
  Radio,
  Search,
  Send,
  Target,
} from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";
import ProximityMapPicker from "../../components/ProximityMapPicker";
import { useUser } from "../../context/UserContext";
import {
  AdminActionButton,
  AdminEmptyState,
  AdminPageHeader,
  AdminSurface,
} from "../../components/admin/AdminUI";
import {
  BROADCAST_CATEGORY_OPTIONS,
  BROADCAST_SEVERITY_OPTIONS,
  formatAdminDateTime,
  formatAdminRelativeTime,
} from "../../utils/adminPortal";

const ACTIVITY_FILTERS = [
  { value: "all", label: "All broadcasts" },
  { value: "active", label: "Active only" },
  { value: "history", label: "History only" },
];

const severityBadgeClass = (severity) => {
  if (severity === "High") return "bg-red-500/10 text-red-200 border border-red-500/20";
  if (severity === "Medium") return "bg-amber-500/10 text-amber-200 border border-amber-500/20";
  return "bg-sky-500/10 text-sky-200 border border-sky-500/20";
};

const Broadcasts = () => {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    title: "",
    type: "Public Safety",
    severity: "High",
    location: "",
    message: "",
  });
  const [isTargeted, setIsTargeted] = useState(false);
  const [targetCenter, setTargetCenter] = useState(null);
  const [targetRadiusKm, setTargetRadiusKm] = useState(1);
  const [broadcasts, setBroadcasts] = useState([]);
  const [summary, setSummary] = useState({ activeCount: 0, officialCount: 0, latestOfficial: null });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [activityFilter, setActivityFilter] = useState("all");

  const fetchBroadcasts = async () => {
    try {
      setLoading(true);
      setError("");
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const response = await axios.get("/api/v1/admin/broadcast", config);
      if (response.data.success) {
        setBroadcasts(response.data.data.items || []);
        setSummary(response.data.data.summary || {});
      }
    } catch (fetchError) {
      console.error(fetchError);
      setError(fetchError.response?.data?.message || "Failed to load broadcasts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchBroadcasts();
    }
  }, [user?.token]);

  const filteredBroadcasts = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return broadcasts.filter((broadcast) => {
      const matchesSearch = !needle
        ? true
        : [broadcast.title, broadcast.message, broadcast.location, broadcast.categoryLabel]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(needle));
      const matchesSeverity = severityFilter === "all" ? true : broadcast.severity === severityFilter;
      const matchesActivity =
        activityFilter === "all"
          ? true
          : activityFilter === "active"
            ? broadcast.isActive
            : !broadcast.isActive;

      return matchesSearch && matchesSeverity && matchesActivity;
    });
  }, [activityFilter, broadcasts, search, severityFilter]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback("");
    setError("");

    try {
      if (!formData.title.trim() || !formData.location.trim() || !formData.message.trim()) {
        throw new Error("Title, location, and message are required.");
      }

      if (isTargeted && !targetCenter) {
        throw new Error("Drop a pin on the map before sending a targeted broadcast.");
      }

      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.post(
        "/api/v1/admin/broadcast",
        {
          ...formData,
          targetArea: isTargeted
            ? {
                center: targetCenter,
                radiusKm: targetRadiusKm,
              }
            : null,
        },
        config,
      );

      setFeedback("Broadcast dispatched successfully.");
      setFormData({
        title: "",
        type: "Public Safety",
        severity: "High",
        location: "",
        message: "",
      });
      setIsTargeted(false);
      setTargetCenter(null);
      setTargetRadiusKm(1);
      await fetchBroadcasts();
    } catch (submitError) {
      console.error(submitError);
      setError(submitError.response?.data?.message || submitError.message || "Failed to send broadcast.");
    } finally {
      setSubmitting(false);
    }
  };

  const activeBroadcasts = filteredBroadcasts.filter((broadcast) => broadcast.isActive);
  const historicalBroadcasts = filteredBroadcasts.filter((broadcast) => !broadcast.isActive);

  return (
    <div className="pb-16">
      <AdminPageHeader
        title="Broadcast Center"
        description="Dispatch official alerts, monitor what is still active, and review exactly whether each broadcast was global or proximity-targeted."
        actions={
          <>
            <AdminActionButton variant="secondary" onClick={fetchBroadcasts}>
              Refresh History
            </AdminActionButton>
            <AdminActionButton onClick={() => document.getElementById("admin-broadcast-composer")?.scrollIntoView({ behavior: "smooth" })}>
              New Broadcast
            </AdminActionButton>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 mb-8">
        <AdminSurface className="p-6">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400/80">Active Alerts</p>
          <p className="mt-3 text-4xl font-black text-emerald-950 dark:text-white">{summary.activeCount || 0}</p>
          <p className="mt-2 text-[0.95rem] text-emerald-800 dark:text-slate-300/80 leading-snug">Official alerts still within their active window.</p>
        </AdminSurface>
        <AdminSurface className="p-6">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400/80">Official Broadcasts</p>
          <p className="mt-3 text-4xl font-black text-emerald-950 dark:text-white">{summary.officialCount || 0}</p>
          <p className="mt-2 text-[0.95rem] text-emerald-800 dark:text-slate-300/80 leading-snug">Dispatches created by admin or authority teams.</p>
        </AdminSurface>
        <AdminSurface className="p-6">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400/80">Latest Official Dispatch</p>
          <p className="mt-3 text-xl font-black text-emerald-950 dark:text-white">
            {summary.latestOfficial?.title || "No official broadcast yet"}
          </p>
          <p className="mt-2 text-[0.95rem] text-emerald-800 dark:text-slate-300/80 leading-snug">
            {summary.latestOfficial?.targetSummary || "Broadcasts you create here will appear in this feed."}
          </p>
        </AdminSurface>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_1fr]">
        <AdminSurface id="admin-broadcast-composer" className="p-5 md:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-2xl border border-emerald-900/10 dark:border-white/10 bg-emerald-900/5 dark:bg-white/[0.03] p-3 text-emerald-300">
              <Send size={18} />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-300/75">
                Compose Alert
              </p>
              <h2 className="mt-2 text-2xl font-black text-emerald-950 dark:text-white">Dispatch Broadcast</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-800/70 dark:text-slate-400/90 ml-2">Title</span>
                <input
                  value={formData.title}
                  onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))}
                  className="w-full rounded-[1.2rem] border border-transparent bg-emerald-900/5 dark:bg-white/[0.03] px-4 py-3.5 text-sm text-emerald-950 dark:text-white outline-none focus:border-emerald-500/30 focus:bg-emerald-500/5 transition-all placeholder:text-emerald-900/60 dark:text-slate-500"
                  placeholder="Emergency power maintenance"
                />
              </label>

              <label className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-800/70 dark:text-slate-400/90 ml-2">Location Label</span>
                <input
                  value={formData.location}
                  onChange={(event) => setFormData((current) => ({ ...current, location: event.target.value }))}
                  className="w-full rounded-[1.2rem] border border-transparent bg-emerald-900/5 dark:bg-white/[0.03] px-4 py-3.5 text-sm text-emerald-950 dark:text-white outline-none focus:border-emerald-500/30 focus:bg-emerald-500/5 transition-all placeholder:text-emerald-900/60 dark:text-slate-500"
                  placeholder="Sector B and surrounding wards"
                />
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-800/70 dark:text-slate-400/90 ml-2">Category</span>
                <select
                  value={formData.type}
                  onChange={(event) => setFormData((current) => ({ ...current, type: event.target.value }))}
                  className="w-full rounded-[1.2rem] border border-transparent bg-emerald-900/5 dark:bg-white/[0.03] px-4 py-3.5 text-sm text-emerald-950 dark:text-white outline-none focus:border-emerald-500/30 transition-all"
                >
                  {BROADCAST_CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value} className="bg-emerald-50 dark:bg-slate-950">
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-800/70 dark:text-slate-400/90 ml-2">Severity</span>
                <select
                  value={formData.severity}
                  onChange={(event) => setFormData((current) => ({ ...current, severity: event.target.value }))}
                  className="w-full rounded-[1.2rem] border border-transparent bg-emerald-900/5 dark:bg-white/[0.03] px-4 py-3.5 text-sm text-emerald-950 dark:text-white outline-none focus:border-emerald-500/30 transition-all"
                >
                  {BROADCAST_SEVERITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value} className="bg-emerald-50 dark:bg-slate-950">
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="space-y-2 block">
              <span className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-800/70 dark:text-slate-400/90 ml-2">Message</span>
              <textarea
                value={formData.message}
                onChange={(event) => setFormData((current) => ({ ...current, message: event.target.value }))}
                rows={5}
                className="w-full rounded-[1.2rem] border border-transparent bg-emerald-900/5 dark:bg-white/[0.03] px-4 py-3.5 text-sm text-emerald-950 dark:text-white outline-none focus:border-emerald-500/30 focus:bg-emerald-500/5 transition-all placeholder:text-emerald-900/60 dark:text-slate-500"
                placeholder="Describe the issue, the affected area, and any action the public should take."
              />
            </label>

            <div className="rounded-[1.5rem] border border-transparent bg-emerald-900/5 dark:bg-white/[0.02] hover:bg-emerald-900/5 hover:dark:hover:bg-white/[0.03] transition-colors p-5">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setIsTargeted(false)}
                  className={`rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                    !isTargeted
                      ? "bg-sky-500/15 text-sky-100 border border-sky-400/25"
                      : "bg-emerald-900/5 dark:bg-black/20 text-emerald-800 dark:text-slate-300 border border-emerald-900/10 dark:border-white/10"
                  }`}
                >
                  Global broadcast
                </button>
                <button
                  type="button"
                  onClick={() => setIsTargeted(true)}
                  className={`rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                    isTargeted
                      ? "bg-emerald-500/15 text-emerald-100 border border-emerald-400/25"
                      : "bg-emerald-900/5 dark:bg-black/20 text-emerald-800 dark:text-slate-300 border border-emerald-900/10 dark:border-white/10"
                  }`}
                >
                  Proximity targeted
                </button>
              </div>

              <p className="mt-3 text-sm text-emerald-800 dark:text-slate-300/75">
                {isTargeted
                  ? "Only residents inside the selected radius will receive the notification."
                  : "Everyone receiving official broadcasts will see this alert."}
              </p>

              {isTargeted ? (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4">
                  <ProximityMapPicker
                    center={targetCenter}
                    setCenter={setTargetCenter}
                    radiusKm={targetRadiusKm}
                    setRadiusKm={setTargetRadiusKm}
                  />
                </motion.div>
              ) : null}
            </div>

            {feedback ? (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                <CheckCircle2 size={16} className="inline mr-2" />
                {feedback}
              </div>
            ) : null}
            {error ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <AdminActionButton type="submit" disabled={submitting}>
                {submitting ? "Dispatching..." : "Dispatch Broadcast"}
              </AdminActionButton>
              <AdminActionButton
                variant="secondary"
                onClick={() => {
                  setFormData({
                    title: "",
                    type: "Public Safety",
                    severity: "High",
                    location: "",
                    message: "",
                  });
                  setIsTargeted(false);
                  setTargetCenter(null);
                  setTargetRadiusKm(1);
                  setFeedback("");
                  setError("");
                }}
              >
                Reset
              </AdminActionButton>
            </div>
          </form>
        </AdminSurface>

        <div className="space-y-4">
          <AdminSurface className="p-5 md:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-2xl border border-emerald-900/10 dark:border-white/10 bg-emerald-900/5 dark:bg-white/[0.03] p-3 text-emerald-300">
                <Radio size={18} />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-300/75">
                  Broadcast Feed
                </p>
                <h2 className="mt-2 text-2xl font-black text-emerald-950 dark:text-white">Active and History</h2>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
              <label className="rounded-2xl border border-emerald-900/10 dark:border-white/10 bg-emerald-900/5 dark:bg-black/20 px-4 py-3 flex items-center gap-3">
                <Search size={16} className="text-emerald-800/70 dark:text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search title, message, or area"
                  className="w-full bg-transparent text-sm text-emerald-950 dark:text-white outline-none placeholder:text-emerald-900/60 dark:text-slate-500"
                />
              </label>

              <select
                value={severityFilter}
                onChange={(event) => setSeverityFilter(event.target.value)}
                className="rounded-2xl border border-emerald-900/10 dark:border-white/10 bg-emerald-900/5 dark:bg-black/20 px-4 py-3 text-sm text-emerald-950 dark:text-white outline-none"
              >
                <option value="all">All severity</option>
                {BROADCAST_SEVERITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} className="bg-emerald-50 dark:bg-slate-950">
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={activityFilter}
                onChange={(event) => setActivityFilter(event.target.value)}
                className="rounded-2xl border border-emerald-900/10 dark:border-white/10 bg-emerald-900/5 dark:bg-black/20 px-4 py-3 text-sm text-emerald-950 dark:text-white outline-none"
              >
                {ACTIVITY_FILTERS.map((option) => (
                  <option key={option.value} value={option.value} className="bg-emerald-50 dark:bg-slate-950">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </AdminSurface>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <AdminSurface key={index} className="h-32 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <AdminEmptyState
              icon={Radio}
              title="Broadcast feed unavailable"
              description={error}
              action={<AdminActionButton onClick={fetchBroadcasts}>Try Again</AdminActionButton>}
            />
          ) : filteredBroadcasts.length === 0 ? (
            <AdminEmptyState
              icon={Radio}
              title="No broadcasts match this view"
              description="Change the search or filters to bring more broadcasts into the feed."
            />
          ) : (
            <>
              <section className="space-y-4">
                <div className="flex items-center justify-between ml-2">
                  <h3 className="text-[1.3rem] font-black text-emerald-950 dark:text-white">Active alerts</h3>
                  <span className="text-sm font-bold text-emerald-800/70 dark:text-slate-400">{activeBroadcasts.length}</span>
                </div>
                {activeBroadcasts.length === 0 ? (
                  <AdminSurface className="p-6 text-sm text-emerald-800/70 dark:text-slate-400/80">
                    No broadcasts are currently active.
                  </AdminSurface>
                ) : (
                  <div className="space-y-3">
                    {activeBroadcasts.map((broadcast) => (
                      <AdminSurface key={broadcast._id} className="p-6 border border-transparent hover:border-emerald-900/5 hover:dark:hover:border-white/5 transition-all">
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                          <span className={`rounded-xl px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] ${severityBadgeClass(broadcast.severity)}`}>
                            {broadcast.severity}
                          </span>
                          <span className="rounded-xl border border-emerald-900/5 dark:border-white/5 bg-emerald-900/10 dark:bg-white/[0.04] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-800 dark:text-slate-300">
                            {broadcast.targetScope}
                          </span>
                        </div>
                        <p className="text-xl font-black text-emerald-950 dark:text-white">{broadcast.title}</p>
                        <p className="mt-2 text-[0.95rem] text-emerald-800 dark:text-slate-300/80 leading-relaxed">{broadcast.message}</p>
                        <div className="mt-5 grid gap-4 lg:grid-cols-2">
                          <div className="rounded-[1.2rem] bg-emerald-900/5 dark:bg-white/[0.03] p-4">
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-900/60 dark:text-slate-500">
                              Reach
                            </p>
                            <p className="mt-2 text-sm font-bold text-emerald-950 dark:text-white">{broadcast.targetSummary}</p>
                          </div>
                          <div className="rounded-[1.2rem] bg-emerald-900/5 dark:bg-white/[0.03] p-4">
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-900/60 dark:text-slate-500">
                              Window
                            </p>
                            <p className="mt-2 text-sm font-bold text-emerald-950 dark:text-white">{formatAdminRelativeTime(broadcast.createdAt)}</p>
                            <p className="mt-1 text-xs text-emerald-900/60 dark:text-slate-500">
                              Expires {formatAdminDateTime(broadcast.expiresAt)}
                            </p>
                          </div>
                        </div>
                      </AdminSurface>
                    ))}
                  </div>
                )}
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between ml-2">
                  <h3 className="text-[1.3rem] font-black text-emerald-950 dark:text-white">History</h3>
                  <span className="text-sm font-bold text-emerald-800/70 dark:text-slate-400">{historicalBroadcasts.length}</span>
                </div>
                {historicalBroadcasts.length === 0 ? (
                  <AdminSurface className="p-6 text-sm text-emerald-800/70 dark:text-slate-400/80">
                    No older broadcasts match the current filters.
                  </AdminSurface>
                ) : (
                  <div className="space-y-3">
                    {historicalBroadcasts.map((broadcast) => (
                      <AdminSurface key={broadcast._id} className="p-6 border border-transparent hover:border-emerald-900/5 hover:dark:hover:border-white/5 transition-all">
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                          <span className={`rounded-xl px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] ${severityBadgeClass(broadcast.severity)}`}>
                            {broadcast.severity}
                          </span>
                          <span className="rounded-xl border border-emerald-900/5 dark:border-white/5 bg-emerald-900/10 dark:bg-white/[0.04] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-800 dark:text-slate-300">
                            {broadcast.targetScope}
                          </span>
                        </div>
                        <p className="text-xl font-black text-emerald-950 dark:text-white">{broadcast.title}</p>
                        <p className="mt-2 text-[0.95rem] text-emerald-800 dark:text-slate-300/80 leading-relaxed min-w-0">{broadcast.message}</p>
                        <div className="mt-5 flex flex-wrap gap-4 text-xs font-bold text-emerald-900/60 dark:text-slate-500">
                          <span className="inline-flex items-center gap-2">
                            <MapPin size={14} className="text-emerald-800/70 dark:text-slate-400" />
                            {broadcast.location}
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <Target size={14} className="text-emerald-800/70 dark:text-slate-400" />
                            {broadcast.targetSummary}
                          </span>
                          <span>{formatAdminDateTime(broadcast.createdAt)}</span>
                        </div>
                      </AdminSurface>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Broadcasts;
