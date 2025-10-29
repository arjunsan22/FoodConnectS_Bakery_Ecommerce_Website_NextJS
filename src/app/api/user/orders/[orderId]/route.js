import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/DataBase/connectDB";
import Order from "../../../../../models/Order";
import Product from "../../../../../models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

const MAX_CANCELLATION_MINUTES = 15;

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { orderId } = resolvedParams;
    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    await connectDB();

    const order = await Order.findOne({ orderId, userId: session.user.id })
      .populate("address")
      .populate("orderedItems.product")
      .lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("❌ Order GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = params;
    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const body = await request.json();
    const { itemId, cancellationReason = "No reason provided" } = body;

    if (!itemId) {
      return NextResponse.json(
        { error: "itemId is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Fetch order WITHOUT lean() so we can save changes
    const order = await Order.findOne({ orderId, userId: session.user.id });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Prevent cancellation if order is already delivered or fully cancelled
    if (["delivered", "cancelled"].includes(order.status)) {
      return NextResponse.json(
        { error: "Cannot cancel items in a delivered or cancelled order" },
        { status: 400 }
      );
    }

    // Check 15-minute window
    const orderTime = new Date(order.createdAt).getTime();
    const now = Date.now();
    const minutesElapsed = (now - orderTime) / (60 * 1000);
    if (minutesElapsed > MAX_CANCELLATION_MINUTES) {
      return NextResponse.json(
        {
          error: `Cancellation is only allowed within ${MAX_CANCELLATION_MINUTES} minutes of order placement`,
        },
        { status: 400 }
      );
    }

    // Find the specific item in orderedItems
    const item = order.orderedItems.id(itemId);
    if (!item) {
      return NextResponse.json(
        { error: "Item not found in this order" },
        { status: 404 }
      );
    }

    if (item.status === "cancelled") {
      return NextResponse.json(
        { error: "Item is already cancelled" },
        { status: 400 }
      );
    }

    // ✅ CANCEL THE ITEM
    item.status = "cancelled";
    item.cancelledAt = new Date();
    item.cancellationReason = cancellationReason;

    // 🔥 Tell Mongoose nested array was modified
    order.markModified("orderedItems");

    // ✅ RESTORE PRODUCT STOCK
    const product = await Product.findById(item.product);
    if (product) {
      product.quantity += item.quantity;
      // Optional: update product status if it was 'not-available' and now back in stock
      await product.save();
    } else {
      console.warn(
        `⚠️ Product ${item.product} not found – could not restore stock`
      );
    }

    // ✅ Recalculate finalAmount
    const totalCancelledValue = order.orderedItems
      .filter((i) => i.status === "cancelled")
      .reduce((sum, i) => sum + i.quantity * i.price, 0);

    order.finalAmount = Math.max(
      0,
      order.totalPrice - totalCancelledValue - (order.discount || 0)
    );

    // ✅ Update overall order status if ALL items are cancelled
    const activeItems = order.orderedItems.filter(
      (i) => i.status !== "cancelled"
    );
    if (activeItems.length === 0) {
      order.status = "cancelled";
    }

    await order.save();

    // Return updated order (lean for clean JSON)
    const updatedOrder = await Order.findOne({ orderId })
      .populate("address")
      .populate("orderedItems.product")
      .lean();

    return NextResponse.json({
      success: true,
      message:
        "Item cancelled successfully.  💸 Refund will be credited to your bank account within 24 hours.",
      updatedOrder,
    });
  } catch (error) {
    console.error("❌ Cancel Item POST Error:", error);
    return NextResponse.json(
      { error: "Failed to cancel item" },
      { status: 500 }
    );
  }
}
