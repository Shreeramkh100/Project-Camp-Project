import { Schema, model } from 'mongoose';
import { TaskStatusEnum, AvailableTaskStatuses } from "../utils/constants.js"

const taskSchema = new Schema({
    project: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: AvailableTaskStatuses,
        default: TaskStatusEnum.TODO,
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    assignedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    attachment: {
        type: [{
            url: {
                type: String
            },
            mimeType: {
                type: String
            },
            size: {
                type: Number
            }
        }],
        default: []
    }

}, { timestamps: true });

// Enforce uniqueness for the specified field combination
taskSchema.index({ project: 1, name: 1 },{ unique: true });

const Task = model("Task", taskSchema);

export default Task;