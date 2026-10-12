import { Router } from 'express';
import { registerUser, loginUser, logoutUser, requestResetPassword, resetPassword, changePassword, getCurrentUser, verifyEmail, resendVerifyEmail, refreshAccessToken } from '../controllers/auth.controllers.js';

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
    .route('/refresh-token')
    .post(refreshAccessToken)
authRouter
    .route('/verify-email/:verificationToken')
    .get(verifyEmail)
authRouter
    .route('/forgot-password')
    .post(requestResetPassword)
authRouter
    .route('/reset-password/:resetToken')
    .post(resetPassword)


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
authRouter
    .route('/change-password')
    .post(verifyJWT, changePassword) //Need validators

export default authRouter;