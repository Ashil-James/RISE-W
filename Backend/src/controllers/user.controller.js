import { User } from "../models/user.model.js";
import { Incident } from "../models/incident.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getUserStats = async (userId) => {
    const total = await Incident.countDocuments({ reportedBy: userId });
    const resolved = await Incident.countDocuments({ reportedBy: userId, status: 'RESOLVED' });
    const pending = await Incident.countDocuments({ reportedBy: userId, status: { $in: ['OPEN', 'IN_PROGRESS', 'ACCEPTED'] } });
    return { total, resolved, pending };
};

export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, phoneNumber, location } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        throw new ApiError(400, "User with email already exists");
    }

    const userData = {
        name,
        email,
        password,
        phoneNumber,
    };

    if (location && location.coordinates && location.coordinates.length === 2) {
        userData.location = location;
    }

    const user = await User.create(userData);

    const createdUser = await User.findById(user._id).select("-password");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    const accessToken = user.generateAccessToken();

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                ...createdUser._doc,
                accessToken,
                token: accessToken
            },
            "User registered Successfully"
        )
    );
});

export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        throw new ApiError(400, "email is required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const accessToken = user.generateAccessToken();

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const loggedInUser = await User.findById(user._id).select("-password");
    const stats = await getUserStats(user._id);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                ...loggedInUser._doc,
                accessToken,
                token: accessToken,
                stats
            },
            "User logged In Successfully"
        )
    );
});

export const getCurrentUser = asyncHandler(async (req, res) => {
    const stats = await getUserStats(req.user._id);
    return res
        .status(200)
        .json(new ApiResponse(200, { ...req.user._doc, stats }, "User profile fetched successfully"));
});

export const updateAccountDetails = asyncHandler(async (req, res) => {
    const { name, email, phoneNumber, location } = req.body;

    if (!name || !email) {
        throw new ApiError(400, "All fields are required");
    }

    const updateFields = { name, email, phoneNumber };

    // Prevent corrupting the `$geoWithin` spherical index with missing coordinates
    if (location && location.coordinates && location.coordinates.length === 2) {
        updateFields.location = location;
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: updateFields },
        { new: true }
    ).select("-password");

    const stats = await getUserStats(user._id);

    return res
        .status(200)
        .json(new ApiResponse(200, { ...user._doc, stats }, "Account details updated successfully"));
});

export const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});
