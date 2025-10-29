import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/DataBase/connectDB";
import Order from "../../../../models/Order";
import Cart from "../../../../models/Cart";
import Product from "../../../../models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { v4 as uuidv4 } from "uuid";
import Address from "../../../../models/Address";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      address,
      paymentMethod,
      orderedItems,
      totalPrice,
      discount,
      finalAmount,
      deliveryDate,
    } = await request.json();

    await connectDB();

    // Validate items and check stock
    for (const item of orderedItems) {
      const product = await Product.findById(item.product);
      if (!product || product.quantity < item.quantity) {
        return NextResponse.json(
          {
            error: `⚠️ Oops! ${
              product?.name || "Product"
            } went out of stock during checkout`,
          },
          { status: 400 } // ✅ HTTP status in second argument
        );
      }
    }

    // Create order
    const order = new Order({
      orderId: uuidv4(),
      userId: session.user.id,
      address,
      paymentMethod,
      orderedItems,
      totalPrice,
      discount,
      finalAmount,
      deliveryDate,
      status: paymentMethod === "cod" ? "processing" : "payment_pending",
    });

    // Update product quantities
    for (const item of orderedItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { quantity: -item.quantity },
      });
    }

    await order.save();
    // Clear cart
    await Cart.findOneAndUpdate(
      { userId: session.user.id },
      { $set: { items: [] } }
    );
    return NextResponse.json(order);
  } catch (error) {
    console.error("❌ Order Creation Error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const orders = await Order.find({ userId: session.user.id })
      .sort({ createdAt: -1 }) // newest first
      .populate("address", "name houseNo streetMark place state pincode phone")
      .populate("orderedItems.product", "name price images")
      .lean();

    return NextResponse.json(orders);
  } catch (error) {
    console.error("❌ Fetch Orders Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
