import express from 'express';
const router = express.Router();
import Broadcast from '../models/Broadcast.js';
import { protect } from '../middleware/authMiddleware.js';

// @desc    Get all broadcasts (Authority + User Alerts)
// @route   GET /api/v1/broadcasts
// @access  Public
router.get('/', async (req, res) => {
    try {
        const broadcasts = await Broadcast.find().sort({ createdAt: -1 });
        res.json(broadcasts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a new broadcast/alert
// @route   POST /api/v1/broadcasts
// @access  Private
router.post('/', protect, async (req, res) => {
    const { type, severity, location, message } = req.body;

    try {
        // Map frontend type to backend enum if needed
        const typeMap = {
            'WILDLIFE_ALERT': 'WILDLIFE_ALERT',
            'ROAD_BLOCK': 'ROAD_BLOCK',
            'UTILITY_WARNING': 'UTILITY_WARNING',
            'SAFETY_ALERT': 'SAFETY_ALERT',
        };
        const mappedType = typeMap[type] || 'SAFETY_ALERT';

        const broadcast = await Broadcast.create({
            type: mappedType,
            severity,
            location,
            message,
            isAuthority: req.user.role === 'admin' || req.user.role === 'authority',
            createdBy: req.user._id,  // Required field in the model
        });
        res.status(201).json(broadcast);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
