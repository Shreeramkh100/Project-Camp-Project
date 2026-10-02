import { validationResult } from "express-validator";
import ApiError from "../utils/apiError.js";

const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
        return next();
    }

    const optimizedError = errors.array().map((err) => ({ [err.path]: err.msg }));

    throw new ApiError(400, "Data is Invalid", optimizedError);
}
export default validate;