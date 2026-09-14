import express from "express";
import cors from "cors";
const app = express();

// Basic Configurations
app.use(express.json({limit:'16kb'}));//JSON body parsing
app.use(express.urlencoded({extended:true,limit:'16kb'}));//Form body parsing
app.use(express.static("public"));//Static file serving

//  CORS Configurations
app.use(cors({
    origin:process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials:true,
    methods:["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
    allowedHeaders:["Content-Type","Authorization"]
}))

//Import routes
import router from "./routes/healthCheck.routes.js";

app.use("/api/v1/healthcheck/",router)


export default app;
