import { body } from 'express-validator';
import { passwordCondition } from '../utils/validationRules.js';

const userAuthenticationValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is mandatory")
            .isEmail()
            .withMessage("Email is Invalid"),

        body("password")
            .notEmpty()
            .withMessage("Password is mandatory")
            .matches(/^\S+$/)
            .withMessage("Password must not contain spaces")
            .isStrongPassword(passwordCondition)
            .withMessage("Password must be strong"),
    ]
}

export default userAuthenticationValidator;