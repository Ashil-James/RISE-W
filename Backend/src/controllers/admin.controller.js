import { Incident } from "../models/incident.model.js";
import { Broadcast } from "../models/broadcast.model.js";
import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {
    buildBroadcastNotificationContent,
    normalizeBroadcastInput,
    serializeBroadcast,
    serializeBroadcastCollection,
} from "../utils/broadcastPresentation.js";
import {
    ADMIN_INCIDENT_BUCKETS,
    serializeIncidentForAdmin,
} from "../utils/adminPresentation.js";
import { getAuthorityLabel } from "../utils/incidentTracking.js";

const AUTHORITY_ORDER = ["WATER", "ELECTRICITY", "CIVIL"];
const PENDING_STATUS_SET = new Set(["OPEN", "ACCEPTED", "IN_PROGRESS", "REOPENED", "RESOLVED"]);
const ACTIVE_STATUS_SET = new Set(["OPEN", "ACCEPTED", "IN_PROGRESS", "REOPENED"]);
const RESOLVED_STATUS_SET = new Set(["RESOLVED", "VERIFIED", "CLOSED"]);

const parseListParam = (value) =>
    String(value || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

const parsePositiveInt = (value, fallback) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const matchesSearch = (incident, search) => {
    if (!search) return true;

    const haystack = [
        incident.reportId,
        incident.title,
        incident.address,
        incident.category,
        incident.reporterName,
        incident.reporterEmail,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

    return haystack.includes(search);
};

const matchesCommunityFilter = (incident, community) => {
    if (!community || community === "all") return true;
    if (community === "supported") return incident.supportCount > 0;
    if (community === "solo") return incident.supportCount === 0;
    return true;
};

const matchesUrgencyFilter = (incident, urgency) => {
    if (!urgency || urgency === "all") return true;
    return incident.urgencyLevel === urgency;
};

const sortIncidents = (items, sort) => {
    const sorted = [...items];

    if (sort === "oldest") {
        return sorted.sort(
            (left, right) =>
                new Date(left.createdAt || 0).getTime() - new Date(right.createdAt || 0).getTime(),
        );
    }

    if (sort === "recently_updated") {
        return sorted.sort(
            (left, right) =>
                new Date(right.lastUpdatedAt || 0).getTime() - new Date(left.lastUpdatedAt || 0).getTime(),
        );
    }

    if (sort === "most_supported") {
        return sorted.sort((left, right) => right.supportCount - left.supportCount);
    }

    if (sort === "highest_urgency") {
        return sorted.sort((left, right) => {
            if (right.urgencyScore !== left.urgencyScore) {
                return right.urgencyScore - left.urgencyScore;
            }

            return new Date(right.lastUpdatedAt || 0).getTime() - new Date(left.lastUpdatedAt || 0).getTime();
        });
    }

    return sorted.sort((left, right) => {
        if (right.urgencyScore !== left.urgencyScore) {
            return right.urgencyScore - left.urgencyScore;
        }
        return new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime();
    });
};

const buildIncidentCounts = (items) => ({
    total: items.length,
    buckets: Object.keys(ADMIN_INCIDENT_BUCKETS).reduce((accumulator, key) => {
        accumulator[key] = items.filter((incident) => incident.bucket === key).length;
        return accumulator;
    }, {}),
    statuses: items.reduce((accumulator, incident) => {
        accumulator[incident.status] = (accumulator[incident.status] || 0) + 1;
        return accumulator;
    }, {}),
    authorities: AUTHORITY_ORDER.reduce((accumulator, code) => {
        accumulator[code] = items.filter((incident) => incident.assignedAuthority === code).length;
        return accumulator;
    }, {}),
});

const buildAuthorityWorkload = (items) =>
    AUTHORITY_ORDER.map((code) => {
        const authorityItems = items.filter((incident) => incident.assignedAuthority === code);
        const pendingItems = authorityItems.filter((incident) => PENDING_STATUS_SET.has(incident.status));
        const oldestPending = [...pendingItems].sort(
            (left, right) =>
                new Date(left.createdAt || 0).getTime() - new Date(right.createdAt || 0).getTime(),
        )[0] || null;

        return {
            authority: code,
            authorityLabel: authorityItems[0]?.authorityLabel || getAuthorityLabel(code),
            totalCount: authorityItems.length,
            activeCount: authorityItems.filter((incident) => ACTIVE_STATUS_SET.has(incident.status)).length,
            reopenedCount: authorityItems.filter((incident) => incident.status === "REOPENED").length,
            awaitingCitizenCount: authorityItems.filter((incident) => incident.status === "RESOLVED").length,
            endedCount: authorityItems.filter((incident) => ["REJECTED", "REVOKED"].includes(incident.status)).length,
            closedCount: authorityItems.filter((incident) => ["VERIFIED", "CLOSED"].includes(incident.status)).length,
            oldestPendingCase: oldestPending
                ? {
                    reportId: oldestPending.reportId,
                    title: oldestPending.title,
                    createdAt: oldestPending.createdAt,
                }
                : null,
        };
    });

const summarizeBroadcasts = (broadcasts) => {
    const official = broadcasts.filter((broadcast) => broadcast.sourceType === "OFFICIAL");
    const active = official.filter((broadcast) => broadcast.isActive);

    return {
        total: broadcasts.length,
        officialCount: official.length,
        activeCount: active.length,
        latest: broadcasts[0] || null,
        latestOfficial: official[0] || null,
    };
};

const findIncidentByIdentifier = async (reportId) => {
    let incident = await Incident.findOne({ reportId }).populate("reportedBy", "name email");

    if (incident) {
        return incident;
    }

    let searchId = reportId;
    if (reportId.startsWith("ID-")) {
        searchId = reportId.substring(3);
    }

    try {
        if (reportId.length === 24) {
            incident = await Incident.findById(reportId).populate("reportedBy", "name email");
        } else if (reportId.startsWith("ID-")) {
            incident = await Incident.findOne({ _id: { $regex: `^${searchId}` } }).populate("reportedBy", "name email");
        }
    } catch {
        incident = null;
    }

    return incident;
};

export const getAllIncidents = asyncHandler(async (req, res) => {
    const page = parsePositiveInt(req.query.page, 1);
    const limit = Math.min(parsePositiveInt(req.query.limit, 20), 100);
    const bucket = String(req.query.bucket || "").trim().toLowerCase();
    const statusFilters = parseListParam(req.query.status).map((value) => value.toUpperCase());
    const authorityFilters = parseListParam(req.query.authority).map((value) => value.toUpperCase());
    const search = String(req.query.search || "").trim().toLowerCase();
    const sort = String(req.query.sort || "newest").trim().toLowerCase();
    const urgency = String(req.query.urgency || "all").trim().toLowerCase();
    const community = String(req.query.community || "all").trim().toLowerCase();

    const incidents = await Incident.find()
        .populate("reportedBy", "name email")
        .sort({ createdAt: -1 });

    const serialized = incidents.map(serializeIncidentForAdmin);
    const counts = buildIncidentCounts(serialized);

    const filtered = serialized.filter((incident) => {
        const matchesBucketFilter = !bucket || bucket === "all" || incident.bucket === bucket;
        const matchesStatusFilter = statusFilters.length === 0 || statusFilters.includes(incident.status);
        const matchesAuthorityFilter =
            authorityFilters.length === 0 || authorityFilters.includes(String(incident.assignedAuthority || "").toUpperCase());

        return (
            matchesBucketFilter &&
            matchesStatusFilter &&
            matchesAuthorityFilter &&
            matchesSearch(incident, search) &&
            matchesUrgencyFilter(incident, urgency) &&
            matchesCommunityFilter(incident, community)
        );
    });

    const sorted = sortIncidents(filtered, sort);
    const totalItems = sorted.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const safePage = Math.min(page, totalPages);
    const startIndex = (safePage - 1) * limit;
    const items = sorted.slice(startIndex, startIndex + limit);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                items,
                counts,
                meta: {
                    page: safePage,
                    limit,
                    totalItems,
                    totalPages,
                    sort,
                    filters: {
                        bucket: bucket || "all",
                        status: statusFilters,
                        authority: authorityFilters,
                        search: req.query.search || "",
                        urgency,
                        community,
                    },
                },
            },
            "Incidents retrieved successfully",
        ),
    );
});

