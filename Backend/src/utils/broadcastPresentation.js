import { ApiError } from "./ApiError.js";

const ALLOWED_DB_TYPES = new Set([
    "WILDLIFE_ALERT",
    "ROAD_BLOCK",
    "UTILITY_WARNING",
    "SAFETY_ALERT",
    "POWER_ALERT",
    "WATER_ALERT",
    "ROAD_ALERT",
]);

const TYPE_LABELS = {
    WILDLIFE_ALERT: "Wildlife Alert",
    ROAD_BLOCK: "Road Blockage",
    UTILITY_WARNING: "Utility Warning",
    SAFETY_ALERT: "Safety Alert",
    POWER_ALERT: "Power Alert",
    WATER_ALERT: "Water Supply Alert",
    ROAD_ALERT: "Road Infrastructure Alert",
};

const INPUT_TYPE_MAP = {
    WILDLIFE_ALERT: "WILDLIFE_ALERT",
    ROAD_BLOCK: "ROAD_BLOCK",
    UTILITY_WARNING: "UTILITY_WARNING",
    SAFETY_ALERT: "SAFETY_ALERT",
    POWER_ALERT: "POWER_ALERT",
    WATER_ALERT: "WATER_ALERT",
    ROAD_ALERT: "ROAD_ALERT",
    "Power Outage": "POWER_ALERT",
    "Power Outage Alert": "POWER_ALERT",
    "Transformer Maintenance": "POWER_ALERT",
    "Grid Failure Warning": "POWER_ALERT",
    "High Voltage Safety Alert": "POWER_ALERT",
    "Water Supply": "WATER_ALERT",
    "Water Supply Interruption": "WATER_ALERT",
    "Pipeline Repair": "WATER_ALERT",
    "Muddy Water Warning": "WATER_ALERT",
    "Water Shortage Alert": "WATER_ALERT",
    "Road Blockage": "ROAD_BLOCK",
    "Road Repair Notice": "ROAD_ALERT",
    "Traffic Diversion": "ROAD_ALERT",
    "Fallen Tree": "ROAD_ALERT",
    "Wildlife Alert": "WILDLIFE_ALERT",
    "Public Safety": "SAFETY_ALERT",
};

const ACTIVE_HOURS_BY_SEVERITY = {
    High: 48,
    Medium: 72,
    Low: 120,
};

const SURVEY_ACTION_PATTERN = /post-storm survey|storm survey|\bsurvey\b/i;

const trimString = (value) => (typeof value === "string" ? value.trim() : "");

const toDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const normalizeTargetArea = (targetArea) => {
    if (!targetArea || typeof targetArea !== "object") {
        return null;
    }

    const lat = Number(targetArea.center?.lat);
    const lng = Number(targetArea.center?.lng);
    const radiusKm = Number(targetArea.radiusKm);

    if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(radiusKm) || radiusKm <= 0) {
        return null;
    }

    return {
        center: { lat, lng },
        radiusKm,
    };
};

export const isOfficialBroadcaster = (user) => ["admin", "authority"].includes(user?.role);

export const getBroadcastCategoryLabel = (type) => TYPE_LABELS[type] || "General Alert";

export const normalizeBroadcastType = (input) => {
    const value = trimString(input);
    if (!value) {
        return "SAFETY_ALERT";
    }

    if (ALLOWED_DB_TYPES.has(value)) {
        return value;
    }

    return INPUT_TYPE_MAP[value] || "SAFETY_ALERT";
};

export const normalizeBroadcastSeverity = (severity) => {
    const value = trimString(severity).toLowerCase();

    if (value === "high" || value === "critical") return "High";
    if (value === "medium" || value === "warning") return "Medium";
    return "Low";
};

export const normalizeBroadcastPath = (value) => {
    const path = trimString(value);
    if (!path) return null;
    if (!path.startsWith("/") || path.startsWith("//")) return null;
    return path;
};

