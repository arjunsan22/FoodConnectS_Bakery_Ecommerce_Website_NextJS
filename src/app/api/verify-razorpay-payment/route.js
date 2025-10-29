// app/api/verify-razorpay-payment/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import Razorpay from "razorpay";
import crypto from "crypto";
import { connectDB } from "../../../lib/DataBase/connectDB";
import Order from "../../../models/Order";
import Cart from "../../../models/Cart";
import Product from "../../../models/Product";
import { v4 as uuidv4 } from "uuid";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      address,
      orderedItems,
      totalPrice,
      discount,
      finalAmount,
    } = await request.json();

    // 1. Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // 2. Proceed to create order (same as your existing logic)
    await connectDB();

    for (const item of orderedItems) {
      const product = await Product.findById(item.product);
      if (!product || product.quantity < item.quantity) {
        return NextResponse.json(
          {
            error: `⚠️ Oops! ${product?.name || "Product"} went out of stock during checkout. 
            The payment will be automatically refunded within 24 hours`,
          },
          { status: 400 }
        );
      }
    }

    const order = new Order({
      orderId: uuidv4(),
      userId: session.user.id,
      address,
      paymentMethod: "upi",
      orderedItems,
      totalPrice,
      discount,
      finalAmount,
      status: "processing", // ✅ Payment verified → start processing
    });

    for (const item of orderedItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { quantity: -item.quantity },
      });
    }

    await order.save();
    await Cart.findOneAndUpdate(
      { userId: session.user.id },
      { $set: { items: [] } }
    );

    return NextResponse.json({ orderId: order.orderId });
  } catch (error) {
    console.error("Razorpay verification error:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
