import { Incident } from "../models/incident.model.js";
import { Broadcast } from "../models/broadcast.model.js";
import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
    buildBroadcastNotificationContent,
    normalizeBroadcastInput,
    serializeBroadcast,
    serializeBroadcastCollection,
} from "../utils/broadcastPresentation.js";

export const getAllIncidents = asyncHandler(async (req, res) => {
    const incidents = await Incident.find()
        .populate("reportedBy", "name email")
        .sort({ createdAt: -1 });

    res.json(new ApiResponse(200, incidents, "Incidents retrieved successfully"));
});

export const GetIncidentbyReportId = asyncHandler(async (req, res) => {
    const { reportId } = req.params;

    let incident = await Incident.findOne({ reportId }).populate(
        "reportedBy",
        "name email"
    );

    // Fallback: If not found by reportId (e.g., legacy test data without a reportId), 
    // and the param is a valid length or starts with "ID-", try finding by _id if possible.
    if (!incident) {
        let searchId = reportId;
        if (reportId.startsWith("ID-")) {
            searchId = reportId.substring(3); // Extract the prefix
            // It's a substring of the original ID, so we use a regex or just fallback
        }
        
        try {
            // If it's a valid 24 char hex or we just do a generic search
            if (reportId.length === 24) {
               incident = await Incident.findById(reportId).populate("reportedBy", "name email");
            } else if (reportId.startsWith("ID-")) {
               incident = await Incident.findOne({ _id: { $regex: `^${searchId}` } }).populate("reportedBy", "name email");
            }
        } catch (e) {
            // Ignore cast errors string to ObjectId
        }
    }

    if (!incident) {
        return res
            .status(404)
            .json(new ApiResponse(404, null, "Incident not found"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, incident, "Incident retrieved successfully"));
});

export const getAllBroadcasts = asyncHandler(async (req, res) => {
    const broadcasts = await Broadcast.find()
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(
            new ApiResponse(200, serializeBroadcastCollection(broadcasts), "Broadcasts retrieved successfully")
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
        createdBy: req.user._id,
        isAuthority: normalized.isAuthority,
    });

    const notificationContent = buildBroadcastNotificationContent(broadcast);

    // Trigger global notification
    await Notification.create({
        recipient: null,
        title: notificationContent.title,
        message: notificationContent.message,
        type: "BROADCAST",
        relatedId: broadcast._id,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, serializeBroadcast(broadcast), "Broadcast created successfully"));
});

export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, users, "Users retrieved successfully"));
});

export const updateUserRole = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["user", "admin", "authority"].includes(role)) {
        return res.status(400).json(new ApiResponse(400, null, "Invalid role"));
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { role },
        { new: true }
    ).select("-password");

    if (!user) {
        return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User role updated successfully"));
});

export const getSystemStats = asyncHandler(async (req, res) => {
    const totalIncidents = await Incident.countDocuments();
    const openIncidents = await Incident.countDocuments({
        status: { $in: ["OPEN", "ACCEPTED", "IN_PROGRESS", "REOPENED"] }
    });
    const resolvedIncidents = await Incident.countDocuments({
        status: { $in: ["RESOLVED", "VERIFIED", "CLOSED"] }
    });
    const rejectedIncidents = await Incident.countDocuments({ status: "REJECTED" });
    const totalUsers = await User.countDocuments({ role: "user" });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalIncidents,
                openIncidents,
                resolvedIncidents,
                rejectedIncidents,
                totalUsers,
            },
            "System statistics retrieved successfully"
        )
    );
});
