import { Incident } from "../models/incident.model.js";
import natural from "natural";
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

const calculateInitialUrgency = (title, category) => {
    let score = 30; // base score

    // Adjust by category if needed
    if (category === "Power Issue" || category === "Water & Sanitation") {
        score += 10;
    }

    const titleLower = (title || "").toLowerCase();

    // Overrides based on severity keywords
    if (titleLower.includes("critical emergency")) {
        score = 85 + Math.floor(Math.random() * 10); // 85-94
    } else if (titleLower.includes("general failure")) {
        score = 50 + Math.floor(Math.random() * 15); // 50-64
    } else {
        score += Math.floor(Math.random() * 10); // Add a little randomness
    }

    return Math.min(100, Math.max(1, score));
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
        urgencyScore: calculateInitialUrgency(req.body.title, req.body.category),
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

    if (!confirmingResolution) {
        // Clear old resolution data so the authority can submit fresh proof
        incident.resolutionImage = "";
        incident.authorityMessage = "";
    }

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
            urgencyScore: calculateInitialUrgency(report.title, report.category),
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

// ── NLP Utilities for Duplicate Detection (TF-IDF + Cosine Similarity) ──
const TfIdf = natural.TfIdf;

/**
 * Compute cosine similarity between a new report and an existing one
 * using TF-IDF vectors. Words common across both documents (like "water")
 * are automatically downweighted — only distinctive words drive the score.
 */
const tfidfCosineSimilarity = (textA, textB) => {
    if (!textA || !textB) return 0;

    const tfidf = new TfIdf();
    tfidf.addDocument(textA.toLowerCase());
    tfidf.addDocument(textB.toLowerCase());

    // Collect all unique terms from both documents
    const allTerms = new Set();
    tfidf.listTerms(0).forEach((t) => allTerms.add(t.term));
    tfidf.listTerms(1).forEach((t) => allTerms.add(t.term));

    if (allTerms.size === 0) return 0;

    // Build TF-IDF vectors for both documents
    let dotProduct = 0;
    let magA = 0;
    let magB = 0;

    allTerms.forEach((term) => {
        const weightA = tfidf.tfidf(term, 0);
        const weightB = tfidf.tfidf(term, 1);
        dotProduct += weightA * weightB;
        magA += weightA * weightA;
        magB += weightB * weightB;
    });

    const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
};

// Dynamic radius per category (meters)
const CATEGORY_RADIUS = {
    "Power Issue": 500,
    "Water & Sanitation": 500,
    "Infrastructure": 150,
    "Wildlife Intrusion": 200,
};

// Similarity threshold — only flag above this
const SIMILARITY_THRESHOLD = 0.5;

// ── Incident DNA: Check for nearby duplicate incidents (NLP-powered) ──
export const checkNearbyIncidents = asyncHandler(async (req, res) => {
    const { latitude, longitude, category, title, description, addressDetails } = req.body;

    if (!latitude || !longitude) {
        return res.status(200).json(new ApiResponse(200, [], "No coordinates provided, skipping nearby check"));
    }

    const radius = CATEGORY_RADIUS[category] || 200;
    // Utility-scale issues stay open longer, so widen the time window
    const isUtility = ["Power Issue", "Water & Sanitation"].includes(category);
    const lookbackMs = isUtility ? 7 * 24 * 60 * 60 * 1000 : 48 * 60 * 60 * 1000;
    const cutoff = new Date(Date.now() - lookbackMs);

    const nearby = await Incident.find({
        status: { $in: ["OPEN", "ACCEPTED", "IN_PROGRESS"] },
        createdAt: { $gte: cutoff },
        location: {
            $nearSphere: {
                $geometry: {
                    type: "Point",
                    coordinates: [parseFloat(longitude), parseFloat(latitude)],
                },
                $maxDistance: radius,
            },
        },
    })
        .select("title description address category upvotes reportId createdAt image location")
        .limit(10)
        .lean();

    // Build the new report's full text fingerprint (title + description + address details)
    const newText = `${title || ""} ${description || ""} ${addressDetails || ""}`.trim();

    // If no text provided at all, fall back to geo-only match
    if (!newText) {
        const sameCat = nearby.filter((inc) => inc.category === category);
        return res.status(200).json(new ApiResponse(200, sameCat.slice(0, 5), "Nearby incidents checked (geo-only)"));
    }

    const now = Date.now();
    const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

    // Score each nearby incident using TF-IDF cosine similarity + time bonus
    const scored = nearby.map((inc) => {
        // Full text comparison: title + description + address
        const existingText = `${inc.title || ""} ${inc.description || ""} ${inc.address || ""}`.trim();
        const textScore = tfidfCosineSimilarity(newText, existingText);

        // Time proximity bonus: within 2 hours → full bonus
        const ageMs = now - new Date(inc.createdAt).getTime();
        const timeBonus = ageMs < TWO_HOURS_MS ? 1 : 0;

        // Weighted final score: 85% text + 15% time (no category bonus)
        const similarityScore = Math.min(1,
            (textScore * 0.85) + (timeBonus * 0.15)
        );

        return { ...inc, similarityScore: Math.round(similarityScore * 100) / 100 };
    });

    // Filter by threshold and sort best matches first
    const results = scored
        .filter((inc) => inc.similarityScore >= SIMILARITY_THRESHOLD)
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, 5);

    return res.status(200).json(new ApiResponse(200, results, "Nearby incidents checked"));
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

// ── AI Auto-Categorization ──
const CATEGORY_KEYWORDS = {
    "Water & Sanitation": [
        "water", "pipe", "leak", "flood", "drain", "sewage", "sewer",
        "tap", "supply", "contaminated", "dirty", "overflow", "clogged",
        "well", "borewell", "tank", "pipeline", "burst", "sanitation",
    ],
    "Power Issue": [
        "power", "electricity", "outage", "blackout", "voltage", "transformer",
        "wire", "pole", "cable", "spark", "short", "circuit", "fuse",
        "light", "meter", "generator", "electrocution", "current",
    ],
    "Infrastructure": [
        "road", "pothole", "bridge", "crack", "footpath", "pavement",
        "construction", "collapse", "building", "wall", "landslide",
        "broken", "damaged", "sign", "signal", "traffic", "barrier",
        "hole", "street", "highway",
    ],
    "Wildlife Intrusion": [
        "animal", "snake", "elephant", "monkey", "wildlife", "wild",
        "boar", "leopard", "tiger", "dog", "stray", "bite", "attack",
        "intrusion", "sighting", "bear", "insect", "hive", "bee",
    ],
};

export const categorizeIncident = asyncHandler(async (req, res) => {
    const { text } = req.body;

    if (!text || !text.trim()) {
        return res.status(200).json(new ApiResponse(200, { suggestion: null, confidence: 0 }, "No text provided"));
    }

    const tokens = text.toLowerCase().split(/\W+/).filter(t => t.length > 1);
    const scores = {};

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        const matches = tokens.filter((t) => keywords.includes(t));
        scores[category] = matches.length;
    }

    // Find the best matching category
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const [bestCategory, bestScore] = sorted[0];
    const totalTokens = tokens.length || 1;
    const confidence = Math.min(1, bestScore / Math.max(2, totalTokens * 0.5));

    return res.status(200).json(new ApiResponse(200, {
        suggestion: bestScore > 0 ? bestCategory : null,
        confidence: Math.round(confidence * 100) / 100,
        allScores: scores,
    }, "Category suggestion generated"));
});
