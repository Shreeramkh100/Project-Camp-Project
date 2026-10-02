import User from "../models/users.models.js";
import asyncHandler from "../utils/asyncHandler.js"
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import { sendEmail, emailVerificationContent } from "../utils/sendEmail.js";
import { authRoute } from "../utils/routeConstants.js";

// Generate and persist authentication tokens
const generateAccessandRefreshTokens = async (id) => {
    const user = await User.findById(id);
    if (!user) {
        throw new ApiError(404, "User not found to generating Access and Refresh Tokens ")
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Store refresh token in database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
}

const cookieOptions = {
    httpOnly: true,
    secure: true
}

const registerUser = asyncHandler(async (req, res) => {
    // Get user data
    const { userName, email, fullName, password } = req.body;

    // Check existing user
    const existingUser = await User.findOne({
        $or: [{ userName }, { email }]
    })

    if (existingUser) {
        throw new ApiError(409, "User with the given username or email already exists")
    }

    //User created and saved (password hashed by pre-hook)
    const user = await User.create({
        userName: userName,
        email: email,
        fullName: fullName,
        password: password
    })

    const { unhashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();

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
    })
    // Registration successful
    return res.status(201).json(new ApiResponse( 201 ,"User is Registered successfully",))
})


const authenticateUser = asyncHandler(async (req, res) => {
    // Get login credentials
    const { email, password } = req.body;

    // Find user and include password for authentication
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        throw new ApiError(404, "User not found. Please register first")
    }

    // Verify provided password against stored hash
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid Credentials")
    }

    // Generate and persist authentication tokens
    const { accessToken, refreshToken } = await generateAccessandRefreshTokens(user._id);

      // Send access token in response and refresh token in HttpOnly cookie
    return res.status(200)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(new ApiResponse(200, "User authenticated successfully", { accessToken }))

})

export { registerUser, authenticateUser };