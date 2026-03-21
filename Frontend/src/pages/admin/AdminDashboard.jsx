import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Radio,
  ShieldAlert,
  Users,
} from "lucide-react";
import axios from "axios";
import {
  AdminActionButton,
  AdminAuthorityBadge,
  AdminEmptyState,
  AdminPageHeader,
  AdminRowLink,
  AdminStatCard,
  AdminStatusBadge,
  AdminSurface,
  AdminUrgencyBadge,
} from "../../components/admin/AdminUI";
import { useUser } from "../../context/UserContext";
import {
  formatAdminDateTime,
  formatAdminRelativeTime,
  getCommunitySupportLabel,
} from "../../utils/adminPortal";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");
        const config = { headers: { Authorization: `Bearer ${user?.token}` } };
        const [statsResponse, queueResponse] = await Promise.all([
          axios.get("/api/v1/admin/stats", config),
          axios.get("/api/v1/admin/incident", {
            ...config,
            params: { bucket: "needs_attention", sort: "highest_urgency", limit: 5 },
          }),
        ]);

        if (statsResponse.data.success) {
          setStats(statsResponse.data.data);
        }

        if (queueResponse.data.success) {
          setQueue(queueResponse.data.data.items || []);
        }
      } catch (fetchError) {
        console.error(fetchError);
        setError(fetchError.response?.data?.message || "Failed to load admin dashboard.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchDashboard();
    }
  }, [user?.token]);

  const overview = stats?.overview || {};
  const workload = stats?.authorityWorkload || [];
  const broadcasts = stats?.broadcasts || {};
  const resolutionRate = useMemo(() => {
    const total = overview.totalIncidents || 0;
    if (!total) return 0;
    return Math.round((((overview.closed || 0) + (overview.awaitingCitizen || 0)) / total) * 100);
  }, [overview.awaitingCitizen, overview.closed, overview.totalIncidents]);

  const openWorkspace = (params = {}) => {
    const search = new URLSearchParams(params);
    navigate(`/admin/incidents${search.toString() ? `?${search.toString()}` : ""}`);
  };

  return (
    <div className="pb-16">
      <AdminPageHeader
        title="Admin Dashboard"
        description="Use the control center to jump straight into the queues, authority teams, and broadcasts that need attention right now."
        actions={
          <>
            <AdminActionButton variant="secondary" onClick={() => navigate("/admin/broadcasts")}>
              Open Broadcast Center
            </AdminActionButton>
            <AdminActionButton onClick={() => openWorkspace({ bucket: "needs_attention" })}>
              Open Incident Workspace
            </AdminActionButton>
          </>
        }
      />

      {loading ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <AdminSurface key={index} className="h-36 animate-pulse" />
            ))}
          </div>
          <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
            <AdminSurface className="h-96 animate-pulse" />
            <AdminSurface className="h-96 animate-pulse" />
          </div>
        </div>
      ) : error ? (
        <AdminEmptyState
          icon={ShieldAlert}
          title="Dashboard unavailable"
          description={error}
          action={<AdminActionButton onClick={() => window.location.reload()}>Reload</AdminActionButton>}
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5 mb-6">
            <AdminStatCard
              title="Total Incidents"
              value={overview.totalIncidents || 0}
              description="All reported cases in the system."
              icon={Activity}
              tone="sky"
              onClick={() => openWorkspace()}
            />
            <AdminStatCard
              title="Needs Attention"
              value={overview.needsAttention || 0}
              description="Open or reopened cases requiring intervention."
              icon={AlertTriangle}
              tone="amber"
              onClick={() => openWorkspace({ bucket: "needs_attention" })}
            />
            <AdminStatCard
              title="With Authority"
              value={overview.withAuthority || 0}
              description="Accepted or in-progress authority work."
              icon={ShieldAlert}
              tone="emerald"
              onClick={() => openWorkspace({ bucket: "with_authority" })}
            />
            <AdminStatCard
              title="Awaiting Citizen"
              value={overview.awaitingCitizen || 0}
              description="Resolved cases waiting for citizen confirmation."
              icon={CheckCircle2}
              tone="sky"
              onClick={() => openWorkspace({ bucket: "awaiting_citizen" })}
            />
            <AdminStatCard
              title="Residents"
              value={overview.totalResidents || 0}
              description={`${resolutionRate}% resolution coverage across the incident portfolio.`}
              icon={Users}
              tone="slate"
              onClick={() => navigate("/admin/users")}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
            <AdminSurface className="overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-emerald-900/5 dark:border-white/5 px-6 py-6 md:px-8">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400/80">
                    Needs Attention
                  </p>
                  <h2 className="mt-1 text-[1.6rem] font-black text-emerald-950 dark:text-white">Priority Queue</h2>
                </div>
                <AdminActionButton variant="subtle" onClick={() => openWorkspace({ bucket: "needs_attention" })}>
                  View All
                </AdminActionButton>
              </div>

              {queue.length === 0 ? (
                <div className="p-6">
                  <AdminEmptyState
                    icon={CheckCircle2}
                    title="No urgent admin queue"
                    description="Open and reopened incidents will appear here once they need admin attention."
                  />
                </div>
              ) : (
                <div className="p-4 space-y-2">
                  {queue.map((incident) => (
                    <button
                      key={incident.id}
                      type="button"
                      onClick={() => navigate(`/admin/incident/${incident.displayId}`)}
                      className="w-full rounded-2xl p-5 text-left transition-all duration-300 hover:bg-emerald-900/5 hover:dark:hover:bg-white/[0.03] group border border-transparent hover:border-emerald-900/5 hover:dark:hover:border-white/5 md:px-6"
                    >
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="rounded-[0.5rem] border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-emerald-400">
                          {incident.displayId}
                        </span>
                        <AdminStatusBadge status={incident.status} />
                        <AdminUrgencyBadge urgency={incident.urgencyLevel} />
                      </div>

                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                          <p className="text-[1.1rem] font-black text-emerald-950 dark:text-white group-hover:text-emerald-300 transition-colors">{incident.title}</p>
                          <p className="mt-1.5 text-[0.9rem] text-emerald-800 dark:text-slate-300/80">
                            {incident.address || "Location unavailable"}
                          </p>
                          <div className="mt-3 flex flex-wrap items-center gap-2.5 text-[11px] font-bold text-emerald-900/60 dark:text-slate-500">
                            <span>{incident.reporterName}</span>
                            <span className="opacity-50">•</span>
                            <span>{getCommunitySupportLabel(incident.supportCount)}</span>
                            <span className="opacity-50">•</span>
                            <span>{formatAdminDateTime(incident.createdAt)}</span>
                          </div>
                        </div>

                        <div className="shrink-0 text-left lg:text-right flex lg:flex-col items-center lg:items-end justify-between gap-3">
                          <AdminAuthorityBadge authority={incident.assignedAuthority} />
                          <div className="flex flex-col items-end">
                            <p className="text-sm font-bold text-emerald-950 dark:text-white">
                              {formatAdminRelativeTime(incident.lastUpdatedAt)}
                            </p>
                            <p className="mt-1 max-w-xs text-xs text-emerald-800/70 dark:text-slate-400/80 line-clamp-1">
                              {incident.latestUpdate?.note || "No update note available."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </AdminSurface>

            <div className="space-y-4">
              <AdminSurface className="p-5 md:p-6">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400/80">
                      Authority Workload
                    </p>
                    <h2 className="mt-1 text-[1.6rem] font-black text-emerald-950 dark:text-white">Department Overview</h2>
                  </div>
                  <AdminActionButton variant="subtle" onClick={() => navigate("/admin/authorities")}>
                    Detailed Board
                  </AdminActionButton>
                </div>

                <div className="mt-5 space-y-3">
                  {workload.map((authority) => (
                    <button
                      key={authority.authority}
                      type="button"
                      onClick={() => openWorkspace({ authority: authority.authority })}
                      className="w-full rounded-[1.4rem] border border-emerald-900/10 dark:border-white/10 bg-emerald-900/5 dark:bg-white/[0.03] p-4 text-left transition-colors hover:bg-emerald-900/10 hover:dark:hover:bg-white/[0.05]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <AdminAuthorityBadge authority={authority.authority} />
                        <span className="text-sm font-bold text-emerald-950 dark:text-white">
                          {authority.activeCount} active
                        </span>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-900/60 dark:text-slate-500">
                            Reopened
                          </p>
                          <p className="mt-2 font-bold text-emerald-950 dark:text-white">{authority.reopenedCount}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-900/60 dark:text-slate-500">
                            Awaiting Citizen
                          </p>
                          <p className="mt-2 font-bold text-emerald-950 dark:text-white">{authority.awaitingCitizenCount}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-900/60 dark:text-slate-500">
                            Oldest Pending
                          </p>
                          <p className="mt-2 font-bold text-emerald-950 dark:text-white">
                            {authority.oldestPendingCase
                              ? authority.oldestPendingCase.reportId
                              : "None"}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </AdminSurface>

              <AdminSurface className="p-5 md:p-6">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400/80">
                      Broadcast Status
                    </p>
                    <h2 className="mt-1 text-[1.6rem] font-black text-emerald-950 dark:text-white">Official Alerts</h2>
                  </div>
                  <div className="rounded-[0.8rem] border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-[0.85rem] font-bold text-red-300">
                    {broadcasts.activeCount || 0} active
                  </div>
                </div>

                <div className="mt-4 rounded-3xl border border-transparent bg-emerald-900/5 dark:bg-white/[0.02] hover:bg-emerald-900/5 hover:dark:hover:bg-white/[0.03] transition-colors p-5">
                  <div className="flex items-center gap-2.5 text-xs font-black uppercase tracking-widest text-emerald-400 mb-2">
                    <Radio size={14} className="text-emerald-400" />
                    Latest dispatch
                  </div>
                  {broadcasts.latestOfficial ? (
                    <>
                      <p className="text-lg font-black text-emerald-950 dark:text-white leading-tight">
                        {broadcasts.latestOfficial.title}
                      </p>
                      <p className="mt-2 text-sm text-emerald-800 dark:text-slate-300/80">
                        {broadcasts.latestOfficial.targetSummary}
                      </p>
                      <p className="mt-2 text-xs text-emerald-900/60 dark:text-slate-500">
                        {formatAdminDateTime(broadcasts.latestOfficial.createdAt)}
                      </p>
                    </>
                  ) : (
                    <p className="mt-3 text-sm text-emerald-800/70 dark:text-slate-400">
                      No official broadcasts have been dispatched yet.
                    </p>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <AdminActionButton variant="secondary" onClick={() => navigate("/admin/broadcasts")}>
                    Manage Broadcasts
                  </AdminActionButton>
                  <AdminActionButton variant="subtle" onClick={() => openWorkspace({ community: "supported", sort: "most_supported" })}>
                    Most Supported Cases
                  </AdminActionButton>
                </div>
              </AdminSurface>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
