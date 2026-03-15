import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            // If recipient is null, it's considered a global notification (like a broadcast)
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["INCIDENT_UPDATE", "BROADCAST", "SYSTEM", "NEW_INCIDENT"],
            required: true,
        },
        targetDepartment: {
            type: String,
            enum: ["WATER", "ELECTRICITY", "CIVIL", "ADMIN"],
        },
        relatedId: {
            // Can refer to an Incident ID or a Broadcast ID
            type: mongoose.Schema.Types.ObjectId,
        },
        readBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        isRead: {
            // For personal notifications (where recipient is set)
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

export const Notification = mongoose.model("Notification", notificationSchema);
