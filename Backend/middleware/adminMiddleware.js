import { ApiResponse } from "../utils/ApiResponse.js";

export const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json(new ApiResponse(401, null, "Not authorized, no user found"));
  }

  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json(new ApiResponse(403, null, "Forbidden, admin access required"));
  }
  next();
};
