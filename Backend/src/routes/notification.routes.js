import express from "express";
import { getUserNotifications, markAsRead, markAllAsRead } from "../controllers/notification.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyJWT);

router.route("/").get(getUserNotifications);
router.route("/mark-all-read").post(markAllAsRead);
router.route("/:id/read").patch(markAsRead);

export default router;
