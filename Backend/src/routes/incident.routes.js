import { Router } from "express";
import {
    createIncident,
    deleteIncident,
    getAllIncidents,
    getIncidentById,
    updateIncident,
    checkNearbyIncidents,
    upvoteIncident,
    batchCreateIncidents,
    getUserPowerIncidents,
    getUserRoadIncidents,
    revokeIncident,
    respondToIncidentResolution,
} from "../controllers/incident.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").get(verifyJWT, getAllIncidents);
router.route("/user-power").get(verifyJWT, getUserPowerIncidents);
router.route("/user-road").get(verifyJWT, getUserRoadIncidents);
router.route("/").post(verifyJWT, createIncident);

router.route("/batch").post(verifyJWT, batchCreateIncidents);
router.route("/check-nearby").post(verifyJWT, checkNearbyIncidents);
router.route("/:id/upvote").post(verifyJWT, upvoteIncident);
router.route("/:id/revoke").patch(verifyJWT, revokeIncident);
router.route("/:id/resolution-response").patch(verifyJWT, respondToIncidentResolution);
router.route("/:id").get(verifyJWT, getIncidentById);
router.route("/:id").patch(verifyJWT, updateIncident);
router.route("/:id").delete(verifyJWT, deleteIncident);

export default router;
