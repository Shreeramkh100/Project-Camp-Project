import ApiError from "../utils/apiError.js";

const errorHandler = (error, req, res, next) => {
    const isApiError = error instanceof ApiError;
    const statusCode = isApiError ? error.statusCode : 500;

    return res.status(statusCode).json({
        success: false,
        message: isApiError ? error.message : "Something went wrong",
        errors: isApiError ? error.errors : [],
        statusCode,
    });
};

export default errorHandler;