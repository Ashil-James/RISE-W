import { Broadcast } from "../models/broadcast.model.js";
import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
    buildBroadcastNotificationContent,
    normalizeBroadcastInput,
    serializeBroadcast,
    serializeBroadcastCollection,
} from "../utils/broadcastPresentation.js";

export const getAllBroadcasts = asyncHandler(async (req, res) => {
    // 1. Fetch direct notifications meant for this user (targeted or global)
    const notifyQuery = { type: "BROADCAST" };

    if (req.user) {
        notifyQuery.$or = [
            { recipient: null },
            { recipient: req.user._id }
        ];
    } else {
        notifyQuery.recipient = null;
    }

    const notifications = await Notification.find(notifyQuery)
        .populate({ path: 'relatedId', model: 'Broadcast' })
        .sort({ createdAt: -1 });

    const notifiedBroadcasts = notifications
        .map(n => n.relatedId)
        .filter(b => b != null);

    // 2. If user is an authority or admin, also include broadcasts they should see in history
    let createdBroadcasts = [];
    if (req.user && (req.user.role === 'admin' || req.user.role === 'authority')) {
        let historyQuery = {};
        if (req.user.role === 'authority') {
            const dept = req.user.department;
            const relevantTypes = [];
            if (dept === 'ELECTRICITY') relevantTypes.push('POWER_ALERT');
            else if (dept === 'WATER') relevantTypes.push('WATER_ALERT');
            else if (dept === 'CIVIL') relevantTypes.push('ROAD_ALERT', 'ROAD_BLOCK', 'WILDLIFE_ALERT');

            historyQuery = {
                $or: [
                    { type: { $in: relevantTypes } },
                    { createdBy: req.user._id }
                ]
            };
        }
        // Admin sees all history; Authority sees department-specific or own
        createdBroadcasts = await Broadcast.find(historyQuery).sort({ createdAt: -1 });
    }

    // Combine and de-duplicate
    const allBroadcasts = [...notifiedBroadcasts, ...createdBroadcasts];
    const uniqueBroadcasts = Array.from(new Set(allBroadcasts.map(b => b._id.toString())))
        .map(id => allBroadcasts.find(b => b._id.toString() === id))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json(
        new ApiResponse(200, serializeBroadcastCollection(uniqueBroadcasts), "Broadcasts fetched successfully"),
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
        isAuthority: normalized.isAuthority,
        sourceType: normalized.sourceType,
        actionTarget: normalized.actionTarget,
        expiresAt: normalized.expiresAt,
        createdBy: req.user._id,
    });

    const notificationContent = buildBroadcastNotificationContent(broadcast);

    if (normalized.targetArea && normalized.targetArea.center && normalized.targetArea.radiusKm) {
        // Targeted Proximity Broadcast
        const { center, radiusKm } = normalized.targetArea;
        // Divide by equatorial radius of earth (6378.1 km) to get radians
        const radiusRadian = radiusKm / 6378.1;

        const usersInArea = await User.find({
            location: {
                $geoWithin: {
                    $centerSphere: [[center.lng, center.lat], radiusRadian]
                }
            }
        });

        // Generate individual notifications for ONLY the users inside the circle
        if (usersInArea.length > 0) {
            const notifications = usersInArea.map(u => ({
                recipient: u._id,
                title: notificationContent.title,
                message: notificationContent.message,
                type: "BROADCAST",
                relatedId: broadcast._id,
            }));
            await Notification.insertMany(notifications);
        }
    } else {
        // Global Broadcast
        await Notification.create({
            recipient: null,
            title: notificationContent.title,
            message: notificationContent.message,
            type: "BROADCAST",
            relatedId: broadcast._id,
        });
    }

    return res.status(201).json(
        new ApiResponse(201, serializeBroadcast(broadcast), "Broadcast created successfully"),
    );
});
