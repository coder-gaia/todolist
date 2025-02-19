import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Define the enviroment variable MONGODB_URI");
}

export const connectToDatabase = async () => {
  try {
    if (mongoose.connection.readyState >= 1) return;
    await mongoose.connect(MONGODB_URI);
    console.log("📦 Conected to MongoDB");
  } catch (error) {
    console.error("Error while conecting to MongoDB:", error);
  }
};
