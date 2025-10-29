// POST /api/user/reviews
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectDB } from "../../../../lib/DataBase/connectDB";
import Order from "../../../../models/Order";
import Product from "../../../../models/Product";
import User from "../../../../models/User";

export async function POST(request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to leave a review." },
        { status: 401 }
      );
    }

    const { productId, rating, comment } = await request.json();

    // Validate input
    if (!productId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Invalid input. Rating must be between 1 and 5." },
        { status: 400 }
      );
    }

    if (comment && comment.length > 600) {
      return NextResponse.json(
        { error: "Comment must be 600 characters or less." },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const userId = user._id;

    // 1. Check if user has purchased this product
    const order = await Order.findOne({
      userId: userId,
      "orderedItems.product": productId,
      status: "delivered", // Only allow reviews for delivered orders
    });

    if (!order) {
      return NextResponse.json(
        { error: "Please purchase and receive this product before reviewing." },
        { status: 403 }
      );
    }

    // 2. Check if user has already reviewed this product
    const existingReview = await Product.findOne({
      _id: productId,
      "reviews.userId": userId,
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this product." },
        { status: 409 }
      );
    }
    const U = await User.findById(userId).select("name");
    const userName = U?.name || "A Customer";
    // 3. Add the review
    const product = await Product.findByIdAndUpdate(
      productId,
      {
        $push: {
          reviews: {
            userId,
            userName,
            rating,
            comment: comment?.trim() || "",
            orderId: order._id,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!product) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Review submitted successfully!",
        review: product.reviews[product.reviews.length - 1],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Review submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit review. Please try again." },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to fetch reviews for a product
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required." },
        { status: 400 }
      );
    }

    const product = await Product.findById(productId)
      .populate("reviews.userId", "name email")
      .select("reviews");

    if (!product) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { reviews: product.reviews || [] },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch reviews error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews." },
      { status: 500 }
    );
  }
}
