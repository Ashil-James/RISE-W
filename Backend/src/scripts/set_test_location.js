/**
 * Helper script to set a location for an admin/test user.
 * 
 * Usage: node src/scripts/set_test_location.js
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from '../models/user.model.js';

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

const run = async () => {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB Atlas");

    // Give Wayanad coordinates to an admin user (or any user)
    const result = await User.findOneAndUpdate(
        { role: 'admin' }, // Try to find an admin first
        { $set: { location: { type: "Point", coordinates: [76.10, 11.60] } } },
        { new: true }
    );

    if (result) {
        console.log(`📍 Updated location for user: ${result.email}`);
        console.log("The weather monitoring job will now check this location every 5 minutes.");
    } else {
        // If no admin, just update the first user found
        const anyUser = await User.findOneAndUpdate(
            {},
            { $set: { location: { type: "Point", coordinates: [76.10, 11.60] } } },
            { new: true }
        );
        if (anyUser) {
            console.log(`📍 Updated location for user: ${anyUser.email}`);
        } else {
            console.log("❌ No users found in the database. Please sign up a user first.");
        }
    }

    await mongoose.disconnect();
};

run().catch((err) => {
    console.error("Error:", err);
    process.exit(1);
});
