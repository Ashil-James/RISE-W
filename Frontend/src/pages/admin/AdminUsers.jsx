import React, { useEffect, useMemo, useState } from "react";
import { Search, ShieldAlert, Users } from "lucide-react";
import axios from "axios";
import { useUser } from "../../context/UserContext";
import {
  AdminActionButton,
  AdminEmptyState,
  AdminPageHeader,
  AdminSurface,
} from "../../components/admin/AdminUI";
import {
  AUTHORITY_OPTIONS,
  formatAdminDate,
  formatAdminRelativeTime,
} from "../../utils/adminPortal";

const ROLE_OPTIONS = [
  { value: "all", label: "All roles" },
  { value: "user", label: "Residents" },
  { value: "authority", label: "Authorities" },
  { value: "admin", label: "Admins" },
];

const summarizeUsers = (items) => ({
  total: items.length,
  residents: items.filter((item) => item.role === "user").length,
  authorities: items.filter((item) => item.role === "authority").length,
  admins: items.filter((item) => item.role === "admin").length,
});

const roleBadgeClass = (role) => {
  if (role === "admin") return "bg-violet-500/10 text-violet-200 border border-violet-500/20";
  if (role === "authority") return "bg-sky-500/10 text-sky-200 border border-sky-500/20";
  return "bg-emerald-500/10 text-emerald-200 border border-emerald-500/20";
};

