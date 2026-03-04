import express from 'express';
import { upload } from '../middleware/multerMiddleware.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const router = express.Router();

// @desc    Upload an image to Cloudinary
// @route   POST /api/v1/upload
// @access  Public
router.post('/', upload.single('image'), asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, 'No image file provided');
    }

    // Upload the locally saved file to Cloudinary
    const result = await uploadOnCloudinary(req.file.path);

    if (!result) {
        throw new ApiError(500, 'Cloudinary upload failed');
    }

    res.status(200).json(
        new ApiResponse(200, { url: result.secure_url }, 'Image uploaded successfully')
    );
}));

export default router;
