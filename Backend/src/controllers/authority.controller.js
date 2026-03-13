import { Incident } from "../models/incident.model.js";
import { Notification } from "../models/notification.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getWaterIncidents = asyncHandler(async (req, res) => {
    // Fetch all incidents categorized as "Water & Sanitation" (or potentially mapped fields)
    const incidents = await Incident.find({
        category: "Water & Sanitation"
    })
        .populate("reportedBy", "name email")
        .sort({ createdAt: -1 });

    res.json(new ApiResponse(200, incidents, "Water incidents retrieved successfully"));
});

export const updateIncidentStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, authorityMessage } = req.body;

    const incident = await Incident.findById(id);

    if (!incident) {
        return res.status(404).json(new ApiResponse(404, null, "Incident not found"));
    }

    if (status) incident.status = status;
    if (authorityMessage) incident.authorityMessage = authorityMessage;

    const updatedIncident = await incident.save();

    // Trigger notification
    await Notification.create({
        recipient: updatedIncident.reportedBy,
        title: "Incident Update",
        message: `Your reported incident "${updatedIncident.title}" status has been updated to ${status || updatedIncident.status}.`,
        type: "INCIDENT_UPDATE",
        relatedId: updatedIncident._id,
    });

    res.json(new ApiResponse(200, updatedIncident, "Incident updated successfully"));
});
