import { Router } from "express";
import {
    createBroadcast,
    getAllBroadcasts,
    getAllIncidents,
    getAllUsers,
    getSystemStats,
    updateUserRole,
    GetIncidentbyReportId
} from "../controllers/admin.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.use(verifyJWT, verifyAdmin);

router.route("/incident").get(getAllIncidents);
router.route("/incident/:reportId").get(GetIncidentbyReportId);
router.route("/broadcast").get(getAllBroadcasts);
router.route("/broadcast").post(createBroadcast);
router.route("/stats").get(getSystemStats);
router.route("/users").get(getAllUsers);
router.route("/users/:userId/role").put(updateUserRole);

export default router;
