export const AUTHORITY_LABELS = {
  WATER: "Water Authority",
  ELECTRICITY: "Power Authority",
  CIVIL: "Road Authority",
  ADMIN: "Administration",
};

export const REPORT_SCOPE_OPTIONS = [
  { id: "REPORTER", label: "Reported by Me" },
  { id: "SUPPORTER", label: "Supported by Me" },
];

export const REPORT_BUCKET_OPTIONS = [
  { id: "ALL", label: "All Cases" },
  { id: "ACTION_NEEDED", label: "Action Needed" },
  { id: "WITH_AUTHORITY", label: "With Authority" },
  { id: "AWAITING_VERIFICATION", label: "Awaiting Verification" },
  { id: "CLOSED", label: "Closed" },
];

export const REPORT_SORT_OPTIONS = [
  { id: "recent_update", label: "Recently Updated" },
  { id: "newest", label: "Newest First" },
  { id: "oldest", label: "Oldest First" },
];

const STATUS_META = {
  OPEN: {
    label: "Open",
    badgeClass: "text-orange-500 bg-orange-500/10 border border-orange-500/20",
    bucket: "ACTION_NEEDED",
    meaning: "Your issue has been submitted and is waiting for authority intake.",
    nextActionOwner: "AUTHORITY",
  },
  ACCEPTED: {
    label: "Accepted",
    badgeClass: "text-sky-400 bg-sky-500/10 border border-sky-500/20",
    bucket: "WITH_AUTHORITY",
    meaning: "The authority has accepted the issue and is preparing the next step.",
    nextActionOwner: "AUTHORITY",
  },
  IN_PROGRESS: {
    label: "In Progress",
    badgeClass: "text-amber-400 bg-amber-500/10 border border-amber-500/20",
    bucket: "WITH_AUTHORITY",
    meaning: "The authority is actively working on the issue.",
    nextActionOwner: "AUTHORITY",
  },
  RESOLVED: {
    label: "Resolved",
    badgeClass: "text-blue-400 bg-blue-500/10 border border-blue-500/20",
    bucket: "AWAITING_VERIFICATION",
    meaning: "The authority says the issue is fixed and is waiting for your confirmation.",
    nextActionOwner: "USER",
  },
  VERIFIED: {
    label: "Awaiting Verification",
    badgeClass: "text-blue-400 bg-blue-500/10 border border-blue-500/20",
    bucket: "AWAITING_VERIFICATION",
    meaning: "The case is waiting for your final confirmation.",
    nextActionOwner: "USER",
  },
  REOPENED: {
    label: "Reopened",
    badgeClass: "text-red-400 bg-red-500/10 border border-red-500/20",
    bucket: "WITH_AUTHORITY",
    meaning: "You rejected the fix, so the authority must continue working on the issue.",
    nextActionOwner: "AUTHORITY",
  },
  CLOSED: {
    label: "Closed",
    badgeClass: "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20",
    bucket: "CLOSED",
    meaning: "You confirmed the fix and this case is now closed.",
    nextActionOwner: "NONE",
  },
  REJECTED: {
    label: "Rejected",
    badgeClass: "text-red-400 bg-red-500/10 border border-red-500/20",
    bucket: "CLOSED",
    meaning: "The authority rejected this issue and no more work is planned on it.",
    nextActionOwner: "NONE",
  },
  REVOKED: {
    label: "Revoked",
    badgeClass: "text-slate-400 bg-slate-500/10 border border-slate-500/20",
    bucket: "CLOSED",
    meaning: "You revoked this issue before it was accepted by the authority.",
    nextActionOwner: "NONE",
  },
};

const NEXT_ACTION_LABELS = {
  AUTHORITY: "Authority action pending",
  USER: "Your response is needed",
  NONE: "No pending action",
};

const NEXT_ACTION_DESCRIPTIONS = {
  OPEN: "The authority still needs to pick up and review this issue.",
  ACCEPTED: "The authority has accepted the issue and should move it into active work.",
  IN_PROGRESS: "Work is underway. Watch this case for new proof, notes, or a resolution update.",
  RESOLVED: "Please confirm whether the fix is real. If the issue remains, mark it as not fixed.",
  VERIFIED: "Please review the latest authority update and close the case only if it is truly fixed.",
  REOPENED: "The authority needs to revisit the case because the fix was rejected.",
  CLOSED: "No further action is pending unless a new issue is reported.",
  REJECTED: "No further action is pending on this case. Review the rejection reason for context.",
  REVOKED: "No further action is pending because you revoked this case.",
};

const asDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const fallbackReportId = (value) => {
  const raw = typeof value === "string" ? value : "";
  return raw ? `REP-${raw.slice(-6).toUpperCase()}` : "Case";
};

export const getAuthorityLabel = (authorityCode) =>
  AUTHORITY_LABELS[authorityCode] || "Authority";

export const getStatusMeta = (rawStatus) =>
  STATUS_META[rawStatus] || STATUS_META.OPEN;

