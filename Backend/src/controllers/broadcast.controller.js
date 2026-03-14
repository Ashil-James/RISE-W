import { Broadcast } from "../models/broadcast.model.js";
import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAllBroadcasts = asyncHandler(async (req, res) => {
    // Only fetch broadcasts that the user is explicitly authorized to see
    // Global broadcasts have recipient: null. Targeted proximity broadcasts have recipient: user._id
    const notifyQuery = { type: "BROADCAST" };
    
    if (req.user) {
        notifyQuery.$or = [
            { recipient: null }, 
            { recipient: req.user._id } 
        ];
    } else {
        notifyQuery.recipient = null; // Unregistered users only see Global Broadcasts
    }

    // Fetch the notifications securely meant for them
    const notifications = await Notification.find(notifyQuery)
        .populate({ path: 'relatedId', model: 'Broadcast' })
        .sort({ createdAt: -1 });

    // Retrieve the actual original Broadcast documents from the notifications
    const broadcasts = notifications
        .map(n => n.relatedId)
        .filter(b => b != null);

    // De-duplicate just in case
    const uniqueBroadcasts = Array.from(new Set(broadcasts.map(b => b._id.toString())))
        .map(id => broadcasts.find(b => b._id.toString() === id));

    return res.status(200).json(new ApiResponse(200, uniqueBroadcasts, "Broadcasts fetched successfully"));
});

export const createBroadcast = asyncHandler(async (req, res) => {
    const { type, severity, location, message, targetArea } = req.body;

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
                message: `${mappedType.replace(/_/g, ' ')}: ${message}`,
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
            message: `${mappedType.replace(/_/g, ' ')}: ${message}`,
            type: "BROADCAST",
            relatedId: broadcast._id,
        });
    }

    return res.status(201).json(new ApiResponse(201, broadcast, "Broadcast created successfully"));
});
