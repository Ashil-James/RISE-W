import { Incident } from "../models/incident.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAllIncidents = asyncHandler(async (req, res) => {
    // Return incidents the user reported OR upvoted
    const incidents = await Incident.find({
        $or: [
            { reportedBy: req.user._id },
            { upvotedBy: req.user._id },
        ],
    }).sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, incidents, "Incidents fetched successfully"));
});

export const getIncidentById = asyncHandler(async (req, res) => {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
        throw new ApiError(404, "Cannot find incident");
    }

    return res.status(200).json(new ApiResponse(200, incident, "Incident fetched"));
});

// Maps user-facing category labels to the authority enum values in the Incident model
const CATEGORY_TO_AUTHORITY = {
    "Water & Sanitation": "WATER",
    "Power Issue": "ELECTRICITY",
    "Infrastructure": "CIVIL",
    "Wildlife Intrusion": "CIVIL",
};

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
        assignedAuthority: CATEGORY_TO_AUTHORITY[req.body.category] || "CIVIL",
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

// ── Incident DNA: Check for nearby duplicate incidents ──
export const checkNearbyIncidents = asyncHandler(async (req, res) => {
    const { latitude, longitude, category } = req.body;

    if (!latitude || !longitude) {
        return res.status(200).json(new ApiResponse(200, [], "No coordinates provided, skipping nearby check"));
    }

    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const nearby = await Incident.find({
        category,
        status: { $in: ["OPEN", "ACCEPTED", "IN_PROGRESS"] },
        createdAt: { $gte: fortyEightHoursAgo },
        location: {
            $nearSphere: {
                $geometry: {
                    type: "Point",
                    coordinates: [parseFloat(longitude), parseFloat(latitude)],
                },
                $maxDistance: 200, // 200 meters
            },
        },
    })
        .select("title category address upvotes reportId createdAt image location")
        .limit(5)
        .lean();

    return res.status(200).json(new ApiResponse(200, nearby, "Nearby incidents checked"));
});

// ── Incident DNA: Upvote an existing incident ──
export const upvoteIncident = asyncHandler(async (req, res) => {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
        throw new ApiError(404, "Incident not found");
    }

    // Prevent duplicate upvotes from the same user
    const alreadyUpvoted = incident.upvotedBy?.some(
        (uid) => uid.toString() === req.user._id.toString()
    );

    if (alreadyUpvoted) {
        return res.status(200).json(new ApiResponse(200, incident, "Already upvoted"));
    }

    incident.upvotes = (incident.upvotes || 0) + 1;
    incident.upvotedBy = [...(incident.upvotedBy || []), req.user._id];
    await incident.save();

    return res.status(200).json(new ApiResponse(200, incident, "Upvote recorded successfully"));
});
