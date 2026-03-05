import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { verifyAdmin } from "../middleware/adminMiddleware.js";

import {
  getAllIncidents,
  GetIncidentbyReportId,
  getAllBroadcasts,
  createBroadcast,
  getSystemStats,
  getAllUsers,
  updateUserRole,
} from "../controller/admin.controller.js";

const router = express.Router();

router.use(protect, verifyAdmin);

//Admin Routes
router.get("/incident", getAllIncidents);
router.get("/incident/:reportId", GetIncidentbyReportId);
router.get("/broadcast", getAllBroadcasts);
router.post("/broadcast", createBroadcast);
router.get("/stats", getSystemStats);
router.get("/users", getAllUsers);
router.put("/users/:userId/role", updateUserRole);

export default router;
