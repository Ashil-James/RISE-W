import mongoose from "mongoose";
import { Broadcast } from "./src/models/broadcast.model.js";
import { User } from "./src/models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

const diagnose = async () => {
    try {
        const uri = `${process.env.MONGODB_URI}/rise-w`;
        await mongoose.connect(uri);
        console.log("Connected to MongoDB: rise-w");

        const broadcasts = await Broadcast.find({}).populate('createdBy', 'name email role department').sort({ createdAt: -1 });
        console.log(`Found ${broadcasts.length} total broadcasts:`);

        broadcasts.forEach((b, i) => {
            console.log(`\n[${i + 1}] ID: ${b._id}`);
            console.log(`    Title: ${b.title}`);
            console.log(`    Type: ${b.type}`);
            console.log(`    Severity: ${b.severity}`);
            console.log(`    IsAuthority: ${b.isAuthority}`);
            console.log(`    CreatedBy: ${b.createdBy ? `${b.createdBy.name} (${b.createdBy.role}, ${b.createdBy.department})` : 'Unknown'}`);
            console.log(`    Created At: ${b.createdAt}`);
            console.log(`    Message: ${b.message}`);
        });

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

diagnose();
