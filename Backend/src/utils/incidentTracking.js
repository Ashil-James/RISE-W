const AUTHORITY_LABELS = {
    WATER: "Water Authority",
    ELECTRICITY: "Power Authority",
    CIVIL: "Road Authority",
    ADMIN: "Administration",
};

const STATUS_NEXT_ACTION_OWNER = {
    OPEN: "AUTHORITY",
    ACCEPTED: "AUTHORITY",
    IN_PROGRESS: "AUTHORITY",
    REOPENED: "AUTHORITY",
    RESOLVED: "USER",
    VERIFIED: "USER",
    CLOSED: "NONE",
    REJECTED: "NONE",
    REVOKED: "NONE",
};

const USER_STATUS_SET = new Set(["OPEN", "REOPENED", "CLOSED", "REVOKED"]);
const AUTHORITY_STATUS_SET = new Set(["ACCEPTED", "IN_PROGRESS", "RESOLVED", "VERIFIED", "REJECTED"]);

const toIdString = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object" && value.toString) return value.toString();
    return "";
};

export const getAuthorityLabel = (department) => AUTHORITY_LABELS[department] || "Authority";

export const incidentBelongsToDepartment = (incident, department) => {
    if (!department) return true;

    if (department === "WATER") {
        return incident.assignedAuthority === "WATER" || incident.category === "Water & Sanitation";
    }

    return incident.assignedAuthority === department;
};

export const getViewerRelation = (incident, viewer) => {
    if (!viewer) return null;

    const viewerId = toIdString(viewer._id || viewer.id || viewer);
    if (!viewerId) return null;

    if (toIdString(incident.reportedBy?._id || incident.reportedBy) === viewerId) {
        return "REPORTER";
    }

    const supported = Array.isArray(incident.upvotedBy) && incident.upvotedBy.some(
        (value) => toIdString(value?._id || value) === viewerId,
    );

    return supported ? "SUPPORTER" : null;
};

export const getNextActionOwner = (status) => STATUS_NEXT_ACTION_OWNER[status] || "NONE";

export const inferActorRoleForStatus = (status) => {
    if (USER_STATUS_SET.has(status)) return "USER";
    if (AUTHORITY_STATUS_SET.has(status)) return "AUTHORITY";
    return "SYSTEM";
};

export const getActorLabelForStatus = (status, incident) => {
    const actorRole = inferActorRoleForStatus(status);

    if (actorRole === "USER") {
        return "Citizen";
    }

    if (actorRole === "AUTHORITY") {
        return getAuthorityLabel(incident.assignedAuthority);
    }

    return "System";
};

export const getDefaultStatusNote = (status, incident) => {
    switch (status) {
        case "OPEN":
            return "Issue reported by citizen.";
        case "ACCEPTED":
            return "Authority accepted the issue for processing.";
        case "IN_PROGRESS":
            return "Authority started work on this issue.";
        case "RESOLVED":
            if (incident.authorityMessage) return incident.authorityMessage;
            if (incident.resolutionImage) return "Authority marked the issue as resolved and attached proof.";
            return "Authority marked the issue as resolved.";
        case "VERIFIED":
            return incident.authorityMessage || "Authority requested final citizen verification.";
        case "REOPENED":
            return "Citizen marked the issue as still unresolved.";
        case "CLOSED":
            return "Citizen confirmed that the issue has been resolved.";
        case "REJECTED":
            return incident.rejectionReason || incident.authorityMessage || "Authority rejected the issue.";
        case "REVOKED":
            return "Citizen revoked the issue before authority acceptance.";
        default:
            return "";
    }
};

export const createStatusHistoryEntry = ({
    status,
    changedAt = new Date(),
    actorRole,
    actorLabel,
    note = "",
    proofImage = "",
}) => {
    const entry = {
        status,
        changedAt,
        actorRole,
        actorLabel,
    };

    if (note) {
        entry.note = note;
    }

    if (proofImage) {
        entry.proofImage = proofImage;
    }

    return entry;
};

export const getNormalizedStatusHistory = (incidentInput) => {
    const incident = incidentInput?.toObject ? incidentInput.toObject() : incidentInput;
    const rawHistory = Array.isArray(incident?.statusHistory) ? incident.statusHistory.filter(Boolean) : [];

    if (rawHistory.length > 0) {
        return rawHistory.map((entry) => createStatusHistoryEntry({
            status: entry.status,
            changedAt: entry.changedAt || incident.updatedAt || incident.createdAt || new Date(),
            actorRole: entry.actorRole || inferActorRoleForStatus(entry.status),
            actorLabel: entry.actorLabel || getActorLabelForStatus(entry.status, incident),
            note: entry.note || getDefaultStatusNote(entry.status, incident),
            proofImage: entry.proofImage,
        }));
    }

    const fallbackHistory = [
        createStatusHistoryEntry({
            status: "OPEN",
            changedAt: incident?.createdAt || new Date(),
            actorRole: "USER",
            actorLabel: "Citizen",
            note: getDefaultStatusNote("OPEN", incident || {}),
        }),
    ];

    if (incident?.status && incident.status !== "OPEN") {
        fallbackHistory.push(
            createStatusHistoryEntry({
                status: incident.status,
                changedAt: incident.updatedAt || incident.createdAt || new Date(),
                actorRole: inferActorRoleForStatus(incident.status),
                actorLabel: getActorLabelForStatus(incident.status, incident),
                note: getDefaultStatusNote(incident.status, incident),
                proofImage: incident.resolutionImage || "",
            }),
        );
    }

    return fallbackHistory;
};

export const ensureStatusHistory = (incident) => {
    if (!incident) {
        return [];
    }

    if (Array.isArray(incident.statusHistory) && incident.statusHistory.length > 0) {
        return incident.statusHistory;
    }

    incident.statusHistory = getNormalizedStatusHistory(incident);
    return incident.statusHistory;
};

export const appendStatusHistory = (incident, entryOptions) => {
    ensureStatusHistory(incident);

    const entry = createStatusHistoryEntry(entryOptions);
    incident.statusHistory.push(entry);
    return entry;
};

export const serializeIncidentForViewer = (incidentInput, viewer = null) => {
    const incident = incidentInput?.toObject ? incidentInput.toObject() : { ...incidentInput };
    const statusHistory = getNormalizedStatusHistory(incident);

    return {
        ...incident,
        statusHistory,
        latestUpdate: statusHistory[statusHistory.length - 1] || null,
        viewerRelation: getViewerRelation(incident, viewer),
        nextActionOwner: getNextActionOwner(incident.status),
    };
};
