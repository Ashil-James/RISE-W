import express from 'express';
const router = express.Router();
import Incident from '../models/Incident.js';
import { protect } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// @desc    Get all incidents for the logged-in user
// @route   GET /api/v1/incidents
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
    const incidents = await Incident.find({ reportedBy: req.user._id });
    res.status(200).json(new ApiResponse(200, incidents, 'Incidents fetched successfully'));
}));

// @desc    Get one incident
// @route   GET /api/v1/incidents/:id
// @access  Public
router.get('/:id', asyncHandler(async (req, res) => {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
        throw new ApiError(404, 'Cannot find incident');
    }

    res.status(200).json(new ApiResponse(200, incident, 'Incident fetched'));
}));

// @desc    Create one incident
// @route   POST /api/v1/incidents
// @access  Private
router.post('/', protect, asyncHandler(async (req, res) => {
    // Build location - accept coordinates or address string
    let locationData = undefined;
    if (req.body.latitude && req.body.longitude) {
        locationData = {
            type: 'Point',
            coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)],
        };
    }

    const incidentData = {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        address: req.body.address,
        image: req.body.image,
        reportedBy: req.user._id,
        status: 'OPEN',
    };

    if (locationData) {
        incidentData.location = locationData;
    }

    const incident = new Incident(incidentData);

    const newIncident = await incident.save();
    res.status(201).json(new ApiResponse(201, newIncident, 'Incident reported successfully'));
}));

// @desc    Update one incident
// @route   PATCH /api/v1/incidents/:id
// @access  Public
router.patch('/:id', asyncHandler(async (req, res) => {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
        throw new ApiError(404, 'Cannot find incident');
    }

    if (req.body.title != null) {
        incident.title = req.body.title;
    }
    if (req.body.description != null) {
        incident.description = req.body.description;
    }

    const updatedIncident = await incident.save();
    res.status(200).json(new ApiResponse(200, updatedIncident, 'Incident updated successfully'));
}));

// @desc    Delete one incident
// @route   DELETE /api/v1/incidents/:id
// @access  Public
router.delete('/:id', asyncHandler(async (req, res) => {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
        throw new ApiError(404, 'Cannot find incident');
    }

    await Incident.deleteOne({ _id: req.params.id });
    res.status(200).json(new ApiResponse(200, null, 'Incident deleted successfully'));
}));

export default router;
