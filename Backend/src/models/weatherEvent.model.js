import mongoose from "mongoose";

const weatherEventSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            default: "HEAVY_RAIN",
        },
        location: {
            type: {
                type: String,
                enum: ["Point"],
            },
            coordinates: {
                type: [Number],
            },
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isSurveyTriggered: {
            type: Boolean,
            default: false,
        },
        startTime: {
            type: Date,
            default: Date.now,
        },
        endTime: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

weatherEventSchema.index({ location: "2dsphere" });

export const WeatherEvent = mongoose.model("WeatherEvent", weatherEventSchema);
