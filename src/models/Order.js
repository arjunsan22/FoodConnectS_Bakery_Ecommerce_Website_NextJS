// models/Order.js
import mongoose, { Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderedItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          default: 0,
        },
        returnReason: {
          type: String,
        },
        unit: {
          type: String,
          enum: ["kg", "litre", "pcs", "packet"],
        },
        status: {
          type: String,
          enum: ["pending", "shipped", "delivered", "cancelled", "returned"],
          default: "pending"
        },
        cancelledAt: {
          type: Date
        },
        cancellationReason: {
          type: String
        }
      },
    ],
    totalPrice: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    finalAmount: {
      type: Number,
    },
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    status: {
      type: String,
      default: "pending",
      enum: [
        "pending",
        "processing",
        "shipping",
        "delivered",
        "cancelled",
        "returned",
        "payment_pending",
      ],
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    deliveryDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;
