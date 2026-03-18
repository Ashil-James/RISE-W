import { Incident } from "../models/incident.model.js";
import { Notification } from "../models/notification.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
    appendStatusHistory,
    ensureStatusHistory,
    getAuthorityLabel,
    getDefaultStatusNote,
    incidentBelongsToDepartment,
    serializeIncidentForViewer,
} from "../utils/incidentTracking.js";

const COMPLETED_STATUSES = ["RESOLVED", "VERIFIED", "CLOSED"];
const INACTIVE_HIGH_URGENCY_STATUSES = [...COMPLETED_STATUSES, "REJECTED", "REVOKED"];
const ALLOWED_AUTHORITY_STATUSES = ["OPEN", "ACCEPTED", "IN_PROGRESS", "RESOLVED", "VERIFIED", "CLOSED", "REJECTED", "REOPENED"];
const WATER_INCIDENT_FILTER = {
    $or: [
        { assignedAuthority: "WATER" },
        { category: "Water & Sanitation" },
    ],
};

export const getWaterIncidents = asyncHandler(async (req, res) => {
    const incidents = await Incident.find(WATER_INCIDENT_FILTER)
        .populate("reportedBy", "name email")
        .sort({ createdAt: -1 });

    res.json(new ApiResponse(200, incidents, "Water incidents retrieved successfully"));
});

export const getWaterDashboardStats = asyncHandler(async (req, res) => {
    const stats = await Incident.aggregate([
        {
            $match: WATER_INCIDENT_FILTER
        },
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        }
    ]);

    const result = {
        new: 0,
        inProgress: 0,
        completed: 0,
        highUrgency: 0
    };

    stats.forEach(s => {
        if (["OPEN", "REOPENED"].includes(s._id)) result.new += s.count;
        if (["ACCEPTED", "IN_PROGRESS"].includes(s._id)) result.inProgress += s.count;
        if (COMPLETED_STATUSES.includes(s._id)) result.completed += s.count;
    });

    result.highUrgency = await Incident.countDocuments({
        ...WATER_INCIDENT_FILTER,
        urgencyScore: { $gte: 75 },
        status: { $nin: INACTIVE_HIGH_URGENCY_STATUSES }
    });

    res.json(new ApiResponse(200, result, "Water dashboard stats retrieved successfully"));
});

export const getWaterCriticalIncidents = asyncHandler(async (req, res) => {
    const incidents = await Incident.find({
        ...WATER_INCIDENT_FILTER,
        urgencyScore: { $gte: 75 },
        status: { $nin: INACTIVE_HIGH_URGENCY_STATUSES }
    })
        .populate("reportedBy", "name email")
        .sort({ urgencyScore: -1, createdAt: -1 });

    res.json(new ApiResponse(200, incidents, "Water critical incidents retrieved successfully"));
});

