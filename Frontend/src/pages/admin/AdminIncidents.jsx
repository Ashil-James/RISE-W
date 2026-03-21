import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Clock3,
  FileText,
  MapPin,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";
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
import {
  AUTHORITY_OPTIONS,
  COMMUNITY_FILTER_OPTIONS,
  INCIDENT_BUCKET_OPTIONS,
  INCIDENT_SORT_OPTIONS,
  URGENCY_FILTER_OPTIONS,
  formatAdminDate,
  formatAdminDateTime,
  formatAdminRelativeTime,
  getCommunitySupportLabel,
} from "../../utils/adminPortal";

const DEFAULT_QUERY = {
  bucket: "all",
  authority: "all",
  status: "all",
  urgency: "all",
  community: "all",
  sort: "newest",
  search: "",
  page: "1",
};

const AdminIncidents = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useUser();
  const [data, setData] = useState({ items: [], counts: { buckets: {} }, meta: { page: 1, totalPages: 1, totalItems: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const query = useMemo(
    () => ({
      bucket: searchParams.get("bucket") || DEFAULT_QUERY.bucket,
      authority: searchParams.get("authority") || DEFAULT_QUERY.authority,
      status: searchParams.get("status") || DEFAULT_QUERY.status,
      urgency: searchParams.get("urgency") || DEFAULT_QUERY.urgency,
      community: searchParams.get("community") || DEFAULT_QUERY.community,
      sort: searchParams.get("sort") || DEFAULT_QUERY.sort,
      search: searchParams.get("search") || DEFAULT_QUERY.search,
      page: searchParams.get("page") || DEFAULT_QUERY.page,
    }),
    [searchParams],
  );

  const updateQuery = (patch) => {
    const next = new URLSearchParams(searchParams);
    const merged = { ...query, ...patch };

    Object.entries(merged).forEach(([key, value]) => {
      const normalized = `${value ?? ""}`;
      if (!normalized || normalized === DEFAULT_QUERY[key]) {
        next.delete(key);
      } else {
        next.set(key, normalized);
      }
    });

    if (!Object.prototype.hasOwnProperty.call(patch, "page")) {
      if (DEFAULT_QUERY.page === "1") {
        next.delete("page");
      } else {
        next.set("page", "1");
      }
    }

    setSearchParams(next);
  };

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        setLoading(true);
        setError("");
        const config = { headers: { Authorization: `Bearer ${user?.token}` } };
        const response = await axios.get("/api/v1/admin/incident", {
          ...config,
          params: {
            bucket: query.bucket,
            authority: query.authority !== "all" ? query.authority : undefined,
            status: query.status !== "all" ? query.status : undefined,
            urgency: query.urgency !== "all" ? query.urgency : undefined,
            community: query.community !== "all" ? query.community : undefined,
            search: query.search || undefined,
            sort: query.sort,
            page: query.page,
            limit: 12,
          },
        });

        if (response.data.success) {
          setData(response.data.data);
        }
      } catch (fetchError) {
        console.error(fetchError);
        setError(fetchError.response?.data?.message || "Failed to load incidents.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchIncidents();
    }
  }, [query, reloadKey, user?.token]);

  const counts = data.counts || {};
  const items = data.items || [];
  const meta = data.meta || {};
  const statusOptions = useMemo(() => {
    const statuses = Object.keys(counts.statuses || {});
    return statuses.map((status) => ({ value: status, label: status.replace(/_/g, " ") }));
  }, [counts.statuses]);

  return (
    <div className="pb-16">
      <AdminPageHeader
        title="Incident Workspace"
        description="Run triage, follow authority progress, and keep the admin side focused on cases that need intervention next."
        actions={
          <>
            <AdminActionButton variant="secondary" onClick={() => navigate("/admin/authorities")}>
              Authority Workload
            </AdminActionButton>
            <AdminActionButton onClick={() => setReloadKey((value) => value + 1)}>
              Refresh Queue
            </AdminActionButton>
          </>
        }
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 mb-6">
        {INCIDENT_BUCKET_OPTIONS.map((option) => {
          const value = option.value === "all" ? counts.total || 0 : counts.buckets?.[option.value] || 0;
          const active = query.bucket === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => updateQuery({ bucket: option.value })}
              className={`text-left rounded-[2rem] border px-6 py-5 transition-all duration-300 ${
                active
                  ? "border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent shadow-[0_8px_30px_rgba(16,185,129,0.15)]"
                  : "border-emerald-900/5 dark:border-white/5 bg-emerald-900/5 dark:bg-white/[0.02] hover:bg-emerald-900/10 hover:dark:hover:bg-white/[0.04] hover:border-emerald-900/10 hover:dark:hover:border-white/10"
              }`}
            >
              <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-400/80 font-black">
                {option.label}
              </p>
              <p className="mt-3 text-4xl font-black text-emerald-950 dark:text-white">{value}</p>
            </button>
          );
        })}
      </div>

      <AdminSurface className="p-4 md:p-6 mb-8">
        <div className="grid gap-3 lg:grid-cols-[1.5fr_repeat(5,minmax(0,1fr))]">
          <label className="rounded-[1.2rem] border border-transparent bg-emerald-900/5 dark:bg-white/[0.03] hover:bg-emerald-900/10 hover:dark:hover:bg-white/[0.05] focus-within:border-emerald-500/30 focus-within:bg-emerald-500/5 transition-all px-4 py-3 flex items-center gap-3">
            <Search size={16} className="text-emerald-400" />
            <input
              value={query.search}
              onChange={(event) => updateQuery({ search: event.target.value })}
              placeholder="Search by report ID, title, location, or reporter"
              className="w-full bg-transparent text-[0.95rem] text-emerald-950 dark:text-white outline-none placeholder:text-emerald-900/60 dark:text-slate-500"
            />
          </label>

          <select
            value={query.authority}
            onChange={(event) => updateQuery({ authority: event.target.value })}
            className="rounded-[1.2rem] border border-transparent bg-emerald-900/5 dark:bg-white/[0.03] hover:bg-emerald-900/10 hover:dark:hover:bg-white/[0.05] focus:border-emerald-500/30 transition-all px-4 py-3 text-[0.95rem] text-emerald-950 dark:text-white outline-none"
          >
            <option value="all">All authorities</option>
            {AUTHORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="bg-emerald-50 dark:bg-slate-950">
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={query.status}
            onChange={(event) => updateQuery({ status: event.target.value })}
            className="rounded-[1.2rem] border border-transparent bg-emerald-900/5 dark:bg-white/[0.03] hover:bg-emerald-900/10 hover:dark:hover:bg-white/[0.05] focus:border-emerald-500/30 transition-all px-4 py-3 text-[0.95rem] text-emerald-950 dark:text-white outline-none"
          >
            <option value="all">All statuses</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-emerald-50 dark:bg-slate-950">
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={query.urgency}
            onChange={(event) => updateQuery({ urgency: event.target.value })}
            className="rounded-[1.2rem] border border-transparent bg-emerald-900/5 dark:bg-white/[0.03] hover:bg-emerald-900/10 hover:dark:hover:bg-white/[0.05] focus:border-emerald-500/30 transition-all px-4 py-3 text-[0.95rem] text-emerald-950 dark:text-white outline-none"
          >
            {URGENCY_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="bg-emerald-50 dark:bg-slate-950">
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={query.community}
            onChange={(event) => updateQuery({ community: event.target.value })}
            className="rounded-[1.2rem] border border-transparent bg-emerald-900/5 dark:bg-white/[0.03] hover:bg-emerald-900/10 hover:dark:hover:bg-white/[0.05] focus:border-emerald-500/30 transition-all px-4 py-3 text-[0.95rem] text-emerald-950 dark:text-white outline-none"
          >
            {COMMUNITY_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="bg-emerald-50 dark:bg-slate-950">
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={query.sort}
            onChange={(event) => updateQuery({ sort: event.target.value })}
            className="rounded-[1.2rem] border border-transparent bg-emerald-900/5 dark:bg-white/[0.03] hover:bg-emerald-900/10 hover:dark:hover:bg-white/[0.05] focus:border-emerald-500/30 transition-all px-4 py-3 text-[0.95rem] text-emerald-950 dark:text-white outline-none"
          >
            {INCIDENT_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="bg-emerald-50 dark:bg-slate-950">
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-emerald-800 dark:text-slate-300/75">
            Showing <span className="font-bold text-emerald-950 dark:text-white">{items.length}</span> of{" "}
            <span className="font-bold text-emerald-950 dark:text-white">{meta.totalItems || 0}</span> matching incidents.
          </p>
          <div className="flex flex-wrap gap-3">
            <AdminActionButton variant="subtle" onClick={() => setSearchParams(new URLSearchParams())}>
              Clear Filters
            </AdminActionButton>
            <AdminActionButton variant="subtle" onClick={() => setReloadKey((value) => value + 1)}>
              <RefreshCw size={15} className="inline mr-2" />
              Reload
            </AdminActionButton>
          </div>
        </div>
      </AdminSurface>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <AdminSurface key={index} className="h-28 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <AdminEmptyState
          icon={FileText}
          title="Incident workspace is unavailable"
          description={error}
          action={<AdminActionButton onClick={() => updateQuery({})}>Try Again</AdminActionButton>}
        />
      ) : items.length === 0 ? (
        <AdminEmptyState
          icon={FileText}
          title="No incidents match this view"
          description="Try changing a filter or switching to a different bucket to bring more cases into view."
          action={<AdminActionButton variant="secondary" onClick={() => setSearchParams(new URLSearchParams())}>Clear Filters</AdminActionButton>}
        />
      ) : (
        <>
          <AdminSurface className="hidden lg:block overflow-hidden p-3">
            <div className="grid grid-cols-[2.2fr_1.1fr_1.1fr_0.9fr_1.2fr_1fr] gap-4 border-b border-emerald-900/5 dark:border-white/5 px-6 py-5 mx-2 text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400/80">
              <span>Case</span>
              <span>Authority</span>
              <span>Status</span>
              <span>Support</span>
              <span>Latest Update</span>
              <span className="text-right">Action</span>
            </div>

            <div className="py-2">
              {items.map((incident) => (
                <button
                  key={incident.id}
                  type="button"
                  onClick={() => navigate(`/admin/incident/${incident.displayId}`)}
                  className="grid w-full grid-cols-[2.2fr_1.1fr_1.1fr_0.9fr_1.2fr_1fr] gap-4 rounded-2xl border border-transparent hover:border-emerald-900/5 hover:dark:hover:border-white/5 px-8 py-5 text-left transition-all duration-300 hover:bg-emerald-900/5 hover:dark:hover:bg-white/[0.03] group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="rounded-[0.5rem] border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-emerald-400">
                        {incident.displayId}
                      </span>
                      <AdminUrgencyBadge urgency={incident.urgencyLevel} />
                    </div>
                    <p className="font-bold text-[1.05rem] text-emerald-950 dark:text-white group-hover:text-emerald-300 transition-colors">{incident.title}</p>
                    <p className="mt-2 flex items-center gap-2 text-sm text-emerald-800 dark:text-slate-300/80">
                      <MapPin size={14} className="text-emerald-900/60 dark:text-slate-500" />
                      <span className="truncate">{incident.address || "Location unavailable"}</span>
                    </p>
                    <p className="mt-1 flex gap-2 text-[11px] font-bold text-emerald-900/60 dark:text-slate-500">
                      <span>{incident.reporterName}</span>
                      <span className="opacity-50">•</span>
                      <span>Reported {formatAdminDate(incident.createdAt)}</span>
                    </p>
                  </div>

                  <div className="flex items-start pt-1">
                    <AdminAuthorityBadge authority={incident.assignedAuthority} />
                  </div>

                  <div className="flex items-start pt-1">
                    <AdminStatusBadge status={incident.status} />
                  </div>

                  <div className="pt-2">
                    <p className="flex items-center gap-2 text-sm font-bold text-emerald-950 dark:text-white">
                      <Users size={14} className="text-emerald-400" />
                      {getCommunitySupportLabel(incident.supportCount)}
                    </p>
                  </div>

                  <div className="pt-1">
                    <p className="text-sm font-bold text-emerald-950 dark:text-white">{formatAdminRelativeTime(incident.lastUpdatedAt)}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-emerald-800/70 dark:text-slate-400/80 leading-snug">
                      {incident.latestUpdate?.note || "No update note available."}
                    </p>
                  </div>

                  <div className="flex items-start justify-end pt-1">
                    <AdminRowLink label={incident.nextActionLabel || "Open Case"} onClick={() => navigate(`/admin/incident/${incident.displayId}`)} />
                  </div>
                </button>
              ))}
            </div>
          </AdminSurface>

          <div className="space-y-4 lg:hidden">
            {items.map((incident) => (
              <AdminSurface key={incident.id} className="p-5">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-300">
                    {incident.displayId}
                  </span>
                  <AdminStatusBadge status={incident.status} />
                  <AdminUrgencyBadge urgency={incident.urgencyLevel} />
                </div>

                <p className="text-lg font-black text-emerald-950 dark:text-white">{incident.title}</p>
                <p className="mt-2 flex items-center gap-2 text-sm text-emerald-800 dark:text-slate-300/75">
                  <MapPin size={14} className="text-emerald-900/60 dark:text-slate-500" />
                  {incident.address || "Location unavailable"}
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-emerald-900/10 dark:border-white/10 bg-emerald-900/5 dark:bg-white/[0.03] p-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-800/70 dark:text-slate-400 mb-2">
                      Ownership
                    </p>
                    <AdminAuthorityBadge authority={incident.assignedAuthority} />
                    <p className="mt-2 text-xs text-emerald-900/60 dark:text-slate-500">{incident.reporterName}</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-900/10 dark:border-white/10 bg-emerald-900/5 dark:bg-white/[0.03] p-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-800/70 dark:text-slate-400 mb-2">
                      Latest update
                    </p>
                    <p className="text-sm font-bold text-emerald-950 dark:text-white">{formatAdminRelativeTime(incident.lastUpdatedAt)}</p>
                    <p className="mt-2 text-xs text-emerald-800/70 dark:text-slate-400 line-clamp-3">
                      {incident.latestUpdate?.note || "No update note available."}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-emerald-800 dark:text-slate-300/80">
                    <Clock3 size={14} className="text-emerald-900/60 dark:text-slate-500" />
                    {formatAdminDateTime(incident.createdAt)}
                  </span>
                  <AdminRowLink label={incident.nextActionLabel || "Open Case"} onClick={() => navigate(`/admin/incident/${incident.displayId}`)} />
                </div>
              </AdminSurface>
            ))}
          </div>
        </>
      )}

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-emerald-800/70 dark:text-slate-400">
          Page <span className="font-bold text-emerald-950 dark:text-white">{meta.page || 1}</span> of{" "}
          <span className="font-bold text-emerald-950 dark:text-white">{meta.totalPages || 1}</span>
        </p>
        <div className="flex gap-3">
          <AdminActionButton
            variant="secondary"
            disabled={(meta.page || 1) <= 1}
            onClick={() => updateQuery({ page: `${Math.max(1, (meta.page || 1) - 1)}` })}
          >
            Previous
          </AdminActionButton>
          <AdminActionButton
            variant="secondary"
            disabled={(meta.page || 1) >= (meta.totalPages || 1)}
            onClick={() => updateQuery({ page: `${Math.min(meta.totalPages || 1, (meta.page || 1) + 1)}` })}
          >
            Next
          </AdminActionButton>
        </div>
      </div>
    </div>
  );
};

export default AdminIncidents;
