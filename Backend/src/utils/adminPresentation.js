import {
    getAuthorityLabel,
    serializeIncidentForViewer,
} from "./incidentTracking.js";

export const ADMIN_INCIDENT_BUCKETS = {
    needs_attention: ["OPEN", "REOPENED"],
    with_authority: ["ACCEPTED", "IN_PROGRESS"],
    awaiting_citizen: ["RESOLVED"],
    closed: ["VERIFIED", "CLOSED"],
    ended: ["REJECTED", "REVOKED"],
};

export const ADMIN_BUCKET_LABELS = {
    needs_attention: "Needs Attention",
    with_authority: "With Authority",
    awaiting_citizen: "Awaiting Citizen",
    closed: "Closed",
    ended: "Ended",
};

const NEXT_ACTION_LABELS = {
    AUTHORITY: "Authority action pending",
    USER: "Citizen response needed",
    NONE: "No pending action",
};

export const getAdminIncidentBucket = (status) => {
    const entry = Object.entries(ADMIN_INCIDENT_BUCKETS).find(([, statuses]) =>
        statuses.includes(status),
    );

    return entry?.[0] || "needs_attention";
};

export const getIncidentUrgencyScore = (incident) =>
    Number(incident?.urgencyScore || 0) + Number(incident?.upvotes || 0);

export const getIncidentUrgencyLevel = (incident) => {
    const score = getIncidentUrgencyScore(incident);

    if (score >= 10) return "critical";
    if (score >= 5) return "high";
    if (score >= 2) return "medium";
    return "low";
};

export const getIncidentUrgencyLabel = (incident) => {
    const level = getIncidentUrgencyLevel(incident);
    if (level === "critical") return "Critical";
    if (level === "high") return "High";
    if (level === "medium") return "Medium";
    return "Low";
};

export const getAdminNextActionLabel = (owner) =>
    NEXT_ACTION_LABELS[owner] || NEXT_ACTION_LABELS.NONE;

export const serializeIncidentForAdmin = (incidentInput) => {
    const incident = serializeIncidentForViewer(incidentInput);
    const reportId = incident.reportId || incident._id?.toString?.() || incident.id || "";
    const authorityLabel = getAuthorityLabel(incident.assignedAuthority);
    const bucket = getAdminIncidentBucket(incident.status);
    const supportCount = Number(incident.upvotes || 0);
    const urgencyLevel = getIncidentUrgencyLevel(incident);
    const urgencyScore = getIncidentUrgencyScore(incident);

    return {
        ...incident,
        id: incident._id || incident.id,
        displayId: reportId,
        reporter: incident.reportedBy
            ? {
                id: incident.reportedBy._id || incident.reportedBy.id || incident.reportedBy,
                name: incident.reportedBy.name || "Unknown",
                email: incident.reportedBy.email || "",
            }
            : null,
        reporterName: incident.reportedBy?.name || "Unknown",
        reporterEmail: incident.reportedBy?.email || "",
        authorityLabel,
        bucket,
        bucketLabel: ADMIN_BUCKET_LABELS[bucket] || "Needs Attention",
        supportCount,
        urgencyScore,
        urgencyLevel,
        urgencyLabel: getIncidentUrgencyLabel(incident),
        lastUpdatedAt:
            incident.latestUpdate?.changedAt ||
            incident.updatedAt ||
            incident.createdAt ||
            null,
        nextActionLabel: getAdminNextActionLabel(incident.nextActionOwner),
        statusLabel: (incident.status || "OPEN").replace(/_/g, " "),
    };
};
