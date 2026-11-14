import { body, param } from "express-validator";
import { AvailableUserRoles } from "../utils/constants";

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

const addProjectMemberValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is mandatory")
            .isEmail()
            .withMessage("Email is invalid"),

        body("role")
            .trim()
            .notEmpty()
            .withMessage("Role is mandatory")
            .isIn(AvailableUserRoles)
            .withMessage("Role is invalid"),

        param("projectId")
            .isMongoId()
            .withMessage("Invalid project ID"),
    ];
};

const updateProjectMemberValidator = () => {
    return [
        param("projectId")
            .isMongoId()
            .withMessage("Invalid project ID"),

        param("userId")
            .isMongoId()
            .withMessage("Invalid member ID"),

        body("newRole")
            .trim()
            .notEmpty()
            .withMessage("Role is mandatory")
            .isIn(AvailableUserRoles)
            .withMessage("Role is invalid"),
    ];
}

const deleteProjectMemberValidator = () => {
    return [
        param("projectId")
            .isMongoId()
            .withMessage("Invalid project ID"),

        param("userId")
            .isMongoId()
            .withMessage("Invalid member ID"),
    ];
};

export { createProjectValidator, projectIdValidator, addProjectMemberValidator, updateProjectMemberValidator, deleteProjectMemberValidator };
