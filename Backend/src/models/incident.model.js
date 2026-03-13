import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema(
    {
        reportId: {
            type: String,
            unique: true,
            default: () => `REP-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        subCategory: {
            type: String,
        },
        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        assignedAuthority: {
            type: String,
            enum: ["WATER", "ELECTRICITY", "CIVIL"],
        },
        status: {
            type: String,
            enum: [
                "OPEN",
                "ACCEPTED",
                "IN_PROGRESS",
                "RESOLVED",
                "VERIFIED",
                "REOPENED",
                "CLOSED",
                "REJECTED",
            ],
            default: "OPEN",
        },
        location: {
            type: {
                type: String,
                enum: ["Point"],
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
            },
        },
        address: {
            type: String,
        },
        image: {
            type: String,
        },
        resolutionImage: {
            type: String,
        },
        authorityMessage: {
            type: String,
        },
        rejectionReason: {
            type: String,
        },
        urgencyScore: {
            type: Number,
            default: 1,
        },
        upvotes: {
            type: Number,
            default: 0,
        },
        upvotedBy: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }],
        verifiedByUser: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

incidentSchema.index({ location: "2dsphere" });

export const Incident = mongoose.model("Incident", incidentSchema);
