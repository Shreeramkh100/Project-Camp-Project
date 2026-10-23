import ProjectMember from "../models/projectMember.models.js";
import Project from "../models/project.models.js";
import asyncHandler from "../utils/asyncHandler.js"
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import { UserRolesEnum } from "../utils/constants.js";

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
    const { name , description } = req.body;

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

const deleteProject=asyncHandler(async(req,res)=>{
    const { projectId } = req.params;
    const user=req.user;

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

export { createProject, updateProject , deleteProject };