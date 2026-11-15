import { Schema, model } from 'mongoose';
import { AvailableUserRoles, UserRolesEnum } from "../utils/constants.js";

const projectMemberSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    role: {
        type: String,
        enum: AvailableUserRoles,
        default: UserRolesEnum.MEMBER,
        required: true
    }
}, { timestamps: true });

// Enforce uniqueness for the specified field combination
projectMemberSchema.index({ user: 1, project: 1 },{ unique: true });

const ProjectMember = model("ProjectMember", projectMemberSchema);

export default ProjectMember;