/**
 * One-time script to backfill `assignedAuthority` for existing incidents.
 *
 * Usage:
 *   cd Backend
 *   node --env-file=.env src/scripts/backfillAuthority.js
 *
 * Or if your Node version doesn't support --env-file:
 *   npx dotenv -e .env -- node src/scripts/backfillAuthority.js
 */

import mongoose from "mongoose";
import { Incident } from "../models/incident.model.js";
import { DB_NAME } from "../constants.js";

const CATEGORY_TO_AUTHORITY = {
    "Water & Sanitation": "WATER",
    "Power Issue": "ELECTRICITY",
    "Infrastructure": "CIVIL",
    "Wildlife Intrusion": "CIVIL",
};

async function run() {
    const uri = `${process.env.MONGODB_URI}/${DB_NAME}`;
    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri);
    console.log("Connected.\n");

    // Find incidents missing assignedAuthority
    const incidents = await Incident.find({
        $or: [
            { assignedAuthority: { $exists: false } },
            { assignedAuthority: null },
        ],
    });

    console.log(`Found ${incidents.length} incidents without assignedAuthority.\n`);

    let updated = 0;
    for (const inc of incidents) {
        const authority = CATEGORY_TO_AUTHORITY[inc.category] || "CIVIL";
        inc.assignedAuthority = authority;
        await inc.save();
        updated++;
        console.log(`  ✓ ${inc.reportId} (${inc.category}) → ${authority}`);
    }

    console.log(`\nDone. Updated ${updated} incidents.`);
    await mongoose.disconnect();
    process.exit(0);
}

run().catch((err) => {
    console.error("Backfill failed:", err);
    process.exit(1);
});
