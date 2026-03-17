export const ALERT_CACHE_KEY = "rise_alerts";
export const ALERT_CACHE_VERSION = 2;

const CATEGORY_LABELS = {
  POWER_ALERT: "Power Issues",
  WATER_ALERT: "Water Supply",
  ROAD_ALERT: "Road Infrastructure",
  WILDLIFE_ALERT: "Wildlife Alert",
  ROAD_BLOCK: "Road Blockage",
  UTILITY_WARNING: "Utility Warning",
  SAFETY_ALERT: "Safety Alert",
};

const CATEGORY_OPTIONS = [
  { value: "SAFETY_ALERT", label: "Public Safety" },
  { value: "WILDLIFE_ALERT", label: "Wildlife Alert" },
  { value: "ROAD_BLOCK", label: "Road Blockage" },
  { value: "POWER_ALERT", label: "Power Issue" },
  { value: "WATER_ALERT", label: "Water Supply" },
  { value: "UTILITY_WARNING", label: "Utility Warning" },
];

const ACTION_LABELS = {
  "/survey": "Open Survey",
  "/alerts": "Open Alerts",
};

const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const COMMUNITY_CATEGORY_OPTIONS = CATEGORY_OPTIONS;

export const severityToneToLevel = (tone) => {
  if (tone === "critical") return "High";
  if (tone === "warning") return "Medium";
  return "Low";
};

export const severityLevelToTone = (severity) => {
  if (severity === "High") return "critical";
  if (severity === "Medium") return "warning";
  return "info";
};

export const getAlertCategoryLabel = (type) => CATEGORY_LABELS[type] || "General Alert";

export const getAlertSourceLabel = (sourceType, isAuthority) =>
  sourceType === "OFFICIAL" || isAuthority ? "Official" : "Community";

export const getAlertIconName = (type, severity) => {
  if (type === "POWER_ALERT" || type === "UTILITY_WARNING") return "Zap";
  if (type === "WATER_ALERT") return "CloudRain";
  if (severity === "High") return "AlertTriangle";
  return "Info";
};

export const formatAlertTimeAgo = (value) => {
  const date = toDate(value);
  if (!date) return "Unknown";

  const diffMinutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
};

export const formatAlertDateTime = (value) => {
  const date = toDate(value);
  if (!date) return "Unknown time";

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getAlertActionLabel = (actionTarget) => ACTION_LABELS[actionTarget] || "Take Action";

export const mapBroadcastToAlert = (broadcast) => {
  const createdAt = broadcast.createdAt || null;
  const expiresAt = broadcast.expiresAt || null;
  const severityLevel = broadcast.severity || "Low";
  const tone = severityLevelToTone(severityLevel);
  const sourceType = broadcast.sourceType || (broadcast.isAuthority ? "OFFICIAL" : "COMMUNITY");
  const actionTarget = broadcast.actionTarget || null;
  const categoryLabel = broadcast.categoryLabel || getAlertCategoryLabel(broadcast.type);
  const sourceLabel = broadcast.sourceLabel || getAlertSourceLabel(sourceType, broadcast.isAuthority);
  const isActive = typeof broadcast.isActive === "boolean"
    ? broadcast.isActive
    : (() => {
        const expiryDate = toDate(expiresAt);
        return expiryDate ? expiryDate.getTime() > Date.now() : true;
      })();

  return {
    id: broadcast._id || broadcast.id,
    title: broadcast.title || categoryLabel,
    message: broadcast.message || "",
    location: broadcast.location || "Township Area",
    time: createdAt,
    createdAt,
    createdAtLabel: formatAlertDateTime(createdAt),
    relativeTime: formatAlertTimeAgo(createdAt),
    expiresAt,
    isActive,
    severity: severityLevel,
    severityLabel: severityLevel === "High" ? "Critical" : severityLevel === "Medium" ? "Warning" : "Info",
    severityTone: tone,
    type: tone,
    icon: getAlertIconName(broadcast.type, severityLevel),
    isAuthority: Boolean(broadcast.isAuthority),
    sourceType,
    sourceLabel,
    backendType: broadcast.type,
    category: categoryLabel,
    categoryLabel,
    actionTarget,
    actionLabel: actionTarget ? getAlertActionLabel(actionTarget) : null,
    isOfficial: sourceType === "OFFICIAL",
    isCommunity: sourceType === "COMMUNITY",
  };
};

export const sortAlertsByNewest = (alerts) =>
  [...alerts].sort(
    (left, right) =>
      new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime(),
  );

export const isValidCachedAlert = (alert) => alert && alert.id && alert.title;
