import { Schema, model } from 'mongoose';

const userSchema = new Schema({
    avatar: {
        url: {
            type: String,
            default: "https://placehold.net/avatar-5.png"
        },
        localPath: {
            type: String,
            default: ""
        }
    },
    userName: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "Password is Required"]
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    //JWT Tokens
    refreshToken: {
        type: String
    },
    forgotPasswordToken: {
        type: String
    },
    forgotPasswordExpiry: {
        type: Date
    },
    emailVerificationToken: {
        type: String
    },
    emailVerificationExpiry: {
        type: Date
    }
}, { timestamps: true })

const User = model('User', userSchema)

export default User;
