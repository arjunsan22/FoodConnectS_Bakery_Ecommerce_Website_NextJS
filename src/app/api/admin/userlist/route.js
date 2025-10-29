// app/api/admin/userlist/route.js
import { NextResponse } from "next/server";
import User from "../../../../models/User"; // adjust path if needed
import { connectDB } from "../../../../lib/DataBase/connectDB";

export async function GET() {
  try {
    await connectDB();

    const users = await User.find(
      {},
      "name email phone isblocked userImage createdAt"
    )
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(users);
  } catch (error) {
    console.error("❌ Fetch Users Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();

    const { userId, isblocked } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isblocked: Boolean(isblocked) },
      { new: true, select: "name email isblocked" }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("❌ Block User Error:", error);
    return NextResponse.json(
      { error: "Failed to update user status" },
      { status: 500 }
    );
  }
}
