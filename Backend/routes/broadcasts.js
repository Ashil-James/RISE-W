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
        const broadcast = await Broadcast.create({
            type,
            severity,
            location,
            message,
            isAuthority: req.user.role === 'admin' || req.user.role === 'authority'
        });
        res.status(201).json(broadcast);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
