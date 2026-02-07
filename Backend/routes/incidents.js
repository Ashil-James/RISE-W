const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');

// Get all incidents
router.get('/', async (req, res) => {
    try {
        const incidents = await Incident.find();
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
router.post('/', async (req, res) => {
    const incident = new Incident({
        title: req.body.title,
        description: req.body.description
    });
    try {
        const newIncident = await incident.save();
        res.status(201).json(newIncident);
    } catch (err) {
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

module.exports = router;