import express from 'express';
const router = express.Router();
import Incident from '../models/Incident.js';
import { protect } from '../middleware/authMiddleware.js';

// Get all incidents for the logged-in user
router.get('/', protect, async (req, res) => {
    try {
        const incidents = await Incident.find({ reportedBy: req.user._id });
        res.json(incidents);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get one incident
router.get('/:id', async (req, res) => {
    try {
        const incident = await Incident.findById(req.params.id);
        if (incident == null) {
            return res.status(404).json({ message: 'Cannot find incident' });
        }
        res.json(incident);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

// Create one incident
router.post('/', protect, async (req, res) => {
    try {
        // Build location - accept coordinates or address string
        let locationData = undefined;
        if (req.body.latitude && req.body.longitude) {
            locationData = {
                type: 'Point',
                coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)],
            };
        }

        const incident = new Incident({
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            location: locationData,
            address: req.body.address,
            image: req.body.image,
            reportedBy: req.user._id,  // Correct field name matching the model
            status: 'OPEN',            // Matches the model's enum values
        });

        const newIncident = await incident.save();
        res.status(201).json(newIncident);
    } catch (err) {
        console.error('Incident creation error:', err);
        res.status(400).json({ message: err.message });
    }
});

// Update one incident
router.patch('/:id', async (req, res) => {
    try {
        const incident = await Incident.findById(req.params.id);
        if (incident == null) {
            return res.status(404).json({ message: 'Cannot find incident' });
        }

        if (req.body.title != null) {
            incident.title = req.body.title;
        }
        if (req.body.description != null) {
            incident.description = req.body.description;
        }

        const updatedIncident = await incident.save();
        res.json(updatedIncident);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete one incident
router.delete('/:id', async (req, res) => {
    try {
        const incident = await Incident.findById(req.params.id);
        if (incident == null) {
            return res.status(404).json({ message: 'Cannot find incident' });
        }
        await Incident.deleteOne({ _id: req.params.id });
        res.json({ message: 'Deleted Incident' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
