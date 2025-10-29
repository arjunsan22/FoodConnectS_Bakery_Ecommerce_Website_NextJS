// src/models/Admin.js
import { Schema, model, models } from "mongoose";

const adminSchema = new Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: true },
});

// ✅ Use `models.Admin` to check if model already exists (for Next.js hot reload)
const Admin = models.Admin || model("Admin", adminSchema);

export default Admin;
