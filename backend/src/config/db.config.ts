import mongoose from "mongoose";
import { config } from "./app.config.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.log("MongoDB connection failed:", error);
    process.exit(1);
  }
};