export const GetIncidentbyReportId = asyncHandler(async (req, res) => {
    const { reportId } = req.params;
    const incident = await findIncidentByIdentifier(reportId);

    if (!incident) {
        return res.status(404).json(new ApiResponse(404, null, "Incident not found"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, serializeIncidentForAdmin(incident), "Incident retrieved successfully"));
});

export const getAllBroadcasts = asyncHandler(async (req, res) => {
    const broadcasts = await Broadcast.find({
        $or: [
            { sourceType: "OFFICIAL" },
            { isAuthority: true },
        ],
    })
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 });

    const serialized = serializeBroadcastCollection(broadcasts);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                items: serialized,
                summary: summarizeBroadcasts(serialized),
            },
            "Broadcasts retrieved successfully",
        ),
    );
});

export const createBroadcast = asyncHandler(async (req, res) => {
    const normalized = normalizeBroadcastInput({ user: req.user, body: req.body });

    const broadcast = await Broadcast.create({
        title: normalized.title,
        type: normalized.type,
        severity: normalized.severity,
        location: normalized.location,
        message: normalized.message,
        sourceType: normalized.sourceType,
        actionTarget: normalized.actionTarget,
        expiresAt: normalized.expiresAt,
        targetArea: normalized.targetArea,
        createdBy: req.user._id,
        isAuthority: normalized.isAuthority,
    });

    const notificationContent = buildBroadcastNotificationContent(broadcast);

    if (normalized.targetArea?.center && normalized.targetArea?.radiusKm) {
        const { center, radiusKm } = normalized.targetArea;
        const radiusRadian = radiusKm / 6378.1;

        const usersInArea = await User.find({
            location: {
                $geoWithin: {
                    $centerSphere: [[center.lng, center.lat], radiusRadian],
                },
            },
        });

        if (usersInArea.length > 0) {
            await Notification.insertMany(
                usersInArea.map((targetUser) => ({
                    recipient: targetUser._id,
                    title: notificationContent.title,
                    message: notificationContent.message,
                    type: "BROADCAST",
                    relatedId: broadcast._id,
                })),
            );
        }
    } else {
        await Notification.create({
            recipient: null,
            title: notificationContent.title,
            message: notificationContent.message,
            type: "BROADCAST",
            relatedId: broadcast._id,
        });
    }

    return res
        .status(201)
        .json(new ApiResponse(201, serializeBroadcast(broadcast), "Broadcast created successfully"));
});

