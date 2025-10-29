// api/admin/orders/route.js
import { NextResponse } from "next/server";
import Order from "../../../../models/Order";
import { connectDB } from "../../../../lib/DataBase/connectDB";

export async function GET() {
  try {
    await connectDB();

    const orders = await Order.find({})
      .sort({ createdAt: -1 }) // Newest first
      .populate({
        path: "userId",
        select: "name email phone",
      })
      .populate({
        path: "address",
        select: "name houseNo streetMark place state pincode phone",
      })
      .populate({
        path: "orderedItems.product",
        select: "name price images",
      })
      .lean();

    return NextResponse.json(orders);
  } catch (error) {
    console.error("❌ Admin Fetch Orders Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  try {
    await connectDB();

    const { orderId, status } = await req.json();
    console.log("orderId", orderId);
    const validStatuses = [
      "pending",
      "processing",
      "shipping",
      "delivered",
      "cancelled",
      "returned",
      "payment_pending",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { orderId },
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("❌ Update Order Status Error:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}
