import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import ProjectMember from "../models/projectMember.models.js";
import ApiError from "../utils/apiError.js";

const validateUserRole = (roles = [], message = "perform this action") => asyncHandler(async (req, res, next) => {
    const user = req.user;
    const { projectId } = req.params;

    if (!mongoose.isValidObjectId(projectId)) {
        throw new ApiError(400, "Invalid project ID");
    }

    const projectObjectId = new mongoose.Types.ObjectId(projectId);

    const projectMember = await ProjectMember.findOne({
        user: user._id,
        project: projectObjectId
    })

    if (!projectMember) {
        throw new ApiError(404, "Project not found or you do not have access to it");
    }

    const hasPermission = roles.includes(projectMember.role);

    if (!hasPermission) {
        throw new ApiError(403, `You do not have permission to ${message} in this project. Contact your project admin for assistance`);
    }

    req.projectRole = projectMember.role;

    return next();
});

export default validateUserRole;