export const getWaterReportAnalytics = asyncHandler(async (req, res) => {
    const totalComplaints = await Incident.countDocuments(WATER_INCIDENT_FILTER);

    const resolvedIncidents = await Incident.find({
        ...WATER_INCIDENT_FILTER,
        status: { $in: COMPLETED_STATUSES }
    });

    const resolvedCount = resolvedIncidents.length;

    let totalResolutionTime = 0;
    resolvedIncidents.forEach(inc => {
        const start = new Date(inc.createdAt);
        const end = new Date(inc.updatedAt);
        totalResolutionTime += Math.abs(end - start);
    });

    const avgResolutionHours = resolvedCount > 0
        ? (totalResolutionTime / resolvedCount / (1000 * 60 * 60)).toFixed(1)
        : 0;

    const resolutionRate = totalComplaints > 0
        ? Math.round((resolvedCount / totalComplaints) * 100)
        : 0;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const weeklyTrend = await Incident.aggregate([
        {
            $match: {
                ...WATER_INCIDENT_FILTER,
                createdAt: { $gte: sevenDaysAgo }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const match = weeklyTrend.find(w => w._id === dateStr);
        last7Days.push({
            name: dayNames[d.getDay()],
            count: match ? match.count : 0
        });
    }

    const categories = await Incident.aggregate([
        { $match: WATER_INCIDENT_FILTER },
        {
            $group: {
                _id: "$title",
                value: { $sum: 1 }
            }
        },
        { $sort: { value: -1 } },
        { $limit: 4 }
    ]);

    const formattedCategories = categories.map(c => ({
        name: c._id || "Undisclosed",
        value: c.value
    }));

    const allIncidentsForSectors = await Incident.find(WATER_INCIDENT_FILTER, "address");
    const sectorMap = {};
    allIncidentsForSectors.forEach(inc => {
        let sec = (inc.address || "Unknown Loc").split(',')[0].trim();
        if (sec.length > 15) sec = sec.substring(0, 15) + "...";
        sectorMap[sec] = (sectorMap[sec] || 0) + 1;
    });

    const sectorData = Object.keys(sectorMap)
        .map(key => ({ name: key, count: sectorMap[key] }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    res.json(new ApiResponse(200, {
        stats: {
            total: totalComplaints,
            resolved: resolvedCount,
            avgTime: avgResolutionHours,
            rate: resolutionRate
        },
        weeklyTrend: last7Days,
        categories: formattedCategories,
        sectors: sectorData
    }, "Water analytics retrieved successfully"));
});

export const getPowerIncidents = asyncHandler(async (req, res) => {
    // Fetch all incidents assigned to the Power Authority (ELECTRICITY)
    const incidents = await Incident.find({
        assignedAuthority: "ELECTRICITY"
    })
        .populate("reportedBy", "name email")
        .sort({ createdAt: -1 });

    res.json(new ApiResponse(200, incidents, "Power incidents retrieved successfully"));
});

export const getPowerDashboardStats = asyncHandler(async (req, res) => {
    // We want: New, In Progress, Work Completed, High Urgency
    // Statuses: OPEN, ACCEPTED, IN_PROGRESS, RESOLVED, VERIFIED, REOPENED, CLOSED, REJECTED, REVOKED

    const stats = await Incident.aggregate([
        {
            $match: { assignedAuthority: "ELECTRICITY" }
        },
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        }
    ]);

    // Map aggregate results to the specific buckets
    const result = {
        new: 0,
        inProgress: 0,
        completed: 0,
        highUrgency: 0
    };

    stats.forEach(s => {
        if (["OPEN", "REOPENED"].includes(s._id)) result.new += s.count;
        if (["ACCEPTED", "IN_PROGRESS"].includes(s._id)) result.inProgress += s.count;
        if (COMPLETED_STATUSES.includes(s._id)) result.completed += s.count;
    });

    // High Urgency is urgencyScore >= 75 and not resolved/closed
    result.highUrgency = await Incident.countDocuments({
        assignedAuthority: "ELECTRICITY",
        urgencyScore: { $gte: 75 },
        status: { $nin: INACTIVE_HIGH_URGENCY_STATUSES }
    });

    res.json(new ApiResponse(200, result, "Power dashboard stats retrieved successfully"));
});

export const getPowerCriticalIncidents = asyncHandler(async (req, res) => {
    const incidents = await Incident.find({
        assignedAuthority: "ELECTRICITY",
        urgencyScore: { $gte: 75 },
        status: { $nin: INACTIVE_HIGH_URGENCY_STATUSES }
    })
        .populate("reportedBy", "name email")
        .sort({ urgencyScore: -1, createdAt: -1 });

    res.json(new ApiResponse(200, incidents, "Power critical incidents retrieved successfully"));
});

export const updateIncidentStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, authorityMessage, resolutionImage } = req.body;

    if (!status && authorityMessage == null && !resolutionImage) {
        return res.status(400).json(new ApiResponse(400, null, "No authority updates were provided"));
    }

    if (status && !ALLOWED_AUTHORITY_STATUSES.includes(status)) {
        return res.status(400).json(new ApiResponse(400, null, "Invalid incident status"));
    }

    const incident = await Incident.findById(id);

    if (!incident) {
        return res.status(404).json(new ApiResponse(404, null, "Incident not found"));
    }

    if (!incidentBelongsToDepartment(incident, req.authorityDepartment || req.user?.department)) {
        return res.status(403).json(new ApiResponse(403, null, "You cannot update incidents for another authority"));
    }

    if (["REVOKED", "CLOSED"].includes(incident.status)) {
        return res.status(400).json(new ApiResponse(400, null, "This incident can no longer be updated by the authority"));
    }

    const previousStatus = incident.status;

    if (status) {
        incident.status = status;
        if (status !== "CLOSED") {
            incident.verifiedByUser = false;
        }
    }
    if (authorityMessage != null) {
        incident.authorityMessage = authorityMessage;
    }
    if (status === "REJECTED") {
        incident.rejectionReason = authorityMessage || incident.authorityMessage || incident.rejectionReason;
    }
    if (resolutionImage) {
        incident.resolutionImage = resolutionImage;
    }

    if (status && status !== previousStatus) {
        appendStatusHistory(incident, {
            status,
            actorRole: "AUTHORITY",
            actorLabel: getAuthorityLabel(incident.assignedAuthority),
            note: authorityMessage?.trim() || getDefaultStatusNote(status, incident),
            proofImage: resolutionImage || incident.resolutionImage || "",
        });
    } else if (status && status === previousStatus && (authorityMessage != null || resolutionImage)) {
        const history = ensureStatusHistory(incident);
        const latestEntry = history[history.length - 1];

        if (latestEntry?.status === status && latestEntry?.actorRole === "AUTHORITY") {
            if (authorityMessage?.trim()) {
                latestEntry.note = authorityMessage.trim();
            } else if (!latestEntry.note) {
                latestEntry.note = getDefaultStatusNote(status, incident);
            }

            if (resolutionImage) {
                latestEntry.proofImage = resolutionImage;
            }
        }
    }

    const updatedIncident = await incident.save();

    // Trigger notification
    await Notification.create({
        recipient: updatedIncident.reportedBy,
        title: "Incident Update",
        message: `Your reported incident "${updatedIncident.title}" status has been updated to ${status || updatedIncident.status}.`,
        type: "INCIDENT_UPDATE",
        relatedId: updatedIncident._id,
    });

    res.json(
        new ApiResponse(200, serializeIncidentForViewer(updatedIncident, req.user), "Incident updated successfully"),
    );
});

export const getPowerReportAnalytics = asyncHandler(async (req, res) => {
    const totalComplaints = await Incident.countDocuments({ assignedAuthority: "ELECTRICITY" });

    const resolvedIncidents = await Incident.find({
        assignedAuthority: "ELECTRICITY",
        status: { $in: COMPLETED_STATUSES }
    });

    const resolvedCount = resolvedIncidents.length;

    // Calculate Average Resolution Time
    let totalResolutionTime = 0;
    resolvedIncidents.forEach(inc => {
        const start = new Date(inc.createdAt);
        const end = new Date(inc.updatedAt);
        totalResolutionTime += Math.abs(end - start);
    });

    const avgResolutionHours = resolvedCount > 0
        ? (totalResolutionTime / resolvedCount / (1000 * 60 * 60)).toFixed(1)
        : 0;

    const resolutionRate = totalComplaints > 0
        ? Math.round((resolvedCount / totalComplaints) * 100)
        : 0;

    // Weekly Trend (last 7 days including today)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const weeklyTrend = await Incident.aggregate([
        {
            $match: {
                assignedAuthority: "ELECTRICITY",
                createdAt: { $gte: sevenDaysAgo }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Map to last 7 days names
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const match = weeklyTrend.find(w => w._id === dateStr);
        last7Days.push({
            name: dayNames[d.getDay()],
            count: match ? match.count : 0
        });
    }

    // Category Breakdown (Top 4)
    const categories = await Incident.aggregate([
        { $match: { assignedAuthority: "ELECTRICITY" } },
        {
            $group: {
                _id: "$title",
                value: { $sum: 1 }
            }
        },
        { $sort: { value: -1 } },
        { $limit: 4 }
    ]);

    const formattedCategories = categories.map(c => ({
        name: c._id || "Undisclosed",
        value: c.value
    }));

    // Sector Breakdown (Top 5)
    // Basic sector extraction from address
    const allIncidentsForSectors = await Incident.find({ assignedAuthority: "ELECTRICITY" }, "address");
    const sectorMap = {};
    allIncidentsForSectors.forEach(inc => {
        let sec = (inc.address || "Unknown Loc").split(',')[0].trim();
        if (sec.length > 15) sec = sec.substring(0, 15) + "...";
        sectorMap[sec] = (sectorMap[sec] || 0) + 1;
    });

    const sectorData = Object.keys(sectorMap)
        .map(key => ({ name: key, count: sectorMap[key] }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    res.json(new ApiResponse(200, {
        stats: {
            total: totalComplaints,
            resolved: resolvedCount,
            avgTime: avgResolutionHours,
            rate: resolutionRate
        },
        weeklyTrend: last7Days,
        categories: formattedCategories,
        sectors: sectorData
    }, "Power analytics retrieved successfully"));
});

// Road Infrastructure Authority (CIVIL)
export const getRoadIncidents = asyncHandler(async (req, res) => {
    const incidents = await Incident.find({
        assignedAuthority: "CIVIL"
    })
        .populate("reportedBy", "name email")
        .sort({ createdAt: -1 });

    res.json(new ApiResponse(200, incidents, "Road incidents retrieved successfully"));
});

export const getRoadDashboardStats = asyncHandler(async (req, res) => {
    const stats = await Incident.aggregate([
        {
            $match: { assignedAuthority: "CIVIL" }
        },
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        }
    ]);

    const result = {
        new: 0,
        inProgress: 0,
        completed: 0,
        highUrgency: 0
    };

    stats.forEach(s => {
        if (["OPEN", "REOPENED"].includes(s._id)) result.new += s.count;
        if (["ACCEPTED", "IN_PROGRESS"].includes(s._id)) result.inProgress += s.count;
        if (COMPLETED_STATUSES.includes(s._id)) result.completed += s.count;
    });

    result.highUrgency = await Incident.countDocuments({
        assignedAuthority: "CIVIL",
        urgencyScore: { $gte: 75 },
        status: { $nin: INACTIVE_HIGH_URGENCY_STATUSES }
    });

    res.json(new ApiResponse(200, result, "Road dashboard stats retrieved successfully"));
});

export const getRoadCriticalIncidents = asyncHandler(async (req, res) => {
    const incidents = await Incident.find({
        assignedAuthority: "CIVIL",
        urgencyScore: { $gte: 75 },
        status: { $nin: INACTIVE_HIGH_URGENCY_STATUSES }
    })
        .populate("reportedBy", "name email")
        .sort({ urgencyScore: -1, createdAt: -1 });

    res.json(new ApiResponse(200, incidents, "Road critical incidents retrieved successfully"));
});

export const getRoadReportAnalytics = asyncHandler(async (req, res) => {
    const totalComplaints = await Incident.countDocuments({ assignedAuthority: "CIVIL" });

    const resolvedIncidents = await Incident.find({
        assignedAuthority: "CIVIL",
        status: { $in: COMPLETED_STATUSES }
    });

    const resolvedCount = resolvedIncidents.length;

    // Calculate Average Resolution Time
    let totalResolutionTime = 0;
    resolvedIncidents.forEach(inc => {
        const start = new Date(inc.createdAt);
        const end = new Date(inc.updatedAt);
        totalResolutionTime += Math.abs(end - start);
    });

    const avgResolutionHours = resolvedCount > 0
        ? (totalResolutionTime / resolvedCount / (1000 * 60 * 60)).toFixed(1)
        : 0;

    const resolutionRate = totalComplaints > 0
        ? Math.round((resolvedCount / totalComplaints) * 100)
        : 0;

    // Weekly Trend (last 7 days including today)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const weeklyTrend = await Incident.aggregate([
        {
            $match: {
                assignedAuthority: "CIVIL",
                createdAt: { $gte: sevenDaysAgo }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Map to last 7 days names
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const match = weeklyTrend.find(w => w._id === dateStr);
        last7Days.push({
            name: dayNames[d.getDay()],
            count: match ? match.count : 0
        });
    }

    // Category Breakdown (Top 4)
    const categories = await Incident.aggregate([
        { $match: { assignedAuthority: "CIVIL" } },
        {
            $group: {
                _id: "$title",
                value: { $sum: 1 }
            }
        },
        { $sort: { value: -1 } },
        { $limit: 4 }
    ]);

    const formattedCategories = categories.map(c => ({
        name: c._id || "Undisclosed",
        value: c.value
    }));

    // Sector Breakdown (Top 5)
    const allIncidentsForSectors = await Incident.find({ assignedAuthority: "CIVIL" }, "address");
    const sectorMap = {};
    allIncidentsForSectors.forEach(inc => {
        let sec = (inc.address || "Unknown Loc").split(',')[0].trim();
        if (sec.length > 15) sec = sec.substring(0, 15) + "...";
        sectorMap[sec] = (sectorMap[sec] || 0) + 1;
    });

    const sectorData = Object.keys(sectorMap)
        .map(key => ({ name: key, count: sectorMap[key] }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    res.json(new ApiResponse(200, {
        stats: {
            total: totalComplaints,
            resolved: resolvedCount,
            avgTime: avgResolutionHours,
            rate: resolutionRate
        },
        weeklyTrend: last7Days,
        categories: formattedCategories,
        sectors: sectorData
    }, "Road analytics retrieved successfully"));
});
