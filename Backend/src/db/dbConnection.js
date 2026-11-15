import mongoose from "mongoose";

async function DBConnection() {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("DB Connection Successful ✅");
}

export default DBConnection;