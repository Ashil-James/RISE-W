export const AUTHORITY_OPTIONS = [
  { value: "WATER", label: "Water Authority" },
  { value: "ELECTRICITY", label: "Power Authority" },
  { value: "CIVIL", label: "Road Authority" },
];

export const INCIDENT_BUCKET_OPTIONS = [
  { value: "all", label: "All Incidents" },
  { value: "needs_attention", label: "Needs Attention" },
  { value: "with_authority", label: "With Authority" },
  { value: "awaiting_citizen", label: "Awaiting Citizen" },
  { value: "closed", label: "Closed" },
  { value: "ended", label: "Ended" },
];

export const INCIDENT_SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "recently_updated", label: "Recently Updated" },
  { value: "highest_urgency", label: "Highest Urgency" },
  { value: "most_supported", label: "Most Supported" },
  { value: "oldest", label: "Oldest First" },
];

export const URGENCY_FILTER_OPTIONS = [
  { value: "all", label: "All Urgency" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export const COMMUNITY_FILTER_OPTIONS = [
  { value: "all", label: "All Community Support" },
  { value: "supported", label: "Supported by Citizens" },
  { value: "solo", label: "Reporter Only" },
];

export const BROADCAST_CATEGORY_OPTIONS = [
  { value: "Wildlife Alert", label: "Wildlife Alert" },
  { value: "Road Blockage", label: "Road Blockage" },
  { value: "Power Outage", label: "Power Outage" },
  { value: "Water Supply", label: "Water Supply" },
  { value: "Public Safety", label: "Public Safety" },
];

export const BROADCAST_SEVERITY_OPTIONS = [
  { value: "High", label: "Critical" },
  { value: "Medium", label: "Warning" },
  { value: "Low", label: "Info" },
];

const STATUS_META = {
  OPEN: {
    label: "Open",
    badgeClass: "bg-orange-500/10 text-orange-300 border border-orange-500/20",
    summary: "This case still needs authority intake and triage.",
  },
  ACCEPTED: {
    label: "Accepted",
    badgeClass: "bg-sky-500/10 text-sky-300 border border-sky-500/20",
    summary: "The authority has accepted the case and owns the next move.",
  },
  IN_PROGRESS: {
    label: "In Progress",
    badgeClass: "bg-amber-500/10 text-amber-300 border border-amber-500/20",
    summary: "The authority is actively working on the case.",
  },
  RESOLVED: {
    label: "Awaiting Citizen",
    badgeClass: "bg-blue-500/10 text-blue-300 border border-blue-500/20",
    summary: "The authority says the issue is fixed and is waiting for the reporter to confirm.",
  },
  VERIFIED: {
    label: "Verified",
    badgeClass: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",
    summary: "The case has been verified and is moving toward closure.",
  },
  CLOSED: {
    label: "Closed",
    badgeClass: "bg-slate-500/10 text-slate-300 border border-slate-500/20",
    summary: "The reporter confirmed the fix and the case is closed.",
  },
  REOPENED: {
    label: "Reopened",
    badgeClass: "bg-red-500/10 text-red-300 border border-red-500/20",
    summary: "The reporter rejected the fix, so the authority must continue work.",
  },
  REJECTED: {
    label: "Rejected",
    badgeClass: "bg-rose-500/10 text-rose-300 border border-rose-500/20",
    summary: "The authority rejected this case and no more operational work is pending.",
  },
  REVOKED: {
    label: "Revoked",
    badgeClass: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
    summary: "The reporter revoked this case before authority acceptance.",
  },
};

const NEXT_ACTION_DESCRIPTIONS = {
  AUTHORITY: "An authority team is expected to act next on this case.",
  USER: "The reporting citizen needs to review or respond next.",
  NONE: "No immediate next action is pending.",
};

const URGENCY_META = {
  critical: {
    label: "Critical",
    badgeClass: "bg-red-500/10 text-red-300 border border-red-500/20",
  },
  high: {
    label: "High",
    badgeClass: "bg-amber-500/10 text-amber-300 border border-amber-500/20",
  },
  medium: {
    label: "Medium",
    badgeClass: "bg-sky-500/10 text-sky-300 border border-sky-500/20",
  },
  low: {
    label: "Low",
    badgeClass: "bg-slate-500/10 text-slate-300 border border-slate-500/20",
  },
};

const asDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const getAdminAuthorityLabel = (authority) =>
  AUTHORITY_OPTIONS.find((option) => option.value === authority)?.label || "Authority";

export const getAdminStatusMeta = (status) => STATUS_META[status] || STATUS_META.OPEN;

export const getAdminUrgencyMeta = (urgency) => URGENCY_META[urgency] || URGENCY_META.low;

export const getAdminNextActionDescription = (status, nextActionOwner) =>
  STATUS_META[status]?.summary || NEXT_ACTION_DESCRIPTIONS[nextActionOwner] || NEXT_ACTION_DESCRIPTIONS.NONE;

export const formatAdminDate = (value) => {
  const date = asDate(value);
  if (!date) return "Unknown date";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatAdminDateTime = (value) => {
  const date = asDate(value);
  if (!date) return "Unknown time";

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatAdminRelativeTime = (value) => {
  const date = asDate(value);
  if (!date) return "Unknown";

  const diffMinutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatAdminDate(date);
};

export const getCommunitySupportLabel = (count) =>
  count > 0 ? `${count} supporter${count === 1 ? "" : "s"}` : "Reporter only";
