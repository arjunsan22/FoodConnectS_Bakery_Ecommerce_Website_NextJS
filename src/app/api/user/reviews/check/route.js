// GET /api/user/reviews/check?productId=...
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../api/auth/[...nextauth]/route";
import { connectDB } from "../../../../../lib/DataBase/connectDB";
import User from "../../../../../models/User";
import Order from "../../../../../models/Order";
import Product from "../../../../../models/Product";

export async function GET(request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId || !session?.user?.email) {
      return NextResponse.json({ canReview: false, hasReviewed: false });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ canReview: false, hasReviewed: false });
    }

    // Check if already reviewed
    const product = await Product.findById(productId);
    const hasReviewed = product?.reviews?.some(
      (r) => r.userId?.toString() === user._id.toString()
    );

    if (hasReviewed) {
      return NextResponse.json({ canReview: false, hasReviewed: true });
    }

    // Check if purchased and delivered
    const orderExists = await Order.exists({
      userId: user._id,
      "orderedItems.product": productId,
      status: "delivered",
    });

    return NextResponse.json({
      canReview: !!orderExists,
      hasReviewed: false,
    });
  } catch (error) {
    console.error("Review check error:", error);
    return NextResponse.json({ canReview: false, hasReviewed: false });
  }
}
