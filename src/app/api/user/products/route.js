// src/app/api/user/products/route.js
import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/DataBase/connectDB";
import Product from "../../../../models/Product";
import Category from "../../../../models/Category";
import User from "../../../../models/User";

export async function GET(request) {
  try {
    await connectDB();
    User;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const ids = searchParams.get("ids");
    let products;
    const baseQuery = Product.find({ blocked: false })
      .populate({
        path: "category",
        select: "name",
        options: { strictPopulate: false },
      })
      .populate({
        path: "reviews.userId",
        select: "name email",
        options: { strictPopulate: false },
      })
      .select(
        "name price description images productOffer createdAt unit quantity status reviews"
      );

    if (ids) {
      const idArray = ids.split(",");
      // ❌ Removed .lean()
      products = await baseQuery.clone().where("_id").in(idArray);
    } else if (id) {
      // ❌ Removed .lean()
      products = await Product.findById(id)
        .populate({
          path: "category",
          select: "name",
          options: { strictPopulate: false },
        })
        .populate({
          path: "reviews.userId",
          select: "name email ",
          options: { strictPopulate: false },
        })
        .select(
          "name price description images productOffer createdAt unit quantity status reviews"
        );
      products = products ? [products] : [];
    } else {
      // ❌ Removed .lean()
      products = await baseQuery;
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error("❌ Products API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products", details: error.message },
      { status: 500 }
    );
  }
}
