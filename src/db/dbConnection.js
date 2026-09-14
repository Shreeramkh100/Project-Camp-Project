import mongoose from "mongoose";

async function DBConnection() {
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log("DB Connection Successful ✅")
    } catch (error) {
        console.log("DB Connection Failed ❌ :", error)
        process.exit(1); //Terminates Node 
    }
}

export default DBConnection;