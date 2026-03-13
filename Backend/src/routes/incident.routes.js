import { Router } from "express";
import {
    createIncident,
    deleteIncident,
    getAllIncidents,
    getIncidentById,
    updateIncident,
    checkNearbyIncidents,
    upvoteIncident,
} from "../controllers/incident.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").get(verifyJWT, getAllIncidents);
router.route("/").post(verifyJWT, createIncident);
router.route("/check-nearby").post(verifyJWT, checkNearbyIncidents);
router.route("/:id/upvote").post(verifyJWT, upvoteIncident);
router.route("/:id").get(getIncidentById);
router.route("/:id").patch(updateIncident);
router.route("/:id").delete(deleteIncident);

export default router;