const AdminUsers = () => {
  const { user: currentUser } = useUser();
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState({ total: 0, residents: 0, authorities: 0, admins: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const config = { headers: { Authorization: `Bearer ${currentUser?.token}` } };
      const response = await axios.get("/api/v1/admin/users", config);
      if (response.data.success) {
        const nextUsers = response.data.data.items || [];
        setUsers(nextUsers);
        setSummary(response.data.data.summary || summarizeUsers(nextUsers));
      }
    } catch (fetchError) {
      console.error(fetchError);
      setError(fetchError.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.token) {
      fetchUsers();
    }
  }, [currentUser?.token]);

  const filteredUsers = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return users.filter((entry) => {
      const matchesRole = roleFilter === "all" ? true : entry.role === roleFilter;
      const matchesSearch = !needle
        ? true
        : [entry.name, entry.email, entry.department]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(needle));
      return matchesRole && matchesSearch;
    });
  }, [roleFilter, search, users]);

  const handleRoleChange = async (entry, nextRole) => {
    if (nextRole === entry.role) return;

    try {
      setUpdatingId(entry._id);
      const config = { headers: { Authorization: `Bearer ${currentUser?.token}` } };
      const response = await axios.put(
        `/api/v1/admin/users/${entry._id}/role`,
        { role: nextRole },
        config,
      );

      if (response.data.success) {
        setUsers((previousUsers) => {
          const nextUsers = previousUsers.map((user) =>
            user._id === entry._id ? { ...user, role: response.data.data.role } : user,
          );
          setSummary(summarizeUsers(nextUsers));
          return nextUsers;
        });
      }
    } catch (updateError) {
      console.error(updateError);
      alert(updateError.response?.data?.message || "Failed to update role.");
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <div className="pb-16">
      <AdminPageHeader
        title="User Access"
        description="Manage resident, authority, and admin access with safer role controls and clearer account context."
        actions={
          <>
            <AdminActionButton variant="secondary" onClick={fetchUsers}>
              Refresh Users
            </AdminActionButton>
            <AdminActionButton variant="subtle" onClick={() => setRoleFilter("all")}>
              Reset Filters
            </AdminActionButton>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
        {[
          { title: "All Accounts", value: summary.total || 0, description: "Every user profile in the system." },
          { title: "Residents", value: summary.residents || 0, description: "Citizen-facing accounts." },
          { title: "Authorities", value: summary.authorities || 0, description: "Department-owned operational accounts." },
          { title: "Admins", value: summary.admins || 0, description: "Platform control center access." },
        ].map((card) => (
          <AdminSurface key={card.title} className="p-5">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-300/75">
              {card.title}
            </p>
            <p className="mt-3 text-3xl font-black text-emerald-950 dark:text-white">{card.value}</p>
            <p className="mt-2 text-sm text-emerald-800 dark:text-slate-300/75">{card.description}</p>
          </AdminSurface>
        ))}
      </div>

      <AdminSurface className="p-4 md:p-5 mb-6">
        <div className="grid gap-3 lg:grid-cols-[1.6fr_0.8fr]">
          <label className="rounded-2xl border border-emerald-900/10 dark:border-white/10 bg-emerald-900/5 dark:bg-black/20 px-4 py-3 flex items-center gap-3">
            <Search size={16} className="text-emerald-800/70 dark:text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email, or department"
              className="w-full bg-transparent text-sm text-emerald-950 dark:text-white outline-none placeholder:text-emerald-900/60 dark:text-slate-500"
            />
          </label>

          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="rounded-2xl border border-emerald-900/10 dark:border-white/10 bg-emerald-900/5 dark:bg-black/20 px-4 py-3 text-sm text-emerald-950 dark:text-white outline-none"
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="bg-emerald-50 dark:bg-slate-950">
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </AdminSurface>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <AdminSurface key={index} className="h-24 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <AdminEmptyState
          icon={Users}
          title="Users unavailable"
          description={error}
          action={<AdminActionButton onClick={fetchUsers}>Try Again</AdminActionButton>}
        />
      ) : filteredUsers.length === 0 ? (
        <AdminEmptyState
          icon={Users}
          title="No users match this filter"
          description="Try clearing the search or switching the role filter to bring more accounts into view."
        />
      ) : (
        <AdminSurface className="overflow-hidden">
          <div className="hidden md:grid grid-cols-[1.6fr_0.9fr_0.8fr_0.8fr_1fr] gap-4 border-b border-emerald-900/10 dark:border-white/10 px-6 py-4 text-[11px] font-black uppercase tracking-[0.22em] text-emerald-800/70 dark:text-slate-400">
            <span>User</span>
            <span>Department</span>
            <span>Role</span>
            <span>Joined</span>
            <span>Last Login</span>
          </div>

          <div className="divide-y divide-white/6">
            {filteredUsers.map((entry) => {
              const isSelf = entry._id === currentUser?._id;
              const canPromoteToAuthority = Boolean(entry.department);
              const departmentLabel =
                AUTHORITY_OPTIONS.find((option) => option.value === entry.department)?.label ||
                (entry.department === "ADMIN" ? "Admin" : entry.department || "Unassigned");

              return (
                <div
                  key={entry._id}
                  className="grid gap-4 px-5 py-5 md:grid-cols-[1.6fr_0.9fr_0.8fr_0.8fr_1fr] md:px-6"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-900/10 dark:border-white/10 bg-emerald-900/10 dark:bg-white/[0.04] text-sm font-black text-emerald-950 dark:text-white">
                        {entry.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="font-bold text-emerald-950 dark:text-white">{entry.name}</p>
                        <p className="text-xs text-emerald-900/60 dark:text-slate-500">{entry.email}</p>
                      </div>
                    </div>
                    {isSelf ? (
                      <p className="mt-2 text-xs text-emerald-300/80">Current admin account</p>
                    ) : null}
                  </div>

                  <div className="md:pt-1">
                    <p className="text-sm font-bold text-emerald-950 dark:text-white">{departmentLabel}</p>
                    {!entry.department && entry.role !== "admin" ? (
                      <p className="mt-2 text-xs text-amber-300/80">
                        No department assigned
                      </p>
                    ) : null}
                  </div>

                  <div className="md:pt-1">
                    <select
                      value={entry.role}
                      disabled={isSelf || updatingId === entry._id}
                      onChange={(event) => handleRoleChange(entry, event.target.value)}
                      className={`w-full rounded-xl px-3 py-2 text-xs font-black uppercase tracking-[0.18em] outline-none ${roleBadgeClass(entry.role)} disabled:cursor-not-allowed disabled:opacity-70`}
                    >
                      <option value="user" className="bg-emerald-50 dark:bg-slate-950 text-emerald-950 dark:text-white">
                        Resident
                      </option>
                      <option
                        value="authority"
                        className="bg-emerald-50 dark:bg-slate-950 text-emerald-950 dark:text-white"
                        disabled={!canPromoteToAuthority && entry.role !== "authority"}
                      >
                        Authority
                      </option>
                      <option value="admin" className="bg-emerald-50 dark:bg-slate-950 text-emerald-950 dark:text-white">
                        Admin
                      </option>
                    </select>
                    {!canPromoteToAuthority && entry.role !== "authority" ? (
                      <p className="mt-2 flex items-start gap-2 text-xs text-amber-300/80">
                        <ShieldAlert size={14} className="mt-0.5 shrink-0" />
                        A department is required before granting authority access.
                      </p>
                    ) : null}
                  </div>

                  <div className="md:pt-1">
                    <p className="text-sm font-bold text-emerald-950 dark:text-white">{formatAdminDate(entry.createdAt)}</p>
                    <p className="mt-2 text-xs text-emerald-900/60 dark:text-slate-500">Account created</p>
                  </div>

                  <div className="md:pt-1">
                    <p className="text-sm font-bold text-emerald-950 dark:text-white">
                      {entry.lastLogin ? formatAdminRelativeTime(entry.lastLogin) : "Never"}
                    </p>
                    <p className="mt-2 text-xs text-emerald-900/60 dark:text-slate-500">
                      {entry.lastLogin ? "Most recent sign-in" : "No login recorded yet"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </AdminSurface>
      )}
    </div>
  );
};

export default AdminUsers;
