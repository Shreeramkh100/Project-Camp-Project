import { Router } from 'express';
import { listAllProjects, createProject, getProject, updateProject, deleteProject, getProjectMembers, addProjectMember, updateMemberRole, deleteMemberRole } from '../controllers/projects.controllers.js';
import verifyJWT from '../middlewares/auth.middlewares.js';

//RBAC Implementation
import validateUserRole from '../middlewares/roleBasedAccces.middlewares.js';
import { RoleBasedMapping } from '../utils/constants.js';

const projectRouter = Router();

projectRouter
    .route('')
    .get(verifyJWT, listAllProjects);

projectRouter
    .route('')
    .post(verifyJWT, createProject);

projectRouter
    .route('/:projectId')
    .get(verifyJWT, validateUserRole(RoleBasedMapping.VIEW_PROJECT, "Get project details"), getProject)

projectRouter
    .route('/:projectId')
    .put(verifyJWT, validateUserRole(RoleBasedMapping.UPDATE_PROJECT, "Update project"), updateProject);

projectRouter
    .route('/:projectId')
    .delete(verifyJWT, validateUserRole(RoleBasedMapping.DELETE_PROJECT, "Delete project"), deleteProject);

projectRouter
    .route('/:projectId/members')
    .get(verifyJWT, getProjectMembers);

projectRouter
    .route('/:projectId/members')
    .post(verifyJWT, validateUserRole(RoleBasedMapping.MANAGE_PROJECT_MEMBERS, "Add project member"), addProjectMember);

projectRouter
    .route('/:projectId/members/:userId')
    .put(verifyJWT, validateUserRole(RoleBasedMapping.MANAGE_PROJECT_MEMBERS, "Update member role"), updateMemberRole);

projectRouter
    .route('/:projectId/members/:userId')
    .delete(verifyJWT, validateUserRole(RoleBasedMapping.MANAGE_PROJECT_MEMBERS, "Remove member"), deleteMemberRole);

export default projectRouter;