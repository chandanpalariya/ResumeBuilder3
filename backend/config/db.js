import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // ⭐ .env file load karne ke liye

export const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected successfully ✅");
  } catch (err) {
    console.error("Error during connection ❌:", err.message);
    process.exit(1); // app band kar do agar DB connect na ho
  }
};

export default connectDb;
