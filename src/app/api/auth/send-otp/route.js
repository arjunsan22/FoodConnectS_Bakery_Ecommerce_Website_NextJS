// src/app/api/auth/send-otp/route.js
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { randomInt } from "crypto";
import User from "../../../../models/User";
import { connectDB } from "../../../../lib/DataBase/connectDB";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const MIN_RESEND_INTERVAL = 60 * 1000; // 60 seconds

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Generate new OTP
    const otp = randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 60 * 1000); // 1 minute

    // Save to DB (upsert: create or update)
    await User.findOneAndUpdate(
      { email },
      {
        tempOTP: otp,
        tempOTPExpiresAt: expiresAt,
      },
      { upsert: true, new: true }
    );

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code for FoodConnects",
      text: `Your OTP is ${otp}. Valid for 1 minute.`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
