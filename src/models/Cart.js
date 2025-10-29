// src/models/Cart.js
import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  // Optional: if you support variants (e.g., size, color)
  // variant: { type: String },
}, { _id: false }); // Avoid extra _id in subdocs

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // Clerk user ID (e.g., "user_123abc")
      required: true,
      unique: true, // Ensure one cart per user
      index: true,
    },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

// Ensure efficient lookups by userId

const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema);
export default Cart;