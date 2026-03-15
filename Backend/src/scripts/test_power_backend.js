import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/user.model.js";
import { Incident } from "../models/incident.model.js";
import { DB_NAME } from "../constants.js";

dotenv.config({
    path: "./.env"
});

const testPowerBackend = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB Connected");

        // 1. Create a test user
        const testEmail = `test_power_${Date.now()}@example.com`;
        const user = await User.create({
            name: "Test Power User",
            email: testEmail,
            password: "password123",
            role: "user"
        });
        console.log(`Test user created: ${user.email}`);

        // 2. Create mock incidents for Power Authority
        // New
        await Incident.create({
            title: "Grid Failure",
            description: "Main transformer burst",
            category: "Power Issue",
            reportedBy: user._id,
            status: "OPEN",
            assignedAuthority: "ELECTRICITY",
            urgencyScore: 92
        });

        // In Progress
        await Incident.create({
            title: "Voltage Fluctuation",
            description: "Frequent fluctuations in Block C",
            category: "Power Issue",
            reportedBy: user._id,
            status: "IN_PROGRESS",
            assignedAuthority: "ELECTRICITY",
            urgencyScore: 55
        });

        // Completed
        await Incident.create({
            title: "Street Light Out",
            description: "Street light not working in Sector D",
            category: "Power Issue",
            reportedBy: user._id,
            status: "RESOLVED",
            assignedAuthority: "ELECTRICITY",
            urgencyScore: 30
        });

        // High Urgency (New)
        await Incident.create({
            title: "Live Wire Exposure",
            description: "Live wire lying on the road",
            category: "Power Issue",
            reportedBy: user._id,
            status: "OPEN",
            assignedAuthority: "ELECTRICITY",
            urgencyScore: 95
        });

        // Water Incident (for filtering check)
        await Incident.create({
            title: "Water Leak",
            description: "Pipe burst in Sector A",
            category: "Water & Sanitation",
            reportedBy: user._id,
            status: "OPEN",
            assignedAuthority: "WATER",
            urgencyScore: 40
        });

        console.log("Mock incidents created.");

        // 3. Test Stats Logic
        // Fetch current baseline (there might be existing data)
        const initialStatsAggregation = await Incident.aggregate([
            { $match: { assignedAuthority: "ELECTRICITY", reportedBy: { $ne: user._id } } },
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        const baseline = { new: 0, inProgress: 0, completed: 0, highUrgency: 0 };
        initialStatsAggregation.forEach(s => {
            if (["OPEN", "REOPENED"].includes(s._id)) baseline.new += s.count;
            if (["ACCEPTED", "IN_PROGRESS"].includes(s._id)) baseline.inProgress += s.count;
            if (["RESOLVED", "VERIFIED", "CLOSED"].includes(s._id)) baseline.completed += s.count;
        });
        baseline.highUrgency = await Incident.countDocuments({
            assignedAuthority: "ELECTRICITY",
            reportedBy: { $ne: user._id },
            urgencyScore: { $gte: 75 },
            status: { $nin: ["RESOLVED", "VERIFIED", "CLOSED"] }
        });

        const statsAggregation = await Incident.aggregate([
            { $match: { assignedAuthority: "ELECTRICITY" } },
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        const statsResult = { new: 0, inProgress: 0, completed: 0, highUrgency: 0 };
        statsAggregation.forEach(s => {
            if (["OPEN", "REOPENED"].includes(s._id)) statsResult.new += s.count;
            if (["ACCEPTED", "IN_PROGRESS"].includes(s._id)) statsResult.inProgress += s.count;
            if (["RESOLVED", "VERIFIED", "CLOSED"].includes(s._id)) statsResult.completed += s.count;
        });
        statsResult.highUrgency = await Incident.countDocuments({
            assignedAuthority: "ELECTRICITY",
            urgencyScore: { $gte: 75 },
            status: { $nin: ["RESOLVED", "VERIFIED", "CLOSED"] }
        });

        console.log("--- Stats Verification ---");
        console.log("Stats Result:", statsResult);
        console.log("Expected (Baseline + Test Data):", {
            new: baseline.new + 2,
            inProgress: baseline.inProgress + 1,
            completed: baseline.completed + 1,
            highUrgency: baseline.highUrgency + 2
        });

        if (statsResult.new === baseline.new + 2 &&
            statsResult.inProgress === baseline.inProgress + 1 &&
            statsResult.completed === baseline.completed + 1 &&
            statsResult.highUrgency === baseline.highUrgency + 2) {
            console.log("✅ Stats Logic PASSED");
        } else {
            console.log("❌ Stats Logic FAILED");
        }

        // 4. Test Critical Incidents Retrieval
        const criticalIncidents = await Incident.find({
            assignedAuthority: "ELECTRICITY",
            urgencyScore: { $gte: 75 },
            status: { $nin: ["RESOLVED", "VERIFIED", "CLOSED"] }
        });
        console.log("Critical Incidents Count:", criticalIncidents.length);
        if (criticalIncidents.length === baseline.highUrgency + 2) {
            console.log("✅ Critical Incidents Logic PASSED");
        } else {
            console.log("❌ Critical Incidents Logic FAILED");
        }

        // 5. Test User Power Incidents Retrieval
        const userPowerIncidents = await Incident.find({
            reportedBy: user._id,
            assignedAuthority: "ELECTRICITY"
        });
        console.log("User Power Incidents Count:", userPowerIncidents.length);
        if (userPowerIncidents.length === 4) {
            console.log("✅ User Power Incidents Logic PASSED");
        } else {
            console.log("❌ User Power Incidents Logic FAILED");
        }

        // Cleanup
        console.log("Cleaning up test data...");
        await Incident.deleteMany({ reportedBy: user._id });
        await User.deleteOne({ _id: user._id });
        console.log("Cleanup complete.");

        await mongoose.disconnect();
        console.log("MongoDB Disconnected.");
        process.exit(0);
    } catch (error) {
        console.error("Test failed:", error);
        process.exit(1);
    }
};

testPowerBackend();
