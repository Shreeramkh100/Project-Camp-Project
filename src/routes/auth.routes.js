import { Router } from 'express';
import { registerUser, loginUser, logoutUser, getCurrentUser, verifyEmail, resendVerifyEmail, refreshAccessToken } from '../controllers/auth.controllers.js';

//Validators
import validate from '../middlewares/validator.middlewares.js';
import userRegistrationValidator from '../validators/userRegistration.validators.js';
import userAuthenticationValidator from '../validators/userAuthentication.validators.js';
import verifyJWT from '../middlewares/auth.middlewares.js';

const authRouter = Router();

authRouter
    .route('/register')
    .post(userRegistrationValidator(), validate, registerUser)
authRouter
    .route('/login')
    .post(userAuthenticationValidator(), validate, loginUser)
authRouter
    .route('/verify-email/:verificationToken')
    .get(verifyEmail)
authRouter
    .route('/refresh-token')
    .post(refreshAccessToken)

//Secure Routes
authRouter
    .route('/logout')
    .post(verifyJWT, logoutUser)
authRouter
    .route('/current-user')
    .get(verifyJWT, getCurrentUser)
authRouter
    .route('/resend-email-verification')
    .post(verifyJWT, resendVerifyEmail)


export default authRouter;