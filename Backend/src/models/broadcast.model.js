import mongoose from "mongoose";

const broadcastSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["WILDLIFE_ALERT", "ROAD_BLOCK", "UTILITY_WARNING", "SAFETY_ALERT", "POWER_ALERT", "WATER_ALERT", "ROAD_ALERT"],
            required: true,
        },
        severity: {
            type: String,
            enum: ["High", "Medium", "Low"],
            required: true,
        },
        location: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        isAuthority: {
            type: Boolean,
            default: false,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Broadcast = mongoose.model("Broadcast", broadcastSchema);
