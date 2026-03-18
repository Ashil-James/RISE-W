import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, FileText, RefreshCw } from "lucide-react";
import axios from "axios";
import { useUser } from "../../context/UserContext";
import {
  AdminActionButton,
  AdminAuthorityBadge,
  AdminEmptyState,
  AdminPageHeader,
  AdminRowLink,
  AdminStatusBadge,
  AdminSurface,
  AdminUrgencyBadge,
} from "../../components/admin/AdminUI";
import { AUTHORITY_OPTIONS, formatAdminDateTime } from "../../utils/adminPortal";

const AdminAuthorities = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAuthority, setSelectedAuthority] = useState("WATER");
  const [workload, setWorkload] = useState([]);
  const [preview, setPreview] = useState([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const fetchAuthorities = async () => {
      try {
        setLoading(true);
        setError("");
        const config = { headers: { Authorization: `Bearer ${user?.token}` } };
        const [statsResponse, previewResponse] = await Promise.all([
          axios.get("/api/v1/admin/stats", config),
          axios.get("/api/v1/admin/incident", {
            ...config,
            params: {
              authority: selectedAuthority,
              sort: "highest_urgency",
              limit: 6,
            },
          }),
        ]);

        if (statsResponse.data.success) {
          setWorkload(statsResponse.data.data.authorityWorkload || []);
        }

        if (previewResponse.data.success) {
          setPreview(previewResponse.data.data.items || []);
        }
      } catch (fetchError) {
        console.error(fetchError);
        setError(fetchError.response?.data?.message || "Failed to load authority board.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchAuthorities();
    }
  }, [reloadKey, selectedAuthority, user?.token]);

  const selectedWorkload = useMemo(
    () => workload.find((item) => item.authority === selectedAuthority) || null,
    [selectedAuthority, workload],
  );

  const openAuthorityQueue = (authority) => {
    navigate(`/admin/incidents?authority=${authority}`);
  };

  return (
    <div className="pb-16">
      <AdminPageHeader
        title="Authority Board"
        description="Monitor workload by department first, then drill into the operational queue for any specific authority."
        actions={
          <>
            <AdminActionButton variant="secondary" onClick={() => navigate("/admin/incidents")}>
              Open Incident Workspace
            </AdminActionButton>
            <AdminActionButton onClick={() => openAuthorityQueue(selectedAuthority)}>
              Open Selected Queue
            </AdminActionButton>
          </>
        }
      />

      {loading ? (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <AdminSurface key={index} className="h-56 animate-pulse" />
            ))}
          </div>
          <AdminSurface className="h-80 animate-pulse" />
        </div>
      ) : error ? (
        <AdminEmptyState
          icon={Building2}
          title="Authority board unavailable"
          description={error}
          action={<AdminActionButton onClick={() => window.location.reload()}>Reload</AdminActionButton>}
        />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-3 mb-6">
            {AUTHORITY_OPTIONS.map((authority) => {
              const item = workload.find((entry) => entry.authority === authority.value);
              const active = selectedAuthority === authority.value;

              return (
                <div
                  key={authority.value}
                  onClick={() => setSelectedAuthority(authority.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedAuthority(authority.value);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className={`rounded-[1.8rem] border p-5 text-left transition-all ${
                    active
                      ? "border-emerald-400/25 bg-emerald-500/10"
                      : "border-white/10 bg-white/[0.03] hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <AdminAuthorityBadge authority={authority.value} />
                    <span className="text-sm font-bold text-white">{item?.activeCount || 0} active</span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                        Reopened
                      </p>
                      <p className="mt-2 text-2xl font-black text-white">{item?.reopenedCount || 0}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                        Awaiting Citizen
                      </p>
                      <p className="mt-2 text-2xl font-black text-white">{item?.awaitingCitizenCount || 0}</p>
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-slate-300/75">
                    <p className="font-bold text-white">
                      Oldest pending: {item?.oldestPendingCase?.reportId || "None"}
                    </p>
                    {item?.oldestPendingCase ? (
                      <p className="mt-1 text-xs text-slate-500">
                        {item.oldestPendingCase.title}
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-5 flex justify-between gap-3">
                    <AdminActionButton variant="subtle" onClick={() => openAuthorityQueue(authority.value)} className="w-full">
                      Open Queue
                    </AdminActionButton>
                  </div>
                </div>
              );
            })}
          </div>

          <AdminSurface className="overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-300/75">
                  Queue Preview
                </p>
                <h2 className="mt-2 text-2xl font-black text-white">
                  {selectedWorkload?.authorityLabel || "Authority"} workload
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <AdminActionButton variant="subtle" onClick={() => openAuthorityQueue(selectedAuthority)}>
                  View All Incidents
                </AdminActionButton>
                <AdminActionButton variant="subtle" onClick={() => setReloadKey((value) => value + 1)}>
                  <RefreshCw size={15} className="inline mr-2" />
                  Refresh
                </AdminActionButton>
              </div>
            </div>

            {preview.length === 0 ? (
              <div className="p-6">
                <AdminEmptyState
                  icon={FileText}
                  title="No incidents for this authority"
                  description="Change the selected authority or open the full incident workspace to see other queues."
                />
              </div>
            ) : (
              <div className="divide-y divide-white/6">
                {preview.map((incident) => (
                  <button
                    key={incident.id}
                    type="button"
                    onClick={() => navigate(`/admin/incident/${incident.displayId}`)}
                    className="w-full px-5 py-5 text-left transition-colors hover:bg-white/[0.03] md:px-6"
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-300">
                        {incident.displayId}
                      </span>
                      <AdminStatusBadge status={incident.status} />
                      <AdminUrgencyBadge urgency={incident.urgencyLevel} />
                    </div>

                    <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr_0.9fr]">
                      <div>
                        <p className="text-lg font-black text-white">{incident.title}</p>
                        <p className="mt-2 text-sm text-slate-300/75">{incident.address || "Location unavailable"}</p>
                        <p className="mt-2 text-xs text-slate-500">
                          {incident.reporterName} · {formatAdminDateTime(incident.createdAt)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-bold text-white">{incident.nextActionLabel}</p>
                        <p className="mt-2 text-xs text-slate-400 line-clamp-3">
                          {incident.latestUpdate?.note || "No update note available."}
                        </p>
                      </div>

                      <div className="flex items-start justify-between gap-4 lg:justify-end">
                        <p className="text-sm text-slate-300/75">
                          {incident.supportCount} support
                        </p>
                        <AdminRowLink label="View Case" onClick={() => navigate(`/admin/incident/${incident.displayId}`)} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </AdminSurface>
        </>
      )}
    </div>
  );
};

export default AdminAuthorities;
