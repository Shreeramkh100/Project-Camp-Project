import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/errorHandler.middlewares.js";
const app = express();

// Basic Configurations
app.use(express.json({ limit: '16kb' }));//JSON body parsing
app.use(express.urlencoded({ extended: true, limit: '16kb' }));//Form body parsing
app.use(express.static("public"));//Static file serving
app.use(cookieParser());

//  CORS Configurations
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))

//Import routes
import healthCheckRouter from "./routes/healthCheck.routes.js";
import authRouter from "./routes/auth.routes.js";
import projectRouter from "./routes/project.routes.js";
import { healthCheckRoute, authRoute, projectRoute } from "./utils/routeConstants.js";

//Helathcheck route
app.use(healthCheckRoute, healthCheckRouter);

//Authentication Route
app.use(authRoute, authRouter)

//Project Route
app.use(projectRoute, projectRouter)

//  Error Handling Middleware
app.use(errorHandler);

export default app;
