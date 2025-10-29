// src/models/User.js
import { Schema, model, models } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String },
    isblocked: { type: Boolean, default: false },
    userImage: { type: String, default: "" },
    tempOTP: String,
    tempOTPExpiresAt: Date,
    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: "Wishlist",
      },
    ],
    orderHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
      },
    ],

    // Add more fields as needed (e.g., phone, address)
  },
  {
    timestamps: true,
  }
);

const User = models.User || model("User", userSchema);
export default User;
