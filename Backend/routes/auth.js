import express from 'express';
const router = express.Router();
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Incident from '../models/Incident.js';
import { protect } from '../middleware/authMiddleware.js';

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
router.post('/register', async (req, res) => {
    const { name, email, password, phoneNumber } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            phoneNumber,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Authenticate a user
// @route   POST /api/v1/auth/login
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            // Get stats for login response too
            const total = await Incident.countDocuments({ user: user._id });
            const resolved = await Incident.countDocuments({ user: user._id, status: 'Resolved' });
            const pending = await Incident.countDocuments({ user: user._id, status: { $in: ['Open', 'In Progress'] } });

            res.json({
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
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get user data
// @route   GET /api/v1/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = req.user;
        const total = await Incident.countDocuments({ user: user._id });
        const resolved = await Incident.countDocuments({ user: user._id, status: 'Resolved' });
        const pending = await Incident.countDocuments({ user: user._id, status: { $in: ['Open', 'In Progress'] } });

        res.json({
            ...user._doc,
            stats: {
                total,
                resolved,
                pending
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update user profile
// @route   PUT /api/v1/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
            user.location = req.body.location || user.location;

            if (req.body.password) {
                res.status(400).json({ message: 'Password cannot be updated here' });
                return;
            }

            const updatedUser = await user.save();

            const total = await Incident.countDocuments({ user: updatedUser._id });
            const resolved = await Incident.countDocuments({ user: updatedUser._id, status: 'Resolved' });
            const pending = await Incident.countDocuments({ user: updatedUser._id, status: { $in: ['Open', 'In Progress'] } });

            res.json({
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
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update password
// @route   PUT /api/v1/auth/update-password
// @access  Private
router.put('/update-password', protect, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user._id);

        if (user && (await user.matchPassword(currentPassword))) {
            user.password = newPassword;
            await user.save();
            res.json({ message: 'Password updated successfully' });
        } else {
            res.status(401).json({ message: 'Invalid current password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
