// Example: src/app/api/auth/register/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "../../../../models/User";
import { connectDB } from "../../../../lib/DataBase/connectDB";
export const runtime = "nodejs"; // 👈 add this

export async function POST(req) {
  try {
    const { name, email, phone, password, otp } = await req.json();

    await connectDB();

    // Find user by email (including temp OTP data)
    const userRecord = await User.findOne({ email });

    if (!userRecord) {
      return NextResponse.json(
        { error: "No pending registration found" },
        { status: 400 }
      );
    }

    // Check if OTP expired
    if (!userRecord.tempOTP || new Date() > userRecord.tempOTPExpiresAt) {
      return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    }

    // Validate OTP
    if (userRecord.tempOTP !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // Check if user already fully registered (edge case)
    if (userRecord.password && userRecord.password !== "") {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Now complete registration
    const hashedPassword = await bcrypt.hash(password, 12);

    await User.findByIdAndUpdate(userRecord._id, {
      name,
      phone,
      password: hashedPassword,
      userImage: "",
      tempOTP: undefined,
      tempOTPExpiresAt: undefined,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
