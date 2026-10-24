import ProjectMember from "../models/projectMember.models.js";
import Project from "../models/project.models.js";
import asyncHandler from "../utils/asyncHandler.js"
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import { UserRolesEnum } from "../utils/constants.js";

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

    //User is set to Admin
    await ProjectMember.create({
        user: user._id,
        project: project._id,
        role: UserRolesEnum.ADMIN
    })

    return res.status(201).json(new ApiResponse(201, "Project created successfully"));
});

const updateProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const user = req.user;
    const { name, description } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found")
    }

    const projectMember = await ProjectMember.findOne({ project: projectId, user: user._id })

    if (!projectMember || projectMember.role !== UserRolesEnum.ADMIN) {
        throw new ApiError(403, "You are not authorized to update this project")
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

    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found")
    }

    const projectMember = await ProjectMember.findOne({ project: projectId, user: user._id })

    if (!projectMember || projectMember.role !== UserRolesEnum.ADMIN) {
        throw new ApiError(403, "You are not authorized to delete this project")
    }

    await project.deleteOne();
    // TODO: Delete associated ProjectMember, Task, Subtask, and Note records
    // when implementing cascading project deletion.

    return res.status(200).json(new ApiResponse(200, "Project deleted successfully"));
});

export { listAllProjects, createProject, updateProject, deleteProject };