import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/users.models.js";
import ApiError from "../utils/apiError.js";
import jwt from "jsonwebtoken";

const verifyJWT = asyncHandler(async (req, res, next) => {

    // Extract access token from cookies (Web) or Authorization header (Mobile)
    const token = req.cookies?.accessToken || req.headers?.authorization?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "Access token is missing");
    }

    let decodedToken;

    // Verify token signature and expiry
    try {
        decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
        throw new ApiError(401, "Invalid or expired access token");
    }

    const user = await User.findById(decodedToken._id).select("-isEmailVerified -refreshToken -emailVerificationExpiry -emailVerificationToken");

    if (!user) {
        throw new ApiError(401, "User not found");
    }

    // Attach user for downstream controllers
    req.user = user;

    return next();
})

export default verifyJWT;