import { Schema, model } from 'mongoose';

const projectSchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

// Enforce uniqueness for the specified field combination
projectSchema.index({ name: 1, createdBy: 1 }, { unique: true })

const Project = model('Project', projectSchema);

export default Project;