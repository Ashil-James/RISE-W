import { Router } from "express";
import {
    getWaterIncidents,
    getPowerIncidents,
    getPowerDashboardStats,
    getPowerCriticalIncidents,
    getPowerReportAnalytics,
    updateIncidentStatus
} from "../controllers/authority.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // Secure all authority routes

// Water Authority routes
router.route("/water/incidents").get(getWaterIncidents);
router.route("/water/incidents/:id/status").patch(updateIncidentStatus);

// Power Authority routes
router.route("/power/incidents").get(getPowerIncidents);
router.route("/power/stats").get(getPowerDashboardStats);
router.route("/power/critical").get(getPowerCriticalIncidents);
router.route("/power/analytics").get(getPowerReportAnalytics);

export default router;
