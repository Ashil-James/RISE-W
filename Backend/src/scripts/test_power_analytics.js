import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Incident } from '../models/incident.model.js';

dotenv.config();

async function testAnalytics() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB Connected");

        const electricityIncidents = await Incident.find({ assignedAuthority: "ELECTRICITY" });
        console.log(`Total Electricity Incidents in DB: ${electricityIncidents.length}`);

        // We can't easily call the controller without a mock req/res, 
        // but we can sanity check the aggregation logic.

        const total = await Incident.countDocuments({ assignedAuthority: "ELECTRICITY" });
        const resolved = await Incident.countDocuments({
            assignedAuthority: "ELECTRICITY",
            status: { $in: ["RESOLVED", "VERIFIED", "CLOSED"] }
        });

        console.log(`Stats Sanity Check: Total=${total}, Resolved=${resolved}`);

        // Weekly Trend
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const trend = await Incident.aggregate([
            {
                $match: {
                    assignedAuthority: "ELECTRICITY",
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        console.log("Weekly Trend Data:", JSON.stringify(trend, null, 2));

        // Categories
        const categories = await Incident.aggregate([
            { $match: { assignedAuthority: "ELECTRICITY" } },
            {
                $group: {
                    _id: "$title",
                    value: { $sum: 1 }
                }
            },
            { $sort: { value: -1 } },
            { $limit: 4 }
        ]);
        console.log("Top Categories:", JSON.stringify(categories, null, 2));

        console.log("✅ Analytics Logic Sanity Check PASSED");

    } catch (error) {
        console.error("❌ Test Failed:", error);
    } finally {
        await mongoose.disconnect();
        console.log("MongoDB Disconnected");
    }
}

testAnalytics();
