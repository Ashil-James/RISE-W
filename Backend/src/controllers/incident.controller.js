import { Incident } from "../models/incident.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAllIncidents = asyncHandler(async (req, res) => {
    const incidents = await Incident.find({ reportedBy: req.user._id });
    return res.status(200).json(new ApiResponse(200, incidents, "Incidents fetched successfully"));
});

export const getIncidentById = asyncHandler(async (req, res) => {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
        throw new ApiError(404, "Cannot find incident");
    }

    return res.status(200).json(new ApiResponse(200, incident, "Incident fetched"));
});

export const createIncident = asyncHandler(async (req, res) => {
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

    const incident = await Incident.create(incidentData);

    return res.status(201).json(new ApiResponse(201, incident, "Incident reported successfully"));
});

export const updateIncident = asyncHandler(async (req, res) => {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
        throw new ApiError(404, "Cannot find incident");
    }

    if (req.body.title != null) {
        incident.title = req.body.title;
    }
    if (req.body.description != null) {
        incident.description = req.body.description;
    }

    const updatedIncident = await incident.save();
    return res.status(200).json(new ApiResponse(200, updatedIncident, "Incident updated successfully"));
});

export const deleteIncident = asyncHandler(async (req, res) => {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
        throw new ApiError(404, "Cannot find incident");
    }

    await Incident.deleteOne({ _id: req.params.id });
    return res.status(200).json(new ApiResponse(200, null, "Incident deleted successfully"));
});
