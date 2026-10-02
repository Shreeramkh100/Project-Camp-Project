import { Router } from 'express';
import { registerUser, authenticateUser } from '../controllers/auth.controllers.js';

//Validators
import validate from '../middlewares/userRegistration.middlewares.js';
import userRegistrationValidator from '../validators/userRegistration.validators.js';
import userAuthenticationValidator from '../validators/userAuthentication.validators.js';

const authRouter = Router();

authRouter
    .route('/register')
    .post(userRegistrationValidator(), validate, registerUser)
authRouter
    .route('/login')
    .post(userAuthenticationValidator(), validate, authenticateUser)

export default authRouter;