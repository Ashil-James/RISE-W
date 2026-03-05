import { Router } from "express";
import {
    loginUser,
    registerUser,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

// secured routes
router.route("/me").get(verifyJWT, getCurrentUser);
router.route("/profile").put(verifyJWT, updateAccountDetails);
router.route("/update-password").put(verifyJWT, changeCurrentPassword);

export default router;
