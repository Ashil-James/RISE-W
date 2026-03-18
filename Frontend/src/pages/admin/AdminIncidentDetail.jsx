import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileText,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import axios from "axios";
import { useUser } from "../../context/UserContext";
import {
  AdminActionButton,
  AdminAuthorityBadge,
  AdminEmptyState,
  AdminPageHeader,
  AdminStatusBadge,
  AdminSurface,
  AdminUrgencyBadge,
} from "../../components/admin/AdminUI";
import {
  formatAdminDateTime,
  formatAdminRelativeTime,
  getAdminNextActionDescription,
  getAdminStatusMeta,
  getCommunitySupportLabel,
} from "../../utils/adminPortal";

const STATE_CALLOUTS = {
  REOPENED: {
    title: "Citizen rejected the fix",
    message: "The reporter marked the issue as unresolved, so the case is back with the authority for follow-up work.",
    tone: "border-red-500/20 bg-red-500/10 text-red-100",
  },
  REJECTED: {
    title: "Authority rejected the case",
    message: "Operational work has stopped. Review the rejection reason and timeline before deciding whether further action is needed.",
    tone: "border-rose-500/20 bg-rose-500/10 text-rose-100",
  },
  REVOKED: {
    title: "Citizen revoked the case",
    message: "The reporter withdrew the issue before authority acceptance, so this case is part of the ended queue rather than the active queue.",
    tone: "border-slate-500/20 bg-slate-500/10 text-slate-100",
  },
  CLOSED: {
    title: "Case fully closed",
    message: "The reporter confirmed the fix and the case has moved out of the operational queue.",
    tone: "border-emerald-500/20 bg-emerald-500/10 text-emerald-100",
  },
};

