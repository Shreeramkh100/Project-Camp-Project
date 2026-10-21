import { Schema, model } from 'mongoose';
import { TaskStatusEnum, AvailableTaskStatuses } from "../utils/constants.js"

const subTaskSchema = new Schema({
    task: {
        type: Schema.Types.ObjectId,
        ref: "Task",
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
    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
}, { timestamps: true });

// Enforce uniqueness for the specified field combination
subTaskSchema.index({ task: 1, name: 1 }, { unique: true })

const Subtask = model("Subtask", subTaskSchema);

export default Subtask;