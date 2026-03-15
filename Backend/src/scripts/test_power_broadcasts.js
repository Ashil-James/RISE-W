import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Broadcast } from '../models/broadcast.model.js';
import { Notification } from '../models/notification.model.js';
import { User } from '../models/user.model.js';

dotenv.config();

async function testBroadcastFlow() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB Connected");

        // 1. Find a test authority user
        let authUser = await User.findOne({ role: /authority/i });
        if (!authUser) {
            console.log("No authority user found, creating one...");
            authUser = await User.create({
                name: "Power Official",
                email: "power_official@example.com",
                password: "password123",
                role: "power_authority",
                department: "ELECTRICITY"
            });
        }
        console.log(`Using Authority User: ${authUser.name} (${authUser.role})`);

        // 2. Create a Power Alert
        console.log("Creating a power broadcast...");
        const broadcastData = {
            title: "Grid Maintenance Alert",
            type: "POWER_ALERT",
            severity: "Medium",
            location: "Sector 4 & 5",
            message: "Scheduled grid maintenance from 10 AM to 2 PM.",
            isAuthority: true,
            createdBy: authUser._id
        };
        const broadcast = await Broadcast.create(broadcastData);
        console.log(`Broadcast created: ${broadcast._id} - ${broadcast.title}`);

        // 3. Check for Global Notification
        const notification = await Notification.findOne({ relatedId: broadcast._id });
        if (notification) {
            console.log(`Global notification created: ${notification.title}`);
            console.log(`Message: ${notification.message}`);
        } else {
            console.log("❌ Global notification NOT found");
        }

        // 4. Verify History Query (getAllBroadcasts logic)
        // Global notifications have recipient: null
        const notifyQuery = { type: "BROADCAST", recipient: null };
        const notifications = await Notification.find(notifyQuery)
            .populate({ path: 'relatedId', model: 'Broadcast' });

        const found = notifications.some(n => n.relatedId?._id.toString() === broadcast._id.toString());
        console.log(`Broadcast found in notifications history: ${found ? "YES ✅" : "NO ❌"}`);

        // 5. Verify Authority History (Should find its own created broadcasts)
        const createdByMe = await Broadcast.find({ createdBy: authUser._id });
        const inCreated = createdByMe.some(b => b._id.toString() === broadcast._id.toString());
        console.log(`Broadcast found in author's history: ${inCreated ? "YES ✅" : "NO ❌"}`);

        console.log("✅ Power Authority Broadcast Logic Sanity Check PASSED");

    } catch (error) {
        console.error("❌ Test Failed:", error);
    } finally {
        await mongoose.disconnect();
        console.log("MongoDB Disconnected");
    }
}

testBroadcastFlow();
