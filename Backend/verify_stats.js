const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Incident = require('./models/Incident');

dotenv.config();

const verifyStats = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Create a test user
        const testEmail = `test_${Date.now()}@example.com`;
        const user = await User.create({
            name: 'Test User',
            email: testEmail,
            password: 'password123',
            location: 'Test Location'
        });
        console.log(`User created: ${user.email}`);

        // Create Incidents
        await Incident.create({
            title: 'Issue 1',
            description: 'Desc 1',
            user: user._id,
            status: 'pending'
        });
        await Incident.create({
            title: 'Issue 2',
            description: 'Desc 2',
            user: user._id,
            status: 'resolved'
        });
        await Incident.create({
            title: 'Issue 3',
            description: 'Desc 3',
            user: user._id,
            status: 'pending'
        });
        console.log('Incidents created');

        // Verify Stats Logic
        const total = await Incident.countDocuments({ user: user._id });
        const resolved = await Incident.countDocuments({ user: user._id, status: 'resolved' });
        const pending = await Incident.countDocuments({ user: user._id, status: 'pending' });

        console.log('--- Stats Verification ---');
        console.log(`Total: ${total} (Expected: 3)`);
        console.log(`Resolved: ${resolved} (Expected: 1)`);
        console.log(`Pending: ${pending} (Expected: 2)`);

        if (total === 3 && resolved === 1 && pending === 2) {
            console.log('✅ Stats verification PASSED');
        } else {
            console.log('❌ Stats verification FAILED');
        }

        // Cleanup
        await Incident.deleteMany({ user: user._id });
        await User.deleteOne({ _id: user._id });
        console.log('Cleanup done');

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

verifyStats();
