import { Router } from "express";
import {
    getWaterIncidents,
    getWaterDashboardStats,
    getWaterCriticalIncidents,
    getWaterReportAnalytics,
    getPowerIncidents,
    getPowerDashboardStats,
    getPowerCriticalIncidents,
    getPowerReportAnalytics,
    getRoadIncidents,
    getRoadDashboardStats,
    getRoadCriticalIncidents,
    getRoadReportAnalytics,
    updateIncidentStatus
} from "../controllers/authority.controller.js";
import { requireAuthorityDepartment, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // Secure all authority routes

// Water Authority routes
router.route("/water/incidents").get(requireAuthorityDepartment("WATER"), getWaterIncidents);
router.route("/water/incidents/:id/status").patch(requireAuthorityDepartment("WATER"), updateIncidentStatus);
router.route("/water/stats").get(requireAuthorityDepartment("WATER"), getWaterDashboardStats);
router.route("/water/critical").get(requireAuthorityDepartment("WATER"), getWaterCriticalIncidents);
router.route("/water/analytics").get(requireAuthorityDepartment("WATER"), getWaterReportAnalytics);

// Power Authority routes
router.route("/power/incidents").get(requireAuthorityDepartment("ELECTRICITY"), getPowerIncidents);
router.route("/power/incidents/:id/status").patch(requireAuthorityDepartment("ELECTRICITY"), updateIncidentStatus);
router.route("/power/stats").get(requireAuthorityDepartment("ELECTRICITY"), getPowerDashboardStats);
router.route("/power/critical").get(requireAuthorityDepartment("ELECTRICITY"), getPowerCriticalIncidents);
router.route("/power/analytics").get(requireAuthorityDepartment("ELECTRICITY"), getPowerReportAnalytics);

// Road Authority routes
router.route("/road/incidents").get(requireAuthorityDepartment("CIVIL"), getRoadIncidents);
router.route("/road/incidents/:id/status").patch(requireAuthorityDepartment("CIVIL"), updateIncidentStatus);
router.route("/road/stats").get(requireAuthorityDepartment("CIVIL"), getRoadDashboardStats);
router.route("/road/critical").get(requireAuthorityDepartment("CIVIL"), getRoadCriticalIncidents);
router.route("/road/analytics").get(requireAuthorityDepartment("CIVIL"), getRoadReportAnalytics);

export default router;

