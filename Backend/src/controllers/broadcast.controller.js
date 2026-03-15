import { Broadcast } from "../models/broadcast.model.js";
import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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

    return res.status(200).json(new ApiResponse(200, uniqueBroadcasts, "Broadcasts fetched successfully"));
});

export const createBroadcast = asyncHandler(async (req, res) => {
    const { title, type, severity, location, message, targetArea } = req.body;

    const typeMap = {
        'WILDLIFE_ALERT': 'WILDLIFE_ALERT',
        'ROAD_BLOCK': 'ROAD_BLOCK',
        'UTILITY_WARNING': 'UTILITY_WARNING',
        'SAFETY_ALERT': 'SAFETY_ALERT',
        'POWER_ALERT': 'POWER_ALERT',
        'WATER_ALERT': 'WATER_ALERT',
        'ROAD_ALERT': 'ROAD_ALERT',

        // Power Authority Titles
        'Power Outage': 'POWER_ALERT',
        'Power Outage Alert': 'POWER_ALERT',
        'Transformer Maintenance': 'POWER_ALERT',
        'Grid Failure Warning': 'POWER_ALERT',
        'High Voltage Safety Alert': 'POWER_ALERT',

        // Water Authority Titles
        'Water Supply': 'WATER_ALERT',
        'Water Supply Interruption': 'WATER_ALERT',
        'Pipeline Repair': 'WATER_ALERT',
        'Muddy Water Warning': 'WATER_ALERT',
        'Water Shortage Alert': 'WATER_ALERT',

        // Road Authority Titles
        'Road Blockage': 'ROAD_BLOCK',
        'Road Repair Notice': 'ROAD_ALERT',
        'Traffic Diversion': 'ROAD_ALERT',
        'Fallen Tree': 'ROAD_ALERT',
        'Wildlife Alert': 'WILDLIFE_ALERT',

        // Admin Titles
        'Public Safety': 'SAFETY_ALERT',
    };
    const mappedType = typeMap[type] || 'SAFETY_ALERT';

    const broadcast = await Broadcast.create({
        title: title || type || "Broadcast Alert",
        type: mappedType,
        severity,
        location,
        message,
        isAuthority: req.user.role === 'admin' || req.user.role === 'authority' || req.user.role.includes('authority'),
        createdBy: req.user._id,
    });

    if (targetArea && targetArea.center && targetArea.radiusKm) {
        // Targeted Proximity Broadcast
        const { center, radiusKm } = targetArea;
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
                title: "Targeted Proximity Alert",
                message: `${broadcast.title}: ${message}`,
                type: "BROADCAST",
                relatedId: broadcast._id,
            }));
            await Notification.insertMany(notifications);
        }
    } else {
        // Global Broadcast
        await Notification.create({
            recipient: null,
            title: "New Broadcast Alert",
            message: `${broadcast.title}: ${message}`,
            type: "BROADCAST",
            relatedId: broadcast._id,
        });
    }

    return res.status(201).json(new ApiResponse(201, broadcast, "Broadcast created successfully"));
});
