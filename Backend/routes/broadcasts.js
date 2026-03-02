import express from 'express';
const router = express.Router();
import Broadcast from '../models/Broadcast.js';
import { protect } from '../middleware/authMiddleware.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Get all broadcasts (Authority + User Alerts)
// @route   GET /api/v1/broadcasts
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
    const broadcasts = await Broadcast.find().sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, broadcasts, 'Broadcasts fetched successfully'));
}));

// @desc    Create a new broadcast/alert
// @route   POST /api/v1/broadcasts
// @access  Private
router.post('/', protect, asyncHandler(async (req, res) => {
    const { type, severity, location, message } = req.body;

    const broadcast = await Broadcast.create({
        type,
        severity,
        location,
        message,
        isAuthority: req.user.role === 'admin' || req.user.role === 'authority'
    });

    res.status(201).json(new ApiResponse(201, broadcast, 'Broadcast created successfully'));
}));

export default router;