const AdminIncidentDetail = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        setLoading(true);
        setError("");
        const config = { headers: { Authorization: `Bearer ${user?.token}` } };
        const response = await axios.get(`/api/v1/admin/incident/${reportId}`, config);
        if (response.data.success) {
          setIncident(response.data.data);
        }
      } catch (fetchError) {
        console.error(fetchError);
        setError(fetchError.response?.data?.message || "Incident not found.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.token && reportId) {
      fetchIncident();
    }
  }, [reportId, user?.token]);

  const stateCallout = useMemo(
    () => STATE_CALLOUTS[incident?.status] || null,
    [incident?.status],
  );

  if (loading) {
    return (
      <div className="space-y-4 pb-16">
        {Array.from({ length: 3 }).map((_, index) => (
          <AdminSurface key={index} className="h-44 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!incident || error) {
    return (
      <AdminEmptyState
        icon={FileText}
        title="Incident not found"
        description={error || "This admin incident detail could not be loaded."}
        action={<AdminActionButton onClick={() => navigate("/admin/incidents")}>Back to Workspace</AdminActionButton>}
      />
    );
  }

  const latestUpdate = incident.latestUpdate;
  const latestAuthorityUpdate = [...(incident.statusHistory || [])]
    .reverse()
    .find((entry) => entry.actorRole === "AUTHORITY");
  const statusMeta = getAdminStatusMeta(incident.status);

  return (
    <div className="pb-16 space-y-6">
      <div className="flex items-center gap-3">
        <AdminActionButton variant="secondary" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} className="inline mr-2" />
          Back
        </AdminActionButton>
        <span className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-300">
          {incident.displayId}
        </span>
      </div>

      <AdminPageHeader
        title={incident.title}
        description={incident.description || statusMeta.summary}
        eyebrow="Incident Detail"
        actions={
          <>
            <AdminActionButton variant="secondary" onClick={() => navigate(`/admin/incidents?authority=${incident.assignedAuthority}`)}>
              Related Authority Queue
            </AdminActionButton>
            <AdminActionButton onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}>
              View Timeline
            </AdminActionButton>
          </>
        }
      />

      <AdminSurface className="p-6 md:p-7">
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <AdminStatusBadge status={incident.status} />
          <AdminUrgencyBadge urgency={incident.urgencyLevel} />
          <AdminAuthorityBadge authority={incident.assignedAuthority} />
        </div>

        <div className="grid gap-4 lg:grid-cols-5">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Reporter</p>
            <p className="mt-2 text-sm font-bold text-white">{incident.reporterName}</p>
            <p className="mt-1 text-xs text-slate-500">{incident.reporterEmail || "No email recorded"}</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Submitted</p>
            <p className="mt-2 text-sm font-bold text-white">{formatAdminDateTime(incident.createdAt)}</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Last Updated</p>
            <p className="mt-2 text-sm font-bold text-white">{formatAdminRelativeTime(incident.lastUpdatedAt)}</p>
            <p className="mt-1 text-xs text-slate-500">{formatAdminDateTime(incident.lastUpdatedAt)}</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Community Support</p>
            <p className="mt-2 text-sm font-bold text-white">{getCommunitySupportLabel(incident.supportCount)}</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Next Action</p>
            <p className="mt-2 text-sm font-bold text-white">{incident.nextActionLabel}</p>
            <p className="mt-1 text-xs text-slate-500">
              {getAdminNextActionDescription(incident.status, incident.nextActionOwner)}
            </p>
          </div>
        </div>

        {stateCallout ? (
          <div className={`mt-5 rounded-[1.5rem] border px-4 py-4 ${stateCallout.tone}`}>
            <p className="text-sm font-black uppercase tracking-[0.18em]">{stateCallout.title}</p>
            <p className="mt-2 text-sm">{stateCallout.message}</p>
          </div>
        ) : null}
      </AdminSurface>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.9fr]">
        <div className="space-y-6">
          <AdminSurface className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck size={18} className="text-emerald-300" />
              <h2 className="text-xl font-black text-white">What this status means</h2>
            </div>
            <p className="text-base font-bold text-white">{statusMeta.summary}</p>
            <p className="mt-3 text-sm text-slate-300/80">
              {latestUpdate?.note || getAdminNextActionDescription(incident.status, incident.nextActionOwner)}
            </p>
          </AdminSurface>

          <AdminSurface className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={18} className="text-emerald-300" />
              <h2 className="text-xl font-black text-white">Evidence and updates</h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 mb-3">Reported image</p>
                {incident.image ? (
                  <button
                    type="button"
                    onClick={() => window.open(incident.image, "_blank")}
                    className="block w-full overflow-hidden rounded-[1.3rem] border border-white/10 text-left"
                  >
                    <img src={incident.image} alt="Reported issue" className="h-60 w-full object-cover" />
                    <div className="flex items-center justify-between px-4 py-3 text-sm text-white bg-black/30">
                      <span>Open original upload</span>
                      <ExternalLink size={14} />
                    </div>
                  </button>
                ) : (
                  <p className="text-sm text-slate-400">No citizen image was attached.</p>
                )}
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 mb-3">Authority proof</p>
                {incident.resolutionImage ? (
                  <button
                    type="button"
                    onClick={() => window.open(incident.resolutionImage, "_blank")}
                    className="block w-full overflow-hidden rounded-[1.3rem] border border-white/10 text-left"
                  >
                    <img src={incident.resolutionImage} alt="Resolution proof" className="h-60 w-full object-cover" />
                    <div className="flex items-center justify-between px-4 py-3 text-sm text-white bg-black/30">
                      <span>Open resolution proof</span>
                      <ExternalLink size={14} />
                    </div>
                  </button>
                ) : (
                  <p className="text-sm text-slate-400">No authority proof image is attached yet.</p>
                )}
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Authority note</p>
                <p className="mt-3 text-sm text-white">
                  {incident.authorityMessage || latestAuthorityUpdate?.note || "No authority note attached yet."}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Location</p>
                <p className="mt-3 flex items-center gap-2 text-sm text-white">
                  <MapPin size={14} className="text-emerald-300" />
                  {incident.address || "Location unavailable"}
                </p>
                {incident.location?.coordinates ? (
                  <p className="mt-2 text-xs text-slate-500">
                    {incident.location.coordinates[1]?.toFixed(5)}, {incident.location.coordinates[0]?.toFixed(5)}
                  </p>
                ) : null}
              </div>
            </div>

            {incident.rejectionReason ? (
              <div className="mt-4 rounded-[1.5rem] border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100">
                <p className="font-black uppercase tracking-[0.18em]">Rejection reason</p>
                <p className="mt-2">{incident.rejectionReason}</p>
              </div>
            ) : null}
          </AdminSurface>
        </div>

        <div className="space-y-6">
          <AdminSurface className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users size={18} className="text-emerald-300" />
              <h2 className="text-xl font-black text-white">Operational summary</h2>
            </div>
            <div className="space-y-4">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Current status</p>
                <p className="mt-2 text-sm font-bold text-white">{statusMeta.label}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Latest update owner</p>
                <p className="mt-2 text-sm font-bold text-white">{latestUpdate?.actorLabel || "System"}</p>
                <p className="mt-1 text-xs text-slate-500">{formatAdminDateTime(latestUpdate?.changedAt)}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Community impact</p>
                <p className="mt-2 text-sm font-bold text-white">{getCommunitySupportLabel(incident.supportCount)}</p>
              </div>
            </div>
          </AdminSurface>
        </div>
      </div>

      <AdminSurface className="p-6">
        <h2 className="text-2xl font-black text-white mb-5">Status Timeline</h2>
        <div className="space-y-4">
          {(incident.statusHistory || []).map((entry, index) => {
            const isLatest = index === (incident.statusHistory?.length || 1) - 1;
            const entryMeta = getAdminStatusMeta(entry.status);

            return (
              <div
                key={`${entry.status}-${entry.changedAt}-${index}`}
                className={`rounded-[1.6rem] border p-5 ${
                  isLatest
                    ? "border-emerald-400/20 bg-emerald-500/10"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`rounded-xl px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] ${entryMeta.badgeClass}`}>
                        {entryMeta.label}
                      </span>
                      {isLatest ? (
                        <span className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-300">
                          Latest
                        </span>
                      ) : null}
                    </div>
                    <p className="text-base font-bold text-white">{entry.note || entryMeta.summary}</p>
                    <p className="mt-2 text-sm text-slate-300/75">
                      {entry.actorLabel} · {formatAdminDateTime(entry.changedAt)}
                    </p>
                  </div>
                  <div className="shrink-0 text-sm text-slate-400">
                    {formatAdminRelativeTime(entry.changedAt)}
                  </div>
                </div>

                {entry.proofImage ? (
                  <button
                    type="button"
                    onClick={() => window.open(entry.proofImage, "_blank")}
                    className="mt-4 block overflow-hidden rounded-[1.3rem] border border-white/10 text-left"
                  >
                    <img src={entry.proofImage} alt={`${entry.status} proof`} className="h-56 w-full object-cover" />
                    <div className="flex items-center justify-between bg-black/30 px-4 py-3 text-sm text-white">
                      <span>Open attached proof</span>
                      <ExternalLink size={14} />
                    </div>
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </AdminSurface>
    </div>
  );
};

export default AdminIncidentDetail;
