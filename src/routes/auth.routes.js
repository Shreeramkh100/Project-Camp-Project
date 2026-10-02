import { Router } from 'express';
import registerUser from '../controllers/auth.controllers.js';

//Validators
import validate from '../middlewares/userRegistration.middlewares.js';
import userRegistrationValidator from '../validators/userRegistration.validators.js';

const authRouter = Router();

authRouter
    .route('/register').post(userRegistrationValidator(), validate, registerUser)

export default authRouter;