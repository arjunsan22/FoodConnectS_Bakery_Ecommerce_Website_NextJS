import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/DataBase/connectDB";
import User from "../../../../models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import cloudinary from "../../../../lib/Cloudinary";

// GET user profile
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.user.id)
      .select("name email phone userImage")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("❌ Profile GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// UPDATE user profile
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, phone, userImage } = await request.json();

    await connectDB();
    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update basic fields
    if (name) user.name = name;
    if (phone) user.phone = phone;

    // Handle image upload
    if (userImage && userImage.startsWith("data:image")) {
      try {
        // Upload to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(userImage, {
          folder: "foodconnect/users",
          public_id: `user_${user._id}`,
          overwrite: true,
          transformation: [
            { width: 400, height: 400, crop: "fill" },
            { quality: "auto" },
            { fetch_format: "auto" },
          ],
        });
        console.log('Upload response:', uploadResponse);
        user.userImage = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload image" },
          { status: 500 }
        );
      }
    }

    await user.save();

    return NextResponse.json({
      name: user.name,
      email: user.email,
      phone: user.phone,
      userImage: user.userImage,
    });
  } catch (error) {
    console.error("❌ Profile PUT Error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