export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                items: users,
                summary: {
                    total: users.length,
                    residents: users.filter((user) => user.role === "user").length,
                    authorities: users.filter((user) => user.role === "authority").length,
                    admins: users.filter((user) => user.role === "admin").length,
                },
            },
            "Users retrieved successfully",
        ),
    );
});

export const updateUserRole = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["user", "admin", "authority"].includes(role)) {
        throw new ApiError(400, "Invalid role");
    }

    const existingUser = await User.findById(userId);

    if (!existingUser) {
        throw new ApiError(404, "User not found");
    }

    if (String(existingUser._id) === String(req.user._id) && role !== existingUser.role) {
        throw new ApiError(400, "You cannot change your own role");
    }

    if (role === "authority" && !existingUser.department) {
        throw new ApiError(400, "Assign a department before promoting a user to authority");
    }

    existingUser.role = role;
    await existingUser.save({ validateBeforeSave: false });

    const updatedUser = await User.findById(existingUser._id).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(200, updatedUser, "User role updated successfully"));
});

export const getSystemStats = asyncHandler(async (req, res) => {
    const [incidents, users, broadcastDocs] = await Promise.all([
        Incident.find().populate("reportedBy", "name email").sort({ createdAt: -1 }),
        User.find().select("-password"),
        Broadcast.find().sort({ createdAt: -1 }),
    ]);

    const serializedIncidents = incidents.map(serializeIncidentForAdmin);
    const serializedBroadcasts = serializeBroadcastCollection(broadcastDocs);
    const incidentCounts = buildIncidentCounts(serializedIncidents);
    const authorityWorkload = buildAuthorityWorkload(serializedIncidents);
    const broadcastSummary = summarizeBroadcasts(serializedBroadcasts);
    const totalIncidents = serializedIncidents.length;
    const openIncidents = serializedIncidents.filter((incident) => ACTIVE_STATUS_SET.has(incident.status)).length;
    const resolvedIncidents = serializedIncidents.filter((incident) => RESOLVED_STATUS_SET.has(incident.status)).length;
    const rejectedIncidents = serializedIncidents.filter((incident) => incident.status === "REJECTED").length;
    const totalUsers = users.filter((user) => user.role === "user").length;

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalIncidents,
                openIncidents,
                resolvedIncidents,
                rejectedIncidents,
                totalUsers,
                overview: {
                    totalIncidents,
                    needsAttention: incidentCounts.buckets.needs_attention || 0,
                    withAuthority: incidentCounts.buckets.with_authority || 0,
                    awaitingCitizen: incidentCounts.buckets.awaiting_citizen || 0,
                    closed: incidentCounts.buckets.closed || 0,
                    ended: incidentCounts.buckets.ended || 0,
                    totalResidents: totalUsers,
                    totalAuthorities: users.filter((user) => user.role === "authority").length,
                    totalAdmins: users.filter((user) => user.role === "admin").length,
                    activeBroadcasts: broadcastSummary.activeCount,
                },
                counts: incidentCounts,
                authorityWorkload,
                broadcasts: broadcastSummary,
            },
            "System statistics retrieved successfully",
        ),
    );
});
