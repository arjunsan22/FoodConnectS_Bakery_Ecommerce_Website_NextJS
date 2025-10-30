import mongoose from "mongoose";
import { config } from "dotenv";

// 👇 Load .env.local explicitly (only in development)
if (process.env.NODE_ENV !== "production") {
  config({ path: ".env.local" });
}

export async function connectDB() {
  console.log("🔍 Attempting to connect to MongoDB...");

  // Hide sensitive info when logging
  const partialURI = process.env.MONGO_URI
    ? process.env.MONGO_URI.replace(/:.+@/, ":***@")
    : undefined;
  console.log("📡 MONGO_URI (partial):", partialURI);

  const uri = process.env.MONGO_URI;

  // ✅ Skip connection during build if env not found (works for both dev + prod builds)
  if (
    !uri ||
    (process.env.NODE_ENV === "production" && !process.env.MONGO_URI)
  ) {
    console.warn(
      "⚠️ Skipping MongoDB connection – MONGO_URI not found (build stage)"
    );
    return;
  }

  try {
    await mongoose.connect(uri);
    const dbName = uri.split("/").pop()?.split("?")[0] || "unknown";
    console.log("✅ MongoDB connected successfully!");
    console.log("📂 Connected to database:", dbName);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  }
}
