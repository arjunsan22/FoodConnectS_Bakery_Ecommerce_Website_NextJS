import { connectDB } from "../../../../lib/DataBase/connectDB";
import Admin from "../../../../models/Admin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
  await connectDB();
  const { name, password } = await request.json();
  console.log("🔍 Login attempt:", { name, password }); // 👈 Add this

  const admin = await Admin.findOne({ name, password });

  if (!admin || !admin.isAdmin) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set("admin_session", "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24,
    path: "/admin",
  });
  cookieStore.set("admin_logged_in", "true", {
  httpOnly: false, // ✅ readable by JS
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24,
  path: "/",
});
  return NextResponse.json({ success: true });
}
