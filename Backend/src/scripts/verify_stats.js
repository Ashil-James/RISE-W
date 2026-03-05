import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/user.model.js";
import { Incident } from "../models/incident.model.js";
import { DB_NAME } from "../constants.js";

dotenv.config({
    path: "./.env"
});

const verifyStats = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log("MongoDB Connected");

        // Create a test user
        const testEmail = `test_${Date.now()}@example.com`;
        const user = await User.create({
            name: "Test User",
            email: testEmail,
            password: "password123",
            location: {
                type: "Point",
                coordinates: [0, 0]
            }
        });
        console.log(`User created: ${user.email}`);

        // Create Incidents
        await Incident.create({
            title: "Issue 1",
            description: "Desc 1",
            category: "WATER",
            reportedBy: user._id,
            status: "OPEN",
        });
        await Incident.create({
            title: "Issue 2",
            description: "Desc 2",
            category: "WATER",
            reportedBy: user._id,
            status: "RESOLVED",
        });
        await Incident.create({
            title: "Issue 3",
            description: "Desc 3",
            category: "WATER",
            reportedBy: user._id,
            status: "IN_PROGRESS",
        });
        console.log("Incidents created");

        // Verify Stats Logic
        const total = await Incident.countDocuments({ reportedBy: user._id });
        const resolved = await Incident.countDocuments({
            reportedBy: user._id,
            status: "RESOLVED",
        });
        const pending = await Incident.countDocuments({
            reportedBy: user._id,
            status: { $in: ["OPEN", "IN_PROGRESS", "ACCEPTED"] },
        });

        console.log("--- Stats Verification ---");
        console.log(`Total: ${total} (Expected: 3)`);
        console.log(`Resolved: ${resolved} (Expected: 1)`);
        console.log(`Pending: ${pending} (Expected: 2)`);

        if (total === 3 && resolved === 1 && (pending === 2)) {
            console.log("✅ Stats verification PASSED");
        } else {
            console.log("❌ Stats verification FAILED");
        }

        // Cleanup
        await Incident.deleteMany({ reportedBy: user._id });
        await User.deleteOne({ _id: user._id });
        console.log("Cleanup done");

        process.exit();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

verifyStats();