export const deriveBroadcastActionTarget = ({ title, message, actionTarget }) => {
    const explicitTarget = normalizeBroadcastPath(actionTarget);
    if (explicitTarget) {
        return explicitTarget;
    }

    const haystack = `${trimString(title)} ${trimString(message)}`;
    if (SURVEY_ACTION_PATTERN.test(haystack)) {
        return "/survey";
    }

    return null;
};

export const getBroadcastSourceType = (broadcast) =>
    broadcast?.sourceType || (broadcast?.isAuthority ? "OFFICIAL" : "COMMUNITY");

export const getBroadcastSourceLabel = (broadcast) =>
    getBroadcastSourceType(broadcast) === "OFFICIAL" ? "Official" : "Community";

export const getBroadcastExpiry = (broadcast) => {
    const explicitExpiry = toDate(broadcast?.expiresAt);
    if (explicitExpiry) {
        return explicitExpiry;
    }

    const createdAt = toDate(broadcast?.createdAt) || new Date();
    const activeHours = ACTIVE_HOURS_BY_SEVERITY[broadcast?.severity] || ACTIVE_HOURS_BY_SEVERITY.Low;
    return new Date(createdAt.getTime() + activeHours * 60 * 60 * 1000);
};

export const serializeBroadcast = (broadcastInput) => {
    const broadcast = broadcastInput?.toObject ? broadcastInput.toObject() : { ...broadcastInput };
    const sourceType = getBroadcastSourceType(broadcast);
    const categoryLabel = getBroadcastCategoryLabel(broadcast.type);
    const actionTarget = deriveBroadcastActionTarget({
        title: broadcast.title,
        message: broadcast.message,
        actionTarget: broadcast.actionTarget,
    });
    const expiresAt = getBroadcastExpiry(broadcast);
    const targetArea = normalizeTargetArea(broadcast.targetArea);
    const targetScope = targetArea ? "TARGETED" : "GLOBAL";
    const targetSummary = targetArea
        ? `Within ${targetArea.radiusKm} km of ${targetArea.center.lat.toFixed(3)}, ${targetArea.center.lng.toFixed(3)}`
        : "Global broadcast";

    return {
        ...broadcast,
        sourceType,
        sourceLabel: sourceType === "OFFICIAL" ? "Official" : "Community",
        categoryLabel,
        actionTarget,
        expiresAt,
        targetArea,
        targetScope,
        targetSummary,
        isActive: expiresAt.getTime() > Date.now(),
    };
};

export const serializeBroadcastCollection = (items) => items.map(serializeBroadcast);

export const buildBroadcastNotificationContent = (broadcastInput) => {
    const broadcast = serializeBroadcast(broadcastInput);
    const sourceLabel = broadcast.sourceLabel;
    const categoryLabel = broadcast.categoryLabel;

    return {
        title: `${sourceLabel} ${categoryLabel}`,
        message: `${broadcast.title}: ${broadcast.message}`,
    };
};

export const normalizeBroadcastInput = ({ user, body }) => {
    const officialSource = isOfficialBroadcaster(user);
    const normalizedType = normalizeBroadcastType(body.type || body.title);
    const categoryLabel = getBroadcastCategoryLabel(normalizedType);
    const title = trimString(body.title) || categoryLabel;
    const message = trimString(body.message);

    if (!message) {
        throw new ApiError(400, "Broadcast message is required");
    }

    const location = trimString(body.location) || "Township Area";
    const severity = normalizeBroadcastSeverity(body.severity);
    const sourceType = officialSource ? "OFFICIAL" : "COMMUNITY";
    const actionTarget = officialSource
        ? deriveBroadcastActionTarget({
            title,
            message,
            actionTarget: body.actionTarget,
        })
        : null;
    const explicitExpiry = officialSource ? toDate(body.expiresAt) : null;
    const targetArea = officialSource ? normalizeTargetArea(body.targetArea) : null;

    return {
        title,
        type: normalizedType,
        severity,
        location,
        message,
        sourceType,
        isAuthority: officialSource,
        actionTarget,
        expiresAt: explicitExpiry,
        targetArea,
    };
};
