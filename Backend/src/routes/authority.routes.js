import { Router } from "express";
import {
    getWaterIncidents,
    updateIncidentStatus
} from "../controllers/authority.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // Secure all authority routes

// Water Authority routes
router.route("/water/incidents").get(getWaterIncidents);
router.route("/water/incidents/:id/status").patch(updateIncidentStatus);

export default router;
