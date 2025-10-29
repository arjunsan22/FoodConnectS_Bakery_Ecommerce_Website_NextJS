import mongoose from "mongoose";
import { config } from "dotenv"; // 👈 Add this

// 👇 Load .env.local explicitly (only in development)
if (process.env.NODE_ENV !== "production") {
  config({ path: ".env.local" });
}

export async function connectDB() {
  console.log("🔍 Attempting to connect to MongoDB...");
  console.log(
    "📡 MONGO_URI (partial):",
    process.env.MONGO_URI?.replace(/:.+@/, ":***@")
  );
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("❌ MONGO_URI is not defined in environment variables");
  }

  try {
    await mongoose.connect(uri);
    const dbName = uri.split("/").pop()?.split("?")[0] || "unknown";
    console.log("✅ MongoDB connected successfully!");
    console.log("📂 Connected to database:", dbName);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}
