import { body, param } from "express-validator";

const createProjectValidator = () => {
    return [
        body("name")
            .trim()
            .notEmpty()
            .withMessage("Project name is mandatory"),

        body("description")
            .trim()
            .notEmpty()
            .withMessage("Project description is mandatory"),
    ];
}

const projectIdValidator = () => {
    return [
        param("projectId")
            .isMongoId()
            .withMessage("Invalid project ID"),
    ];
};

const projectIdAndUserIdValidator = () => {
    return [
        param("projectId")
            .isMongoId()
            .withMessage("Invalid project ID"),

        param("userId")
            .isMongoId()
            .withMessage("Invalid member ID"),
    ];
};

const addProjectMemberValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is mandatory")
            .isEmail()
            .withMessage("Email is invalid"),
        param("projectId")
            .isMongoId()
            .withMessage("Invalid project ID"),
    ];
};

export { createProjectValidator, projectIdValidator, addProjectMemberValidator, projectIdAndUserIdValidator };
