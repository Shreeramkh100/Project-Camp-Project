import mongoose from "mongoose";
import ProjectMember from "../models/projectMember.models.js";
import Project from "../models/project.models.js";
import asyncHandler from "../utils/asyncHandler.js"
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import { UserRolesEnum } from "../utils/constants.js";
import User from "../models/users.models.js";

const listAllProjects = asyncHandler(async (req, res) => {
    const user = req.user;
    const data = await ProjectMember.aggregate(
        [
            // Step 1: Find all projects the current user is a member of
            {
                $match: { user: user._id }
            },
            // Step 2: Fetch the details of each project.
            // The "project" field in ProjectMember matches the "_id" field in Projects.
            {
                $lookup: {
                    from: "projects",
                    localField: "project",
                    foreignField: "_id",
                    as: "projectDetails", //Store matchind details in array
                    pipeline: [
                        // Step 3: Fetch all members belonging to each project.
                        // The "_id" field in Projects matches the "project" field in ProjectMember.
                        {
                            $lookup: {
                                from: "projectmembers",
                                localField: "_id",
                                foreignField: "project",
                                as: "projectMembers"
                            }
                        },
                        //Step4 :Add count of members
                        {
                            $addFields: { memberCount: { $size: "$projectMembers" } }
                        }
                    ]
                }
            },
            // Step 5: Convert the "projectDetails" array into a single object.
            {
                $unwind: "$projectDetails"
            },
            // Step 6: Select the required fields for the response.
            {
                $project: {
                    role: 1,
                    projectDetails: { _id: 1, name: 1, description: 1, createdBy: 1, createdAt: 1, updatedAt: 1, projectMembers: 1, memberCount: 1 }
                }
            }
        ]
    );

    if (data.length === 0) {
        return res.status(404).json(new ApiResponse(404, "Project not found or you are not a member"));
    }

    return res.status(200).json(new ApiResponse(200, "Projects fetched successfully", data));
})

const createProject = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const user = req.user;

    //Create Project
    const project = await Project.create({
        name: name,
        description: description,
        createdBy: user._id
    });

    //User is set to Project Admin
    await ProjectMember.create({
        user: user._id,
        project: project._id,
        role: UserRolesEnum.PROJECT_ADMIN
    })

    return res.status(201).json(new ApiResponse(201, "Project created successfully"));
});

const getProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const user = req.user;

    //TODO: Move to validators
    if (!mongoose.isValidObjectId(projectId)) {
        throw new ApiError(400, "Invalid project ID");
    }

    const data = await ProjectMember.aggregate(
        [
            { $match: { user: user._id, project: new mongoose.Types.ObjectId(projectId) } },
            {
                $lookup: {
                    from: "projects",
                    localField: "project",
                    foreignField: "_id",
                    as: "projectDetails"
                }
            },
            { $unwind: "$projectDetails" },
            {
                $project: {
                    role: 1, user: 1,
                    projectDetails: {
                        _id: 1, name: 1, description: 1, createdBy: 1, createdAt: 1, updatedAt: 1

                    }
                }
            }])

    if (data.length === 0) {
        return res.status(404).json(new ApiResponse(404, "Project Id Invalid or you are not a member"));
    }

    return res.status(200).json(new ApiResponse(200, "Project fetched successfully", data));
});

const updateProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const user = req.user;
    const { name, description } = req.body;

    //TODO: Move to validators
    if (!mongoose.isValidObjectId(projectId)) {
        throw new ApiError(400, "Invalid project ID");
    }

    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }


    if (name) {
        project.name = name;
    }
    if (description) {
        project.description = description;
    }

    await project.save();

    return res.status(200).json(new ApiResponse(200, "Project updated successfully"));
});

const deleteProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const user = req.user;

    //TODO: Move to validators
    if (!mongoose.isValidObjectId(projectId)) {
        throw new ApiError(400, "Invalid project ID");
    }

    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    await project.deleteOne();
    // TODO: Delete associated ProjectMember, Task, Subtask, and Note records
    // when implementing cascading project deletion.

    return res.status(200).json(new ApiResponse(200, "Project deleted successfully"));
});

const getProjectMembers = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const user = req.user;

    //TODO: Move to validators
    if (!mongoose.isValidObjectId(projectId)) {
        throw new ApiError(400, "Invalid project ID");
    }

    const membership = await ProjectMember.exists({
        project: projectId,
        user: user._id
    });

    if (!membership) {
        throw new ApiError(403, "You are not a member of this project");
    }

    const data = await ProjectMember.aggregate(
        [
            { $match: { project: new mongoose.Types.ObjectId(projectId) } },
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "userInfo"
                }
            },
            { $unwind: "$userInfo" },
            {
                $project: {
                    role: 1, project: 1,
                    userInfo: {
                        _id: 1, avatar: 1, email: 1, fullName: 1
                    }
                }
            }
        ]
    );

    return res.status(200).json(new ApiResponse(200, "Members of Project fetched successfully", data));
});

const addProjectMember = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { email } = req.body;

    //TODO: Move to validators
    if (!mongoose.isValidObjectId(projectId)) {
        throw new ApiError(400, "Invalid project ID");
    }

    const projectObjectId = new mongoose.Types.ObjectId(projectId);

    const newMemberUserInfo = await User.findOne({ email: email });

    if (!newMemberUserInfo) {
        throw new ApiError(404, "User data not found for adding as Project Member");
    }

    const existingMember = await ProjectMember.exists({
        user: newMemberUserInfo._id,
        project: projectObjectId,
    });

    if (existingMember) {
        throw new ApiError(409, "User is already a member of this project");
    }

    //Added Member will by default be Member
    await ProjectMember.create({
        user: newMemberUserInfo._id,
        project: projectObjectId,
        role: UserRolesEnum.MEMBER
    });

    return res.status(201).json(new ApiResponse(201, "Member added to your project successfully"));
});

//TODO: Currently update works only on upgrade but downgrade also has to be implemented
const updateMemberRole = asyncHandler(async (req, res) => {
    const { projectId, userId } = req.params;

    //TODO: Move to validators
    if (!mongoose.isValidObjectId(projectId)) {
        throw new ApiError(400, "Invalid project ID");
    }
    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid member ID");
    }

    const member = await ProjectMember.findOne({ user: userId, project: projectId });

    if (!member) {
        throw new ApiError(404, "Member not found or is not part of this project")
    }

    if (member.role === UserRolesEnum.PROJECT_ADMIN) {
        return res.status(200).json(new ApiResponse(200, "Member is already a Project Admin"))
    }

    member.role = UserRolesEnum.PROJECT_ADMIN;
    await member.save();

    return res.status(200).json(new ApiResponse(200, "Member role updated to Project Admin successfully"))
})

const deleteMemberRole = asyncHandler(async(req,res)=>{
    const { projectId, userId } = req.params;

    //TODO: Move to validators
    if (!mongoose.isValidObjectId(projectId)) {
        throw new ApiError(400, "Invalid project ID");
    }
    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid member ID");
    }

    const member = await ProjectMember.findOneAndDelete({ user: userId, project: projectId });

     if (!member) {
        throw new ApiError(404, "Member not found or is not part of this project");
    }

    return res.status(200).json(new ApiResponse(200, "Member removed from the project successfully"));
})

export { listAllProjects, createProject, getProject, updateProject, deleteProject, getProjectMembers, addProjectMember, updateMemberRole, deleteMemberRole };