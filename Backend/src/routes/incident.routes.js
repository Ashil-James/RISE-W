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
router.route("/:id").get(getIncidentById);
router.route("/:id").patch(updateIncident);
router.route("/:id").delete(deleteIncident);

export default router;
