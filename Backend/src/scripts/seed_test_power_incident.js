import mongoose from 'mongoose';
import { Incident } from '../models/incident.model.js';
import { User } from '../models/user.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function seedTestIncident() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find a user to report the incident
        const user = await User.findOne();
        if (!user) {
            console.log('No user found to report incident. Please create a user first.');
            return;
        }

        const incident = await Incident.create({
            title: 'Transformer Sparking',
            description: 'The transformer near Sector G is sparking and making loud noises.',
            category: 'Power Issue',
            address: 'Sector G, Main Road',
            reportedBy: user._id,
            status: 'OPEN',
            assignedAuthority: 'ELECTRICITY',
            urgencyScore: 85,
            location: {
                type: 'Point',
                coordinates: [77.5946, 12.9716]
            }
        });

        console.log('Test incident created:', incident.reportId);

        await mongoose.disconnect();
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seedTestIncident();
