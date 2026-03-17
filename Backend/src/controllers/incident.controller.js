import { Incident } from "../models/incident.model.js";
import { Notification } from "../models/notification.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
    appendStatusHistory,
    createStatusHistoryEntry,
    getDefaultStatusNote,
    getViewerRelation,
    incidentBelongsToDepartment,
    serializeIncidentForViewer,
} from "../utils/incidentTracking.js";

const serializeIncidentListForViewer = (incidents, viewer) =>
    incidents.map((incident) => serializeIncidentForViewer(incident, viewer));

const canViewIncident = (incident, user) => {
    if (!user) return false;
    if (user.role === "admin") return true;

    if (user.role === "authority") {
        return incidentBelongsToDepartment(incident, user.department);
    }

    return Boolean(getViewerRelation(incident, user));
};

const canManageReportedIncident = (incident, user) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    return getViewerRelation(incident, user) === "REPORTER";
};

export const getAllIncidents = asyncHandler(async (req, res) => {
    // Return incidents the user reported OR upvoted
    const incidents = await Incident.find({
        $or: [
            { reportedBy: req.user._id },
            { upvotedBy: req.user._id },
        ],
    }).sort({ createdAt: -1 });
    return res.status(200).json(
        new ApiResponse(200, serializeIncidentListForViewer(incidents, req.user), "Incidents fetched successfully"),
    );
});

export const getUserPowerIncidents = asyncHandler(async (req, res) => {
    const incidents = await Incident.find({
        reportedBy: req.user._id,
        assignedAuthority: "ELECTRICITY"
    }).sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, serializeIncidentListForViewer(incidents, req.user), "User power incidents fetched successfully"),
    );
});

export const getUserRoadIncidents = asyncHandler(async (req, res) => {
    const incidents = await Incident.find({
        reportedBy: req.user._id,
        assignedAuthority: "CIVIL"
    }).sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, serializeIncidentListForViewer(incidents, req.user), "User road incidents fetched successfully"),
    );
});


export const getIncidentById = asyncHandler(async (req, res) => {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
        throw new ApiError(404, "Cannot find incident");
    }

    if (!canViewIncident(incident, req.user)) {
        throw new ApiError(403, "You are not allowed to view this incident");
    }

    return res.status(200).json(
        new ApiResponse(200, serializeIncidentForViewer(incident, req.user), "Incident fetched"),
    );
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
        statusHistory: [
            createStatusHistoryEntry({
                status: "OPEN",
                actorRole: "USER",
                actorLabel: "Citizen",
                note: "Issue reported by citizen.",
            }),
        ],
    };

    if (locationData) {
        incidentData.location = locationData;
    }

    const incident = await Incident.create(incidentData);

    // Create Notification for Authority
    await Notification.create({
        title: "New Complaint Received",
        message: `A new ${incident.category} complaint has been filed: "${incident.title}"`,
        type: "NEW_INCIDENT",
        targetDepartment: incident.assignedAuthority,
        relatedId: incident._id,
    });

    return res.status(201).json(
        new ApiResponse(201, serializeIncidentForViewer(incident, req.user), "Incident reported successfully"),
    );
});

export const updateIncident = asyncHandler(async (req, res) => {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
        throw new ApiError(404, "Cannot find incident");
    }

    if (!canManageReportedIncident(incident, req.user)) {
        throw new ApiError(403, "You can only edit incidents you reported");
    }

    if (req.body.title != null) {
        incident.title = req.body.title;
    }
    if (req.body.description != null) {
        incident.description = req.body.description;
    }

    const updatedIncident = await incident.save();
    return res.status(200).json(
        new ApiResponse(200, serializeIncidentForViewer(updatedIncident, req.user), "Incident updated successfully"),
    );
});

export const revokeIncident = asyncHandler(async (req, res) => {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
        throw new ApiError(404, "Incident not found");
    }

    if (incident.reportedBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only revoke incidents you reported");
    }

    if (incident.status !== "OPEN") {
        throw new ApiError(400, "This incident can only be revoked before it is accepted");
    }

    const hasOtherSupporters = (incident.upvotedBy || []).some(
        (uid) => uid.toString() !== req.user._id.toString()
    );

    if (hasOtherSupporters) {
        throw new ApiError(400, "This incident cannot be revoked because other users have already supported it");
    }

    incident.status = "REVOKED";
    incident.verifiedByUser = false;
    appendStatusHistory(incident, {
        status: "REVOKED",
        actorRole: "USER",
        actorLabel: "Citizen",
        note: getDefaultStatusNote("REVOKED", incident),
    });

    const updatedIncident = await incident.save();

    await Notification.create({
        recipient: null,
        title: "Incident Revoked By Citizen",
        message: `The reporting citizen revoked "${updatedIncident.title}" before authority acceptance.`,
        type: "INCIDENT_UPDATE",
        targetDepartment: updatedIncident.assignedAuthority,
        relatedId: updatedIncident._id,
    });

    return res.status(200).json(
        new ApiResponse(200, serializeIncidentForViewer(updatedIncident, req.user), "Incident revoked successfully")
    );
});

