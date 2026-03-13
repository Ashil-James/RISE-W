import { Notification } from "../models/notification.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Fetch notifications for the logged-in user
export const getUserNotifications = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Fetch personal notifications OR global ones
    const notifications = await Notification.find({
        $or: [
            { recipient: userId },
            { recipient: null } // Global broadcasts
        ]
    }).sort({ createdAt: -1 }).limit(50); // Limit to latest 50 for performance

    // Add a dynamic field indicating if this user has read it
    const formattedNotifications = notifications.map(notif => {
        let read = false;
        if (notif.recipient) {
            read = notif.isRead;
        } else {
            // For global notifications, check if user's ID is in the readBy array
            read = notif.readBy.some(id => id.toString() === userId.toString());
        }

        return {
            ...notif.toObject(),
            userReadStatus: read
        };
    });

    return res.status(200).json(
        new ApiResponse(200, formattedNotifications, "Notifications fetched successfully")
    );
});

// Mark a specific notification as read
export const markAsRead = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const notificationId = req.params.id;

    const notification = await Notification.findById(notificationId);

    if (!notification) {
        return res.status(404).json(new ApiResponse(404, null, "Notification not found"));
    }

    if (notification.recipient) {
        // Personal notification
        if (notification.recipient.toString() !== userId.toString()) {
            return res.status(403).json(new ApiResponse(403, null, "Unauthorized"));
        }
        notification.isRead = true;
    } else {
        // Global notification
        const alreadyRead = notification.readBy.some(id => id.toString() === userId.toString());
        if (!alreadyRead) {
            notification.readBy.push(userId);
        }
    }

    await notification.save();

    return res.status(200).json(
        new ApiResponse(200, notification, "Notification marked as read")
    );
});

// Mark all notifications as read for the user
export const markAllAsRead = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // 1. Mark all personal notifications as read
    await Notification.updateMany(
        { recipient: userId, isRead: false },
        { $set: { isRead: true } }
    );

    // 2. Mark all global notifications as read by adding userId to readBy roughly
    // First find unread global notifications
    const globalUnread = await Notification.find({
        recipient: null,
        readBy: { $ne: userId }
    });

    // Update each one
    for (const notif of globalUnread) {
        notif.readBy.push(userId);
        await notif.save();
    }

    return res.status(200).json(
        new ApiResponse(200, null, "All notifications marked as read")
    );
});
