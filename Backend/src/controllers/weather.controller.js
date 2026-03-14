import { WeatherEvent } from "../models/weatherEvent.model.js";
import { Incident } from "../models/incident.model.js";
import { Notification } from "../models/notification.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Category → authority mapping (same as in incident.controller.js)
const SURVEY_ISSUES = {
    waterlogging: {
        title: "Waterlogging",
        description: "Waterlogging reported via Post-Storm Survey",
        category: "Water & Sanitation",
        authority: "WATER",
    },
    tree_fallen: {
        title: "Tree Fallen",
        description: "Fallen tree reported via Post-Storm Survey",
        category: "Infrastructure",
        authority: "CIVIL",
    },
    power_outage: {
        title: "Power Outage",
        description: "Power outage reported via Post-Storm Survey",
        category: "Power Issue",
        authority: "ELECTRICITY",
    },
    road_damage: {
        title: "Road Damage",
        description: "Road damage reported via Post-Storm Survey",
        category: "Infrastructure",
        authority: "CIVIL",
    },
};

/**
 * GET /api/v1/weather/active-survey
 * Returns the most recent ended weather event (within 24h) where survey is triggered.
 */
export const getActiveSurvey = asyncHandler(async (req, res) => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const event = await WeatherEvent.findOne({
        isSurveyTriggered: true,
        endTime: { $gte: twentyFourHoursAgo },
    }).sort({ endTime: -1 });

    if (!event) {
        return res.status(200).json(
            new ApiResponse(200, null, "No active post-storm survey")
        );
    }

    return res.status(200).json(
        new ApiResponse(200, {
            eventId: event._id,
            endTime: event.endTime,
            expiresAt: new Date(event.endTime.getTime() + 24 * 60 * 60 * 1000),
            location: event.location,
        }, "Active post-storm survey found")
    );
});

/**
 * POST /api/v1/weather/batch-survey
 * Body: { issues: ["waterlogging", "tree_fallen", ...], address?: string, description?: string, latitude?: number, longitude?: number }
 * Creates one Incident per checked issue.
 */
export const submitBatchSurvey = asyncHandler(async (req, res) => {
    const { issues, address, description, latitude, longitude } = req.body;

    if (!issues || !Array.isArray(issues) || issues.length === 0) {
        return res.status(400).json(
            new ApiResponse(400, null, "Please select at least one issue to report")
        );
    }

    let locationData = undefined;
    if (latitude && longitude) {
        locationData = {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
        };
    }

    const createdIncidents = [];

    for (const issueKey of issues) {
        const issueInfo = SURVEY_ISSUES[issueKey];
        if (!issueInfo) continue;

        const incidentData = {
            title: issueInfo.title,
            description: description
                ? `${issueInfo.description}. User note: ${description}`
                : issueInfo.description,
            category: issueInfo.category,
            address: address || "Reported via Post-Storm Survey",
            reportedBy: req.user._id,
            status: "OPEN",
            assignedAuthority: issueInfo.authority,
        };

        if (locationData) {
            incidentData.location = locationData;
        }

        const incident = await Incident.create(incidentData);
        createdIncidents.push(incident);
    }

    // Create a personal notification confirming submission
    if (createdIncidents.length > 0) {
        await Notification.create({
            recipient: req.user._id,
            title: "Survey Submitted",
            message: `You reported ${createdIncidents.length} issue${createdIncidents.length > 1 ? "s" : ""} via the Post-Storm Survey. Thank you!`,
            type: "INCIDENT_UPDATE",
        });
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            { count: createdIncidents.length, incidents: createdIncidents },
            `${createdIncidents.length} incident(s) created from survey`
        )
    );
});
