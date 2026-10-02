import { body } from "express-validator";
import { passwordCondition } from "../utils/validationRules.js";

const userRegistrationValidator = () => {
    return [
        body("fullName")
            .trim()
            .notEmpty()
            .withMessage("Full name is mandatory"),

        body("userName")
            .trim()
            .notEmpty()
            .withMessage("Username is mandatory")
            .isLength({min:5})
            .withMessage("Username must have atleast 5 characters"),
           
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

export default userRegistrationValidator;