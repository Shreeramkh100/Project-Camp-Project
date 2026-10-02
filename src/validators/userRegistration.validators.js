import { body } from "express-validator";

const passwordCondition = {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
};
const userRegistrationValidator = () => {
    return [
        body("fullName")
            .trim()
            .notEmpty()
            .withMessage("Full name is mandatory"),

        body("userName")
            .trim()
            .notEmpty()
            .withMessage("Username is mandatory"),

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