import mongoose from 'mongoose';
import { User } from './src/models/user.model.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await User.find({ role: { $in: ['authority', 'power_authority'] } });
    console.log("Found authorities:");
    for (let u of users) {
        console.log(u.email, u.role, u.department);
    }
    process.exit(0);
}
run();
