import { Router } from "express";
import {
    createBroadcast,
    getAllBroadcasts,
} from "../controllers/broadcast.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").get(getAllBroadcasts);
router.route("/").post(verifyJWT, createBroadcast);

export default router;
