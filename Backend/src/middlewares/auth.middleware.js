import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET);

        const user = await User.findById(decodedToken?._id || decodedToken?.id).select("-password");

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});

export const optionalVerifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (token) {
            const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET);
            const user = await User.findById(decodedToken?._id || decodedToken?.id).select("-password");
            req.user = user || null;
        } else {
            req.user = null;
        }
    } catch (error) {
        req.user = null; // If token is expired/invalid, act as guest
    }
    next();
});

export const requireAuthorityDepartment = (department) => {
    return (req, _, next) => {
        if (!req.user) {
            throw new ApiError(401, "Unauthorized request");
        }

        if (!["authority", "admin"].includes(req.user.role)) {
            throw new ApiError(403, "Authority access required");
        }

        if (req.user.role !== "admin" && req.user.department !== department) {
            throw new ApiError(403, "You are not authorized to access this authority portal");
        }

        req.authorityDepartment = department;
        next();
    };
};