export const respondToIncidentResolution = asyncHandler(async (req, res) => {
    const { action } = req.body;

    if (!["confirm_resolved", "reject_resolution"].includes(action)) {
        throw new ApiError(400, "Invalid resolution response");
    }

    const incident = await Incident.findById(req.params.id);

    if (!incident) {
        throw new ApiError(404, "Incident not found");
    }

    if (incident.reportedBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only respond to incidents you reported");
    }

    const confirmingResolution = action === "confirm_resolved";
    const targetStatus = confirmingResolution ? "CLOSED" : "REOPENED";

    const allowedStatuses = confirmingResolution
        ? ["RESOLVED", "VERIFIED", "CLOSED"]
        : ["RESOLVED", "VERIFIED", "REOPENED"];

    if (!allowedStatuses.includes(incident.status)) {
        throw new ApiError(400, "This incident is not awaiting user resolution feedback");
    }

    if (incident.status === targetStatus) {
        return res.status(200).json(
            new ApiResponse(
                200,
                serializeIncidentForViewer(incident, req.user),
                confirmingResolution
                    ? "Incident already closed"
                    : "Incident already reopened",
            ),
        );
    }

    incident.status = targetStatus;
    incident.verifiedByUser = confirmingResolution;
    appendStatusHistory(incident, {
        status: targetStatus,
        actorRole: "USER",
        actorLabel: "Citizen",
        note: getDefaultStatusNote(targetStatus, incident),
    });

    const updatedIncident = await incident.save();

    await Notification.create({
        recipient: null,
        title: confirmingResolution ? "Incident Closed By Citizen" : "Incident Reopened By Citizen",
        message: confirmingResolution
            ? `The citizen confirmed that "${updatedIncident.title}" has been resolved.`
            : `The citizen marked "${updatedIncident.title}" as not resolved and reopened the incident.`,
        type: "INCIDENT_UPDATE",
        targetDepartment: updatedIncident.assignedAuthority,
        relatedId: updatedIncident._id,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            serializeIncidentForViewer(updatedIncident, req.user),
            confirmingResolution
                ? "Incident closed successfully"
                : "Incident reopened successfully"
        )
    );
});

export const deleteIncident = asyncHandler(async (req, res) => {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
        throw new ApiError(404, "Cannot find incident");
    }

    if (!canManageReportedIncident(incident, req.user)) {
        throw new ApiError(403, "You can only delete incidents you reported");
    }

    await Incident.deleteOne({ _id: req.params.id });
    return res.status(200).json(new ApiResponse(200, null, "Incident deleted successfully"));
});

export const batchCreateIncidents = asyncHandler(async (req, res) => {
    const { incidents, latitude, longitude, address } = req.body;

    if (!incidents || !Array.isArray(incidents) || incidents.length === 0) {
        throw new ApiError(400, "No incidents provided");
    }

    const locationData = latitude && longitude ? {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
    } : undefined;

    const createdIncidents = [];

    for (const report of incidents) {
        // report = { title, description, category }
        const incidentData = {
            title: report.title,
            description: report.description,
            category: report.category,
            address: address || "From Post-Storm Survey",
            reportedBy: req.user._id,
            status: 'OPEN',
            assignedAuthority: CATEGORY_TO_AUTHORITY[report.category] || "CIVIL",
            statusHistory: [
                createStatusHistoryEntry({
                    status: "OPEN",
                    actorRole: "USER",
                    actorLabel: "Citizen",
                    note: "Issue reported by citizen.",
                }),
            ],
        };

        if (locationData) {
            incidentData.location = locationData;
        }

        const incident = await Incident.create(incidentData);

        // Create Notification for Authority
        await Notification.create({
            title: "New Complaint Received (Survey)",
            message: `A new ${incident.category} complaint has been filed via storm survey: "${incident.title}"`,
            type: "NEW_INCIDENT",
            targetDepartment: incident.assignedAuthority,
            relatedId: incident._id,
        });

        createdIncidents.push(incident);
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            serializeIncidentListForViewer(createdIncidents, req.user),
            "Batch incidents reported successfully",
        ),
    );
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

    if (incident.status === "REVOKED") {
        throw new ApiError(400, "Revoked incidents can no longer receive support");
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

    return res.status(200).json(
        new ApiResponse(200, serializeIncidentForViewer(incident, req.user), "Upvote recorded successfully"),
    );
});
