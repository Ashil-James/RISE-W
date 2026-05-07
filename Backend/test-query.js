import mongoose from 'mongoose';
import { Incident } from './src/models/incident.model.js';
import dotenv from 'dotenv';
dotenv.config();

const WATER_INCIDENT_FILTER = {
    $or: [
        { assignedAuthority: "WATER" },
        { category: "Water & Sanitation" },
    ],
};
const COMPLETED_STATUSES = ["RESOLVED", "VERIFIED", "CLOSED"];
const INACTIVE_HIGH_URGENCY_STATUSES = [...COMPLETED_STATUSES, "REJECTED", "REVOKED"];

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    try {
        const result = await Incident.find({
            ...WATER_INCIDENT_FILTER,
            $expr: {
                $gte: [
                    {
                        $min: [
                            100,
                            {
                                $add: [
                                    { $ifNull: ["$urgencyScore", 10] },
                                    { $ifNull: ["$upvotes", 0] }
                                ]
                            }
                        ]
                    },
                    75
                ]
            },
            status: { $nin: INACTIVE_HIGH_URGENCY_STATUSES }
        });
        console.log("SUCCESS, found count:", result.length);
    } catch (e) {
        console.error("ERROR running query:", e);
    }
    process.exit(0);
}
run();
