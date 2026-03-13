import { Broadcast } from "../models/broadcast.model.js";
import { Notification } from "../models/notification.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAllBroadcasts = asyncHandler(async (req, res) => {
    const broadcasts = await Broadcast.find().sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, broadcasts, "Broadcasts fetched successfully"));
});

export const createBroadcast = asyncHandler(async (req, res) => {
    const { type, severity, location, message } = req.body;

    const typeMap = {
        'WILDLIFE_ALERT': 'WILDLIFE_ALERT',
        'ROAD_BLOCK': 'ROAD_BLOCK',
        'UTILITY_WARNING': 'UTILITY_WARNING',
        'SAFETY_ALERT': 'SAFETY_ALERT',
        'Wildlife Alert': 'WILDLIFE_ALERT',
        'Road Blockage': 'ROAD_BLOCK',
        'Power Outage': 'UTILITY_WARNING',
        'Water Supply': 'UTILITY_WARNING',
        'Public Safety': 'SAFETY_ALERT',
    };
    const mappedType = typeMap[type] || 'SAFETY_ALERT';

    const broadcast = await Broadcast.create({
        type: mappedType,
        severity,
        location,
        message,
        isAuthority: req.user.role === 'admin' || req.user.role === 'authority',
        createdBy: req.user._id,
    });

    // Trigger global notification
    await Notification.create({
        recipient: null,
        title: "New Broadcast Alert",
        message: `${mappedType.replace(/_/g, ' ')}: ${message}`,
        type: "BROADCAST",
        relatedId: broadcast._id,
    });

    return res.status(201).json(new ApiResponse(201, broadcast, "Broadcast created successfully"));
});
