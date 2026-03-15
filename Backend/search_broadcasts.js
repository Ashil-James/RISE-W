import mongoose from "mongoose";
import { Broadcast } from "./src/models/broadcast.model.js";
import dotenv from "dotenv";

dotenv.config();

const search = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const found = await Broadcast.find({
            $or: [
                { title: /Power/i },
                { title: /High Voltage/i },
                { message: /Power/i }
            ]
        });

        console.log(`Found ${found.length} matching broadcasts`);
        found.forEach(f => {
            console.log(`- ${f.title} (${f.type}, ${f.severity}, isAuth: ${f.isAuthority})`);
            console.log(`  Message: ${f.message}`);
        });

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

search();
