import User from "../models/users.models.js";
import asyncHandler from "../utils/asyncHandler.js"
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import { sendEmail, emailVerificationContent } from "../utils/sendEmail.js";
import { authRoute } from "../utils/routeConstants.js";

// Generate and persist authentication tokens
const generateAccessandRefreshTokens=async (id)=>{
        const user=await User.findById(id);
        if(!user){
            throw new ApiError(404,"User not found to generating Access and Refresh Tokens ")
        }
        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();
        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false});
        return {accessToken,refreshToken};
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
        userName:userName,
        email:email,
        fullName:fullName,
        password:password
    })

    const { unhashedToken, hashedToken, tokenExpiry }=user.generateTemporaryToken();

    user.emailVerificationToken=hashedToken;
    user.emailVerificationExpiry=tokenExpiry;

    await user.save({validateBeforeSave:false});

    //Send verification link
    await sendEmail({
        toEmailId:user.email,
        subject:"Verify your email for Registration",
        mailgenContent:emailVerificationContent(
            user.userName,
            `${req.protocol}://${req.host}${authRoute}verify-email/${unhashedToken}`
        )
    })
    // Registration successful
    return res.status(201).json(new ApiResponse( 201 ,"User is Registered successfully",))
})

export default registerUser;