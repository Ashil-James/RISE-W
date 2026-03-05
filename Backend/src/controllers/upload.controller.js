import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const uploadImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, "No image file provided");
    }

    const result = await uploadOnCloudinary(req.file.path);

    if (!result) {
        throw new ApiError(500, "Cloudinary upload failed");
    }

    return res.status(200).json(
        new ApiResponse(200, { url: result.secure_url }, "Image uploaded successfully")
    );
});
