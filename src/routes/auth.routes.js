import { Router } from 'express';
import registerUser from '../controllers/auth.controllers.js';

const authRouter = Router();

authRouter
.route('/register').post(registerUser)

export default authRouter;