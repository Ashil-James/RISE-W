import { Router } from "express";
import { getActiveSurvey, submitBatchSurvey } from "../controllers/weather.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public-ish: any logged-in user can check for active surveys
router.route("/active-survey").get(verifyJWT, getActiveSurvey);

// Protected: logged-in users submit their survey responses
router.route("/batch-survey").post(verifyJWT, submitBatchSurvey);

export default router;
