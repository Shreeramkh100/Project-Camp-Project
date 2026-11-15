import { Router } from 'express';
import { registerUser, loginUser, logoutUser, getCurrentUser, refreshAccessToken, verifyEmail, resendVerifyEmail, changePassword, requestResetPassword, resetPassword } from '../controllers/auth.controllers.js';

//Validators
import validate from '../middlewares/validator.middlewares.js';
import { userRegistrationValidator, userAuthenticationValidator, changePasswordValidator, requestResetPasswordValiadtor, resetPasswordValidator } from '../validators/auth.validators.js';
import verifyJWT from '../middlewares/auth.middlewares.js';

const authRouter = Router();

//Unsecure routes
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
    .post(requestResetPasswordValiadtor(), validate, requestResetPassword)
authRouter
    .route('/reset-password/:resetToken')
    .post(resetPasswordValidator(), validate, resetPassword)

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
    .post(verifyJWT, changePasswordValidator(), validate, changePassword)

export default authRouter;