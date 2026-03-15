import mongoose from "mongoose";
import { Broadcast } from "./src/models/broadcast.model.js";
import { User } from "./src/models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

const fixBroadcasts = async () => {
    try {
        const uri = `${process.env.MONGODB_URI}/rise-w`;
        await mongoose.connect(uri);
        console.log("Connected to MongoDB: rise-w");

        const broadcasts = await Broadcast.find({});
        console.log(`Found ${broadcasts.length} total broadcasts`);

        for (const b of broadcasts) {
            let updated = false;

            // 1. Fix missing isAuthority flag if created by an authority user or admin
            if (!b.isAuthority) {
                const creator = await User.findById(b.createdBy);
                if (creator && (creator.role === 'admin' || creator.role === 'authority' || creator.role.includes('authority'))) {
                    console.log(`Fixing isAuthority for broadcast: ${b.title || b.type}`);
                    b.isAuthority = true;
                    updated = true;
                }
            }

            // 2. Map titles to correct types
            const typeMap = {
                'Power Outage': 'POWER_ALERT',
                'Power Outage Alert': 'POWER_ALERT',
                'Transformer Maintenance': 'POWER_ALERT',
                'Grid Failure Warning': 'POWER_ALERT',
                'High Voltage Safety Alert': 'POWER_ALERT',
                'Water Supply': 'WATER_ALERT',
                'Water Supply Interruption': 'WATER_ALERT',
                'Pipeline Repair': 'WATER_ALERT',
                'Muddy Water Warning': 'WATER_ALERT',
                'Water Shortage Alert': 'WATER_ALERT',
                'Road Blockage': 'ROAD_BLOCK',
                'Road Repair Notice': 'ROAD_ALERT',
                'Traffic Diversion': 'ROAD_ALERT',
                'Fallen Tree': 'ROAD_ALERT',
                'Wildlife Alert': 'WILDLIFE_ALERT',
            };

            // Check if Title or Current Type matches a known authority category
            const lookupValue = b.title || b.type;
            if (typeMap[lookupValue] && b.type !== typeMap[lookupValue]) {
                console.log(`Fixing type for broadcast: ${lookupValue} (${b.type} -> ${typeMap[lookupValue]})`);
                b.type = typeMap[lookupValue];
                updated = true;
            }

            if (updated) {
                await b.save();
                console.log(`Successfully updated broadcast: ${b._id}`);
            }
        }

        console.log("Finished fixing broadcasts");
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

fixBroadcasts();
