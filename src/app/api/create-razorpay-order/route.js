// app/api/create-razorpay-order/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import Razorpay from "razorpay";
import { v4 as uuidv4 } from "uuid";

// Initialize Razorpay
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

    const { amount, currency = "INR" } = await request.json();
    const receipt = `rcpt_${Date.now()}`.substring(0, 40); // e.g., "rcpt_1712345678901" (18 chars)

    // Amount in paise (₹1 = 100 paise)
    const options = {
      amount: Math.round(amount * 100), // e.g., ₹500 → 50000
      currency,
      receipt,
      notes: {
        userId: session.user.id,
      },
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json(order);
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create Razorpay order" },
      { status: 500 }
    );
  }
}
