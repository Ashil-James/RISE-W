import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/user.model.js";
import { DB_NAME } from "../constants.js";

dotenv.config({
    path: "./.env"
});

const authorities = [
    {
        name: "Water Authority Admin",
        email: "water@rise.com",
        password: "water123",
        role: "authority",
        department: "WATER",
    },
    {
        name: "Power Authority Admin",
        email: "power@rise.com",
        password: "power123",
        role: "authority",
        department: "ELECTRICITY",
    },
    {
        name: "Road Authority Admin",
        email: "road@rise.com",
        password: "road123",
        role: "authority",
        department: "CIVIL",
    },
];

const seed = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log("MongoDB Connected");
        for (const auth of authorities) {
            const existing = await User.findOne({ email: auth.email });
            if (!existing) {
                await User.create(auth);
                console.log(`Created authority: ${auth.email}`);
            } else {
                console.log(`Authority already exists: ${auth.email}`);
            }
        }
        process.exit();
    } catch (error) {
        console.error(`Error seeding authorities: ${error.message}`);
        process.exit(1);
    }
};

seed();
