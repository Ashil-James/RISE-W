/**
 * Seed script to create a test WeatherEvent for testing the Post-Storm Survey.
 * 
 * Usage:  node src/scripts/seed_weather_test.js
 * 
 * This inserts a fake "ended storm" event so the survey page becomes active.
 * Delete it after testing with:  node src/scripts/seed_weather_test.js --cleanup
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import { WeatherEvent } from '../models/weatherEvent.model.js';

const MONGO_URI = (process.env.MONGODB_URI || process.env.MONGO_URI);
const DB_NAME = "rise-w";
const FULL_URI = MONGO_URI.endsWith(`/${DB_NAME}`) ? MONGO_URI : `${MONGO_URI}/${DB_NAME}`;

const run = async () => {
    await mongoose.connect(FULL_URI);
    console.log("✅ Connected to MongoDB Atlas");

    const isCleanup = process.argv.includes("--cleanup");

    if (isCleanup) {
        const result = await WeatherEvent.deleteMany({ isSurveyTriggered: true });
        console.log(`🗑️  Deleted ${result.deletedCount} test weather event(s).`);
    } else {
        const event = await WeatherEvent.create({
            location: { type: "Point", coordinates: [76.1, 11.6] },
            isActive: false,
            isSurveyTriggered: true,
            startTime: new Date(Date.now() - 3600000), // 1 hour ago
            endTime: new Date(), // just ended
        });
        console.log(`🌧️  Test weather event created! ID: ${event._id}`);
        console.log(`📋 Survey will be active for 24 hours.`);
        console.log(`\n   To clean up later, run:  node src/scripts/seed_weather_test.js --cleanup`);
    }

    await mongoose.disconnect();
};

run().catch((err) => {
    console.error("Error:", err);
    process.exit(1);
});
