import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { HashRound, BufferVal } from '../utils/constants.js';

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
        required: [true, "Password is Required"],
        select:false
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
}, { timestamps: true });

//Hooks 
//Either use next() or async-await
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return;
    }
    this.password = await bcrypt.hash(this.password, HashRound);
})

//Methods
userSchema.methods.isPasswordCorrect = async function (password) {
    const isPasswordCorrect = await bcrypt.compare(password, this.password);
    return isPasswordCorrect;
}

//Access Token
userSchema.methods.generateAccessToken = function () {
    const accessToken = jwt.sign({
        _id: this._id,
        userName: this.userName,
        email: this.email
    },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
    return accessToken;
}

//Refresh Token
userSchema.methods.generateRefreshToken = function () {
    const refreshToken = jwt.sign({
        _id: this._id
    },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
    return refreshToken;
}

//Temporary Token (Without Data Token)
userSchema.methods.generateTemporaryToken = function () {
    const unhashedToken = crypto.randomBytes(BufferVal).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(unhashedToken).digest("hex");
    const tokenExpiry = Date.now() + (20 * 60 * 1000); //20 minutes
    return { unhashedToken, hashedToken, tokenExpiry };
}

const User = model('User', userSchema);

export default User;
