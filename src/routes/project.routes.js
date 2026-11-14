import { Router } from 'express';
import { listAllProjects, createProject, getProject, updateProject, deleteProject, getProjectMembers, addProjectMember } from '../controllers/projects.controllers.js';
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
    .get(verifyJWT,validateUserRole(RoleBasedMapping.VIEW_PROJECT,"view projects"), getProject)

projectRouter
    .route('/:projectId')
    .put(verifyJWT,validateUserRole(RoleBasedMapping.VIEW_PROJECT ,"update projects"), updateProject);

projectRouter
    .route('/:projectId')
    .delete(verifyJWT, deleteProject);

projectRouter
    .route('/:projectId/members')
    .get(verifyJWT, getProjectMembers)

projectRouter
    .route('/:projectId/members')
    .post(verifyJWT,validateUserRole(RoleBasedMapping.MANAGE_PROJECT_MEMBERS ,"add Project Members"), addProjectMember)

export default projectRouter;