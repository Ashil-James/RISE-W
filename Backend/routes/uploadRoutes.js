import express from 'express';
import upload from '../config/cloudinary.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

// @desc    Upload an image
// @route   POST /api/v1/upload
// @access  Public
router.post('/', upload.single('image'), asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, 'No image file provided');
    }

    const data = {
        url: req.file.path // Cloudinary places the secure URL in req.file.path
    };

    res.status(200).json(new ApiResponse(200, data, 'Image uploaded successfully'));
}));

export default router;
