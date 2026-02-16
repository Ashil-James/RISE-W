import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const adminEmail = 'admin@rise.com';
        const adminPassword = 'admin123';

        const userExists = await User.findOne({ email: adminEmail });

        if (userExists) {
            console.log('User already exists. Updating role to admin...');
            userExists.role = 'admin';
            await userExists.save();
            console.log('User role updated to admin.');
        } else {
            console.log('Creating new admin user...');
            await User.create({
                name: 'System Admin',
                email: adminEmail,
                password: adminPassword,
                phoneNumber: '0000000000',
                role: 'admin'
            });
            console.log('Admin user created successfully.');
        }

        console.log('\n--- Admin Credentials ---');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);
        console.log('-------------------------\n');

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createAdmin();
