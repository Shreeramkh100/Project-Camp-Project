export const HashRound = 10;
export const BufferVal = 20;

export const fromEmailId = "projectcamp@gmail.com"

export const UserRolesEnum = {
    ADMIN: "admin",
    PROJECT_ADMIN: "project_admin",
    MEMBER: "member"
};

const ADMIN_ONLY = [UserRolesEnum.ADMIN];

const PROJECT_MANAGERS = [
    UserRolesEnum.ADMIN,
    UserRolesEnum.PROJECT_ADMIN
];

const ALL_PROJECT_ROLES = [
    UserRolesEnum.ADMIN,
    UserRolesEnum.PROJECT_ADMIN,
    UserRolesEnum.MEMBER
];

export const RoleBasedPermissionMapping = {
    // Project
    CREATE_PROJECT: ADMIN_ONLY,
    UPDATE_PROJECT: ADMIN_ONLY,
    DELETE_PROJECT: ADMIN_ONLY,
    MANAGE_PROJECT_MEMBERS: ADMIN_ONLY,

    // Tasks
    CREATE_TASKS: PROJECT_MANAGERS,
    UPDATE_TASKS: PROJECT_MANAGERS,
    DELETE_TASKS: PROJECT_MANAGERS,
    VIEW_TASKS: ALL_PROJECT_ROLES,

    // Subtasks
    UPDATE_SUBTASK: ALL_PROJECT_ROLES,
    CREATE_SUBTASKS: PROJECT_MANAGERS,
    DELETE_SUBTASKS: PROJECT_MANAGERS,

    // Notes
    CREATE_NOTES: ADMIN_ONLY,
    UPDATE_NOTES: ADMIN_ONLY,
    DELETE_NOTES: ADMIN_ONLY,
    VIEW_NOTES: ALL_PROJECT_ROLES
};

export const AvailableUserRoles = Object.values(UserRolesEnum);

export const TaskStatusEnum = {
    TODO: "todo",
    IN_PROGRESS: "in_progress",
    DONE: "done"
};

export const AvailableTaskStatuses = Object.values(TaskStatusEnum);