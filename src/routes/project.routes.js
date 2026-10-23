import { Router } from 'express';
import { createProject, updateProject , deleteProject } from '../controllers/projects.controllers.js';
import verifyJWT from '../middlewares/auth.middlewares.js';

const projectRouter = Router();

projectRouter
    .route('')
    .post(verifyJWT, createProject);

projectRouter
    .route('/:projectId')
    .put(verifyJWT, updateProject);
    
projectRouter
    .route('/:projectId')
    .delete(verifyJWT, deleteProject);

export default projectRouter;