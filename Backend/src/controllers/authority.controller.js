import { Incident } from "../models/incident.model.js";
import { Notification } from "../models/notification.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getWaterIncidents = asyncHandler(async (req, res) => {
    // Fetch all incidents categorized as "Water & Sanitation" (or potentially mapped fields)
    const incidents = await Incident.find({
        category: "Water & Sanitation"
    })
        .populate("reportedBy", "name email")
        .sort({ createdAt: -1 });

    res.json(new ApiResponse(200, incidents, "Water incidents retrieved successfully"));
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
    // Statuses: OPEN, ACCEPTED, IN_PROGRESS, RESOLVED, VERIFIED, REOPENED, CLOSED, REJECTED

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
        if (["RESOLVED", "VERIFIED", "CLOSED"].includes(s._id)) result.completed += s.count;
    });

    // High Urgency is urgencyScore >= 75 and not resolved/closed
    result.highUrgency = await Incident.countDocuments({
        assignedAuthority: "ELECTRICITY",
        urgencyScore: { $gte: 75 },
        status: { $nin: ["RESOLVED", "VERIFIED", "CLOSED"] }
    });

    res.json(new ApiResponse(200, result, "Power dashboard stats retrieved successfully"));
});

export const getPowerCriticalIncidents = asyncHandler(async (req, res) => {
    const incidents = await Incident.find({
        assignedAuthority: "ELECTRICITY",
        urgencyScore: { $gte: 75 },
        status: { $nin: ["RESOLVED", "VERIFIED", "CLOSED"] }
    })
        .populate("reportedBy", "name email")
        .sort({ urgencyScore: -1, createdAt: -1 });

    res.json(new ApiResponse(200, incidents, "Power critical incidents retrieved successfully"));
});

export const updateIncidentStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, authorityMessage } = req.body;

    const incident = await Incident.findById(id);

    if (!incident) {
        return res.status(404).json(new ApiResponse(404, null, "Incident not found"));
    }

    if (status) incident.status = status;
    if (authorityMessage) incident.authorityMessage = authorityMessage;

    const updatedIncident = await incident.save();

    // Trigger notification
    await Notification.create({
        recipient: updatedIncident.reportedBy,
        title: "Incident Update",
        message: `Your reported incident "${updatedIncident.title}" status has been updated to ${status || updatedIncident.status}.`,
        type: "INCIDENT_UPDATE",
        relatedId: updatedIncident._id,
    });

    res.json(new ApiResponse(200, updatedIncident, "Incident updated successfully"));
});

export const getPowerReportAnalytics = asyncHandler(async (req, res) => {
    const totalComplaints = await Incident.countDocuments({ assignedAuthority: "ELECTRICITY" });

    const resolvedIncidents = await Incident.find({
        assignedAuthority: "ELECTRICITY",
        status: { $in: ["RESOLVED", "VERIFIED", "CLOSED"] }
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
