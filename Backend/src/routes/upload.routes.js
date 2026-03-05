import { Router } from "express";
import { uploadImage } from "../controllers/upload.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/").post(upload.single("image"), uploadImage);

export default router;
