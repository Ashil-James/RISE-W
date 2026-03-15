import mongoose from 'mongoose';
import { Incident } from '../models/incident.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function verifyPowerIncidents() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const powerIncidents = await Incident.find({ assignedAuthority: 'ELECTRICITY' });
        console.log(`Found ${powerIncidents.length} power incidents in the database.`);

        if (powerIncidents.length > 0) {
            console.log('Sample incident:', {
                reportId: powerIncidents[0].reportId,
                title: powerIncidents[0].title,
                assignedAuthority: powerIncidents[0].assignedAuthority,
                status: powerIncidents[0].status
            });
        } else {
            console.log('No power incidents found. You might need to create one to test the matrix fully.');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
}

verifyPowerIncidents();
