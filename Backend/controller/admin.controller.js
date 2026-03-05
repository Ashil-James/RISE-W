import Incident from "../models/Incident.js";
import Broadcast from "../models/Broadcast.js";
import User from "../models/User.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// @desc    Get all incidents
// @route   GET /api/admin/incident
// @access  Private/Admin

export const getAllIncidents = asyncHandler(async (req, res) => {
  const incidents = await Incident.find()
    .populate("reportedBy", "name email")
    .sort({ createdAt: -1 });

  res.json(new ApiResponse(200, incidents, "Incidents retrieved successfully"));
});

// @desc    Get incident by report ID
// @route   GET /api/admin/incident/:reportId
// @access  Private/Admin

export const GetIncidentbyReportId = asyncHandler(async (req, res) => {
  const { reportId } = req.params;

  const incident = await Incident.findOne({ reportId }).populate(
    "reportedBy",
    "name email",
  );

  if (!incident) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Incident not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, incident, "Incident retrieved successfully"));
});

// @desc    Get all broadcasts
// @route   GET /api/admin/broadcast
// @access  Private/Admin

export const getAllBroadcasts = asyncHandler(async (req, res) => {
  const broadcasts = await Broadcast.find()
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, broadcasts, "Broadcasts retrieved successfully"),
    );
});

// @desc    Create a new broadcast
// @route   POST /api/admin/broadcast
// @access  Private/Admin

export const createBroadcast = asyncHandler(async (req, res) => {
  const { type, severity, location, message } = req.body;

  const broadcast = await Broadcast.create({
    type,
    severity,
    location,
    message,
    createdBy: req.user._id,
    isAuthority: true,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, broadcast, "Broadcast created successfully"));
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users retrieved successfully"));
});

// @desc    Update user role
// @route   PUT /api/admin/users/:userId/role
// @access  Private/Admin

export const updateUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!["user", "admin", "authority"].includes(role)) {
    return res.status(400).json(new ApiResponse(400, null, "Invalid role"));
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true },
  ).select("-password");

  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, "User not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User role updated successfully"));
});

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Private/Admin

export const getSystemStats = asyncHandler(async (req, res) => {
  const totalIncidents = await Incident.countDocuments();

  const openIncidents = await Incident.countDocuments({ status: "open" });

  const resolvedIncidents = await Incident.countDocuments({
    status: "resolved",
  });

  const totalUsers = await User.countDocuments({
    role: "user",
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalIncidents,
        openIncidents,
        resolvedIncidents,
        totalUsers,
      },
      "System statistics retrieved successfully",
    ),
  );
});
