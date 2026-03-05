import { Router } from "express";
import {
    createIncident,
    deleteIncident,
    getAllIncidents,
    getIncidentById,
    updateIncident,
} from "../controllers/incident.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").get(verifyJWT, getAllIncidents);
router.route("/").post(verifyJWT, createIncident);
router.route("/:id").get(getIncidentById);
router.route("/:id").patch(updateIncident);
router.route("/:id").delete(deleteIncident);

export default router;
