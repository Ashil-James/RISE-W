import { Incident } from "../models/incident.model.js";
import { Broadcast } from "../models/broadcast.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAllIncidents = asyncHandler(async (req, res) => {
    const incidents = await Incident.find()
        .populate("reportedBy", "name email")
        .sort({ createdAt: -1 });

    res.json(new ApiResponse(200, incidents, "Incidents retrieved successfully"));
});

export const GetIncidentbyReportId = asyncHandler(async (req, res) => {
    const { reportId } = req.params;

    const incident = await Incident.findOne({ reportId }).populate(
        "reportedBy",
        "name email"
    );

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
            new ApiResponse(200, broadcasts, "Broadcasts retrieved successfully")
        );
});

export const createBroadcast = asyncHandler(async (req, res) => {
    const { type, severity, location, message } = req.body;

    const broadcast = await Broadcast.create({
        type,
        severity,
        location,
        message,
        createdBy: req.user._id,
        isAuthority: true,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, broadcast, "Broadcast created successfully"));
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
        status: { $in: ["OPEN", "ACCEPTED", "IN_PROGRESS"] }
    });
    const resolvedIncidents = await Incident.countDocuments({ status: "RESOLVED" });
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
