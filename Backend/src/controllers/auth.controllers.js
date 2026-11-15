import crypto from 'crypto';
import jwt from "jsonwebtoken";
import User from "../models/users.models.js";
import asyncHandler from "../utils/asyncHandler.js"
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import { sendEmail, emailVerificationContent, passwordResetContent } from "../utils/sendEmail.js";
import { authRoute } from "../utils/routeConstants.js";

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
}

const accessTokenCookieOptions = {
    ...cookieOptions,
    maxAge: Number(process.env.ACCESS_TOKEN_EXPIRY_COOKIES)
}

const refreshTokenCookieOptions = {
    ...cookieOptions,
    maxAge: Number(process.env.REFRESH_TOKEN_EXPIRY_COOKIES)
}

// Generate authentication tokens and persist the refresh token.
const generateAccessandRefreshTokens = async (id) => {
    const user = await User.findById(id);

    if (!user) {
        throw new ApiError(404, "User not found to generate Access and Refresh Token")
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Store Refresh token in database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
}

const registerUser = asyncHandler(async (req, res) => {
    const { userName, email, fullName, password } = req.body;

    const existingUser = await User.findOne({
        $or: [{ userName }, { email }]
    })

    if (existingUser) {
        throw new ApiError(409, "Username or email already exists")
    }

    //User created and saved (password hashed by pre-hook)
    const user = await User.create({
        userName: userName,
        email: email,
        fullName: fullName,
        password: password
    })

    const { unhashedToken, hashedToken, tokenExpiry } = await user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;

    await user.save({ validateBeforeSave: false });

    //Send Verification link
    await sendEmail({
        toEmailId: user.email,
        subject: "Verify your email for Registration",
        mailgenContent: emailVerificationContent(
            user.userName,
            `${req.protocol}://${req.host}${authRoute}verify-email/${unhashedToken}`
        )
    })

    return res.status(201).json(new ApiResponse(201, "User registered successfully"));
})


const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user with email and include password for authentication
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }

    // Verify provided password against stored hashed password
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid email or password");
    }

    // Generate and persist authentication tokens
    const { accessToken, refreshToken } = await generateAccessandRefreshTokens(user._id);

    // Web clients use HttpOnly cookies.
    return res.status(200)
        .cookie("refreshToken", refreshToken, refreshTokenCookieOptions)
        .cookie("accessToken", accessToken, accessTokenCookieOptions)
        .json(new ApiResponse(200, "Login successful"));

    // Mobile clients can receive tokens in the response body.
    // return res.status(200).json(
    //     new ApiResponse(200, "Login successful", {
    //         accessToken,
    //         refreshToken
    //     })
    // );

})

const logoutUser = asyncHandler(async (req, res) => {
    // Get the authenticated user's ID from the verifyJWT middleware
    const userId = req.user._id;

    // Invalidate the user's refresh token in the database
    await User.findByIdAndUpdate(userId,
        { $set: { refreshToken: null } },
        { new: true }
    );

    // Clear both authentication cookies from the browser
    return res.status(200)
        .clearCookie("refreshToken", cookieOptions)
        .clearCookie("accessToken", cookieOptions)
        .json(new ApiResponse(200, "Logout successful"));
})

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = req.user;
    return res.status(200).json(new ApiResponse(200, "User details retrieved successfully", { user }))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    // Extract access token from cookies (Web) or Authorization header (Mobile)
    const token = req.cookies?.refreshToken || req.headers?.authorization?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "Refresh token is required");
    }

    let decodedToken;

    try {
        // Verify token signature and expiry
        decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
        throw new ApiError(401, "Invalid or expired refresh token");
    }
    // Validate user and stored refresh token
    const user = await User.findOne({ _id: decodedToken._id, refreshToken: token });

    if (!user) {
        throw new ApiError(401, "Invalid or expired refresh token");
    }
    // Rotate tokens and persist the new refresh token
    const { accessToken, refreshToken } = await generateAccessandRefreshTokens(user._id);

    // Web clients use HttpOnly cookies.
    return res.status(200)
        .cookie("accessToken", accessToken, accessTokenCookieOptions)
        .cookie("refreshToken", refreshToken, refreshTokenCookieOptions)
        .json(new ApiResponse(200, "Access and Refresh tokens refreshed successfully"));

    // Mobile clients can receive tokens in the response body.
    // return res.status(200)
    //     .json(new ApiResponse(200, "Access and Refresh tokens refreshed successfully",{
    //         accessToken,
    //         refreshToken
    // }));
})