export const formatShortDate = (value) => {
  const date = asDate(value);
  if (!date) return "Unknown date";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatDateTime = (value) => {
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

export const formatRelativeTime = (value) => {
  const date = asDate(value);
  if (!date) return "Unknown";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

  return formatShortDate(date);
};

const getTimelineActorLabel = (entry, incident) => {
  if (entry.actorLabel) return entry.actorLabel;

  if (entry.actorRole === "AUTHORITY") {
    return getAuthorityLabel(incident.assignedAuthority);
  }

  if (entry.actorRole === "USER") {
    return "Citizen";
  }

  return "System";
};

const mapStatusHistoryEntry = (entry, incident, index) => {
  const rawStatus = entry.status || incident.status || "OPEN";
  const meta = getStatusMeta(rawStatus);
  const changedAt = entry.changedAt || incident.updatedAt || incident.createdAt;

  return {
    id: `${incident._id || incident.id || "incident"}-history-${index}-${rawStatus}`,
    rawStatus,
    status: meta.label,
    badgeClass: meta.badgeClass,
    actorRole: entry.actorRole || "SYSTEM",
    actorLabel: getTimelineActorLabel(entry, incident),
    note: entry.note || meta.meaning,
    proofImage: entry.proofImage || null,
    changedAt,
    changedAtLabel: formatDateTime(changedAt),
    changedAgo: formatRelativeTime(changedAt),
  };
};

export const getNextActionDescription = (rawStatus, nextActionOwner) => {
  if (NEXT_ACTION_DESCRIPTIONS[rawStatus]) {
    return NEXT_ACTION_DESCRIPTIONS[rawStatus];
  }

  if (nextActionOwner === "USER") {
    return "This case needs your confirmation or feedback.";
  }

  if (nextActionOwner === "AUTHORITY") {
    return "The authority is the next team expected to act on this case.";
  }

  return "This case does not have any pending action.";
};

export const mapIncidentToReport = (incident) => {
  const rawStatus = incident.status || "OPEN";
  const statusMeta = getStatusMeta(rawStatus);
  const statusHistory = (Array.isArray(incident.statusHistory) ? incident.statusHistory : []).map((entry, index) =>
    mapStatusHistoryEntry(entry, incident, index),
  );

  const latestUpdate = statusHistory[statusHistory.length - 1] || null;
  const latestAuthorityUpdate = [...statusHistory].reverse().find((entry) => entry.actorRole === "AUTHORITY") || null;
  const viewerRelation = incident.viewerRelation || "REPORTER";
  const nextActionOwner = incident.nextActionOwner || statusMeta.nextActionOwner || "NONE";
  const lastUpdatedAt = latestUpdate?.changedAt || incident.updatedAt || incident.createdAt;
  const supportCount = incident.upvotes || 0;

  return {
    id: incident._id || incident.id,
    displayId: incident.reportId || fallbackReportId(incident._id || incident.id),
    reportId: incident.reportId || null,
    issue: incident.title || "Untitled issue",
    description: incident.description || "",
    category: incident.category || "General",
    location: incident.address || "Location unavailable",
    authority: incident.assignedAuthority || "CIVIL",
    authorityLabel: getAuthorityLabel(incident.assignedAuthority),
    submittedAt: incident.createdAt || null,
    submittedLabel: formatShortDate(incident.createdAt),
    submittedDateTime: formatDateTime(incident.createdAt),
    updatedAt: incident.updatedAt || incident.createdAt || null,
    lastUpdatedAt,
    lastUpdatedLabel: formatRelativeTime(lastUpdatedAt),
    lastUpdatedDateTime: formatDateTime(lastUpdatedAt),
    status: statusMeta.label,
    rawStatus,
    statusColor: statusMeta.badgeClass,
    statusMeaning: statusMeta.meaning,
    bucket: statusMeta.bucket,
    nextActionOwner,
    nextActionLabel: NEXT_ACTION_LABELS[nextActionOwner] || NEXT_ACTION_LABELS.NONE,
    nextActionDescription: getNextActionDescription(rawStatus, nextActionOwner),
    viewerRelation,
    isReporter: viewerRelation === "REPORTER",
    isSupporter: viewerRelation === "SUPPORTER",
    image: incident.image || null,
    supportCount,
    authorityMessage: incident.authorityMessage || latestAuthorityUpdate?.note || null,
    authorityProof: incident.resolutionImage || latestAuthorityUpdate?.proofImage || null,
    rejectionReason: incident.rejectionReason || null,
    verifiedByUser: Boolean(incident.verifiedByUser),
    statusHistory,
    latestUpdate,
    latestAuthorityUpdate,
    communitySummary:
      supportCount > 0
        ? `${supportCount} ${supportCount === 1 ? "other resident supports" : "other residents support"} this case.`
        : "No additional citizen support is attached to this case yet.",
    canRevoke: viewerRelation === "REPORTER" && rawStatus === "OPEN",
    canRespondToResolution:
      viewerRelation === "REPORTER" && ["RESOLVED", "VERIFIED"].includes(rawStatus),
  };
};
