import { Router } from "express";
import {
    createBroadcast,
    getAllBroadcasts,
} from "../controllers/broadcast.controller.js";
import { verifyJWT, optionalVerifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").get(optionalVerifyJWT, getAllBroadcasts);
router.route("/").post(verifyJWT, createBroadcast);

export default router;
