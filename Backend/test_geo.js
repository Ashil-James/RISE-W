import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { User } from './src/models/user.model.js';

async function fix() {
    await mongoose.connect(process.env.MONGODB_URI);
    try {
        console.log("Finding invalid locations...");
        const result = await User.updateMany(
            { "location.coordinates": { $exists: false } }, 
            { $unset: { location: 1 } }
        );
        console.log("Fixed invalid users:", result.modifiedCount);

        console.log("Re-syncing indexes...");
        await User.syncIndexes();
        console.log("Indexes fixed.");

    } catch(e) {
        console.error('Error:', e);
    }
    process.exit(0);
}

fix();