const verifyEmail = asyncHandler(async (req, res) => {
    const { verificationToken } = req.params;

    if (!verificationToken) {
        throw new ApiError(400, "Email verification token missing");
    }

    const unhashedToken = verificationToken;

    // Hash the incoming token to match the stored hash
    const generatedHashedToken = crypto.createHash("sha256").update(unhashedToken).digest("hex");

    // Find the user with a matching, unexpired verification token
    const user = await User.findOne({
        emailVerificationToken: generatedHashedToken,
        emailVerificationExpiry: { $gt: Date.now() }
    });

    if (!user) {
        throw new ApiError(400, "Invalid or expired email verification token");
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpiry = null;

    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, "Email verified successfully"));
})

const resendVerifyEmail = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Skip if the email is already verified
    if (user.isEmailVerified) {
        return res.status(200).json(new ApiResponse(200, "Email is already verified"))
    }

    // Generate a new verification token and expiry
    const { unhashedToken, hashedToken, tokenExpiry } = await user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;

    await user.save({ validateBeforeSave: false });

    //Send verification link
    await sendEmail({
        toEmailId: user.email,
        subject: "Verify your email for Registration",
        mailgenContent: emailVerificationContent(
            user.userName,
            `${req.protocol}://${req.host}${authRoute}verify-email/${unhashedToken}`
        )
    });

    return res.status(200).json(new ApiResponse(200, "Verification email sent successfully"));
})

const changePassword = asyncHandler(async (req, res) => {
    const userData = req.user;
    const { password, newPassword } = req.body;

    // Fetch the user with the password field included for verification
    const user = await User.findById(userData._id).select("+password");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Verify the current password before allowing a password change
    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Current password is incorrect");
    }

    // Prevent the user from reusing their existing password
    const isExistingandNewPasswordSame = await user.isPasswordCorrect(newPassword);

    if (isExistingandNewPasswordSame) {
        throw new ApiError(400, "New password must differ from the current password")
    }

    // Update the password;
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    // Rotate authentication tokens after the password change
    const { accessToken, refreshToken } = await generateAccessandRefreshTokens(user._id);

    return res.status(200)
        .cookie("accessToken", accessToken, accessTokenCookieOptions)
        .cookie("refreshToken", refreshToken, refreshTokenCookieOptions)
        .json(new ApiResponse(200, "Password changed successfully"));
})

const requestResetPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email })

    // Avoid revealing whether an account exists.
    if (!user) {
        return res.status(200)
            .json(new ApiResponse(200, "If an account exists, a password reset link will be sent"));
    }

    // Generate a temporary token, its hash for database storage, and its expiry time
    const { unhashedToken, hashedToken, tokenExpiry } = await user.generateTemporaryToken();

    // Store only the hashed token and expiry
    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false })

    //Send Password reset link
    await sendEmail({
        toEmailId: user.email,
        subject: "Reset your Password",
        mailgenContent: passwordResetContent(
            user.userName,
            `${req.protocol}://${req.host}${authRoute}reset-password/${unhashedToken}`
        )
    })

    return res.status(200).json(new ApiResponse(200, "If an account exists, a password reset link will be sent"))
})

const resetPassword = asyncHandler(async (req, res) => {
    const { newPassword } = req.body;
    const { resetToken } = req.params;

    if (!resetToken) {
        throw new ApiError(400, "Password reset token is missing")
    }

    // Hash the token from the URL to compare it with the hash stored in the database
    const unhashedToken = resetToken;
    const hashedToken = crypto.createHash("sha256").update(unhashedToken).digest("hex");

    //Accept only a matching reset token that has not expired
    const user = await User.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordExpiry: { $gt: Date.now() }
    }).select("+password");

    if (!user) {
        throw new ApiError(400, "Invalid or expired password reset token")
    }

    // Prevent the user from reusing their existing password
    const isExistingandNewPasswordSame = await user.isPasswordCorrect(newPassword);

    if (isExistingandNewPasswordSame) {
        throw new ApiError(400, "New password must differ from the current password")
    }

    // Set the new password and invalidate the reset token to prevent reuse
    user.password = newPassword;
    user.forgotPasswordExpiry = null;
    user.forgotPasswordToken = null;

    await user.save({ validateBeforeSave: false })

    // Generate fresh authentication tokens after a successful password reset
    const { refreshToken, accessToken } = await generateAccessandRefreshTokens(user._id);

    return res.status(200)
        .cookie("accessToken", accessToken, accessTokenCookieOptions)
        .cookie("refreshToken", refreshToken, refreshTokenCookieOptions)
        .json(new ApiResponse(200, "Password reset successfully"))
})

export { registerUser, loginUser, logoutUser, getCurrentUser, refreshAccessToken, verifyEmail, resendVerifyEmail, changePassword, requestResetPassword, resetPassword };