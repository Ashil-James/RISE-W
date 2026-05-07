import mongoose from "mongoose";
import dotenv from "dotenv";
import { DB_NAME } from "./src/constants.js";

dotenv.config();

const uri = process.env.MONGODB_URI;
const fullUri = `${uri}/${DB_NAME}`;

console.log("--- MongoDB Connection Diagnostic ---");
console.log(`Target URI: ${uri.replace(/:([^:@]+)@/, ":****@")}`); // Hide password
console.log(`Database: ${DB_NAME}`);
console.log("-------------------------------------");

async function testConnection() {
    try {
        console.log("Attempting to connect...");
        const conn = await mongoose.connect(fullUri, {
            serverSelectionTimeoutMS: 5000, // 5 second timeout
        });
        console.log("✅ SUCCESS: Connected to MongoDB Atlas!");
        console.log(`Host: ${conn.connection.host}`);
        process.exit(0);
    } catch (error) {
        console.error("❌ FAILURE: Connection failed.");
        console.error(`Error Name: ${error.name}`);
        console.error(`Error Message: ${error.message}`);

        if (error.message.includes("IP isn't whitelisted") || error.name === "MongooseServerSelectionError") {
            console.log("\n💡 SUGGESTION: This is likely an IP Whitelist issue.");
            console.log("1. Go to MongoDB Atlas: https://cloud.mongodb.com/");
            console.log("2. Navigate to 'Network Access' in the left sidebar.");
            console.log("3. Click 'Add IP Address'.");
            console.log("4. Click 'ADD CURRENT IP ADDRESS' and Save.");
            console.log("5. Wait 1-2 minutes for the changes to apply and try again.");
        }

        process.exit(1);
    }
}

testConnection();
