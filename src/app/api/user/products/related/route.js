// src/app/api/user/products/related/route.js
import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/DataBase/connectDB";
import Product from "../../../../../models/Product";
import Category from "../../../../../models/Category"; // Ensure model is registered

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const categoryId = searchParams.get("categoryId");

    if (!productId || !categoryId) {
      return NextResponse.json({ error: "Missing productId or categoryId" }, { status: 400 });
    }

    // Fetch up to 8 related products: same category, not blocked, not the current product
    const relatedProducts = await Product.find({
      _id: { $ne: productId },
      category: categoryId,
      blocked: false,
    })
      .populate({
        path: "category",
        select: "name",
        options: { strictPopulate: false },
      })
      .select("name price images productOffer unit status reviews")
      .limit(8)
      .lean();

    return NextResponse.json(relatedProducts);
  } catch (error) {
    console.error("❌ Related Products API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch related products", details: error.message },
      { status: 500 }
    );
  } 
}