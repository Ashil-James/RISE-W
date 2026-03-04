import express from 'express';
const router = express.Router();
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Incident from '../models/Incident.js';
import { protect } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// Helper: Get user incident stats
const getUserStats = async (userId) => {
    const total = await Incident.countDocuments({ reportedBy: userId });
    const resolved = await Incident.countDocuments({ reportedBy: userId, status: 'RESOLVED' });
    const pending = await Incident.countDocuments({ reportedBy: userId, status: { $in: ['OPEN', 'IN_PROGRESS', 'ACCEPTED'] } });
    return { total, resolved, pending };
};

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
router.post('/register', asyncHandler(async (req, res) => {
    const { name, email, password, phoneNumber } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        throw new ApiError(400, 'User already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
        phoneNumber,
    });

    if (!user) {
        throw new ApiError(400, 'Invalid user data');
    }

    res.status(201).json(
        new ApiResponse(201, {
            _id: user._id,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            token: generateToken(user._id),
        }, 'User registered successfully')
    );
}));

// @desc    Authenticate a user
// @route   POST /api/v1/auth/login
// @access  Public
router.post('/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
        throw new ApiError(401, 'Invalid email or password');
    }

    const stats = await getUserStats(user._id);

    res.status(200).json(
        new ApiResponse(200, {
            _id: user._id,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            token: generateToken(user._id),
            stats,
        }, 'Login successful')
    );
}));

// @desc    Get user data
// @route   GET /api/v1/auth/me
// @access  Private
router.get('/me', protect, asyncHandler(async (req, res) => {
    const user = req.user;
    const stats = await getUserStats(user._id);

    res.status(200).json(
        new ApiResponse(200, {
            ...user._doc,
            stats,
        }, 'User profile fetched')
    );
}));

// @desc    Update user profile
// @route   PUT /api/v1/auth/profile
// @access  Private
router.put('/profile', protect, asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    if (req.body.password) {
        throw new ApiError(400, 'Password cannot be updated here');
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;

    // Only update location if it's a valid object (GeoJSON Point), ignore string updates
    if (req.body.location && typeof req.body.location === 'object') {
        user.location = req.body.location;
    }

    const updatedUser = await user.save();
    const stats = await getUserStats(updatedUser._id);

    res.status(200).json(
        new ApiResponse(200, {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phoneNumber: updatedUser.phoneNumber,
            location: updatedUser.location,
            role: updatedUser.role,
            token: generateToken(updatedUser._id),
            stats,
        }, 'Profile updated successfully')
    );
}));

// @desc    Update password
// @route   PUT /api/v1/auth/update-password
// @access  Private
router.put('/update-password', protect, asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    if (!user || !(await user.matchPassword(currentPassword))) {
        throw new ApiError(401, 'Invalid current password');
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json(
        new ApiResponse(200, null, 'Password updated successfully')
    );
}));

export default router;
