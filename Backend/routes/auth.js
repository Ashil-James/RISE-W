import express from 'express';
const router = express.Router();
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Incident from '../models/Incident.js';
import { protect } from '../middleware/authMiddleware.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
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

    const data = {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        token: generateToken(user._id),
    };

    res.status(201).json(new ApiResponse(201, data, 'User registered successfully'));
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

    // Get stats for login response
    const total = await Incident.countDocuments({ user: user._id });
    const resolved = await Incident.countDocuments({ user: user._id, status: 'Resolved' });
    const pending = await Incident.countDocuments({ user: user._id, status: { $in: ['Open', 'In Progress'] } });

    const data = {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        token: generateToken(user._id),
        stats: {
            total,
            resolved,
            pending
        }
    };

    res.status(200).json(new ApiResponse(200, data, 'Login successful'));
}));

// @desc    Get user data
// @route   GET /api/v1/auth/me
// @access  Private
router.get('/me', protect, asyncHandler(async (req, res) => {
    const user = req.user;
    const total = await Incident.countDocuments({ user: user._id });
    const resolved = await Incident.countDocuments({ user: user._id, status: 'Resolved' });
    const pending = await Incident.countDocuments({ user: user._id, status: { $in: ['Open', 'In Progress'] } });

    const data = {
        ...user._doc,
        stats: {
            total,
            resolved,
            pending
        }
    };

    res.status(200).json(new ApiResponse(200, data, 'User profile fetched'));
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
    user.location = req.body.location || user.location;

    const updatedUser = await user.save();

    const total = await Incident.countDocuments({ user: updatedUser._id });
    const resolved = await Incident.countDocuments({ user: updatedUser._id, status: 'Resolved' });
    const pending = await Incident.countDocuments({ user: updatedUser._id, status: { $in: ['Open', 'In Progress'] } });

    const data = {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        location: updatedUser.location,
        role: updatedUser.role,
        token: generateToken(updatedUser._id),
        stats: {
            total,
            resolved,
            pending
        }
    };

    res.status(200).json(new ApiResponse(200, data, 'Profile updated successfully'));
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

    res.status(200).json(new ApiResponse(200, {}, 'Password updated successfully'));
}));

export default router;
