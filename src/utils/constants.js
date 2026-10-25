export const HashRound = 10;
export const BufferVal = 20;

export const fromEmailId = "projectcamp@gmail.com"

export const UserRolesEnum = {
    ADMIN: "admin",
    PROJECT_ADMIN: "project_admin",
    MEMBER: "member"
};

const ADMIN_ROLES = [
    UserRolesEnum.ADMIN,
    UserRolesEnum.PROJECT_ADMIN
];

const ALL_PROJECT_ROLES = [
    ...ADMIN_ROLES,
    UserRolesEnum.MEMBER
];

export const RoleBasedPermissionMapping = {
    // Project
    VIEW_PROJECT:ALL_PROJECT_ROLES,
    UPDATE_PROJECT: ADMIN_ROLES,
    DELETE_PROJECT: ADMIN_ROLES,
    MANAGE_PROJECT_MEMBERS: ADMIN_ROLES,

    // Tasks
    CREATE_TASKS: ADMIN_ROLES,
    VIEW_TASKS: ALL_PROJECT_ROLES,
    UPDATE_TASKS: ADMIN_ROLES,
    DELETE_TASKS: ADMIN_ROLES,
    UPDATE_TASK_STATUS: ALL_PROJECT_ROLES,
    
    // Subtasks
    CREATE_SUBTASKS: ALL_PROJECT_ROLES,
    VIEW_SUBTASKS: ALL_PROJECT_ROLES,
    UPDATE_SUBTASKS: ALL_PROJECT_ROLES,
    DELETE_SUBTASKS: ALL_PROJECT_ROLES,
    UPDATE_SUBTASK_STATUS: ALL_PROJECT_ROLES,

    // Notes
    CREATE_NOTES: ALL_PROJECT_ROLES,
    VIEW_NOTES: ALL_PROJECT_ROLES,
    UPDATE_NOTES: ALL_PROJECT_ROLES,
    DELETE_NOTES: ADMIN_ROLES,
};

export const AvailableUserRoles = Object.values(UserRolesEnum);

export const TaskStatusEnum = {
    TODO: "todo",
    IN_PROGRESS: "in_progress",
    DONE: "done"
};

export const AvailableTaskStatuses = Object.values(TaskStatusEnum);