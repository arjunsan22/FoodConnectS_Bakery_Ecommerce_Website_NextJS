import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/DataBase/connectDB";
import Cart from "../../../../models/Cart";
import Product from "../../../../models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../api/auth/[...nextauth]/route"; // fecth users cart with products  & total

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Please login first" },
        { status: 401 }
      );
    }
    const userId = session.user.id;
    console.log("userId:", userId);

    await connectDB();
    const cart = await Cart.findOne({ userId })
      .populate({
        path: "items.product",
        select: "name price images quantity unit status",
        options: { strictPopulate: false },
      })
      .lean();

    if (!cart || cart.items.length == 0) {
      return NextResponse.json({ items: [], total: 0 });
    }
    let total = 0;
    const validItems = [];

    for (const item of cart.items) {
      const product = item.product;

      //skip if product doesnt exist
      if (
        !product ||
        product.status !== "available" ||
        product.quantity <= 0 ||
        product.blocked
      ) {
        continue;
      }
      const actualQty = Math.min(item.quantity, product.quantity);
      total += product.price * actualQty;
      validItems.push({
        ...item,
        quantity: actualQty,
        product: {
          _id: product._id,
          name: product.name,
          price: product.price,
          images: product.images,
          unit: product.unit,
          quantity: product.quantity,
          status: product.status,
        },
      });
    }
    return NextResponse.json({ items: validItems, total });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

// add product to cart

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Please login first" },
        { status: 401 }
      );
    }
    const userId = session.user.id;

    const { productId, quantity = 1 } = await request.json();

    await connectDB();

    // 1. Get product and validate
    const product = await Product.findById(productId).lean();
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // 2. Check product availability
    if (product.blocked || product.status !== "available") {
      return NextResponse.json(
        { error: "Product is not available for purchase" },
        { status: 400 }
      );
    }

    // 3. Get current cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // 4. Check existing item quantity
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );
    const currentQty = existingItem ? existingItem.quantity : 0;
    const newTotalQty = currentQty + quantity;

    // 5. Check if total quantity exceeds available stock
    if (newTotalQty > product.quantity) {
      return NextResponse.json(
        {
          error: "Cannot add more items",
          status: "OUT_OF_STOCK",
          availableQuantity: product.quantity,
          currentCartQty: currentQty,
          unit: product.unit,
        },
        { status: 400 }
      );
    }

    // 6. Update cart
    if (existingItem) {
      existingItem.quantity = newTotalQty;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();

    return NextResponse.json({
      success: true,
      message: "Added to cart",
      currentQuantity: newTotalQty,
    });
  } catch (error) {
    console.error("❌ Cart POST Error:", error);
    return NextResponse.json(
      { error: "Failed to add to cart" },
      { status: 500 }
    );
  }
}
//update product quantity

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "please login" }, { status: 401 });
    }
    const userId = session.user.id;
    const { productId, quantity } = await request.json();

    if (!productId || typeof quantity !== "number") {
      return NextResponse.json(
        { error: "Invalid product or quantity" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find user's cart
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    // Find the item in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return NextResponse.json({ error: "Item not in cart" }, { status: 404 });
    }

    // If quantity is 0 or less → remove item
    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
      await cart.save();
      return NextResponse.json({ success: true, message: "Item removed" });
    }

    // Validate product still exists and is available
    const product = await Product.findById(productId).lean();
    // Check if requested quantity exceeds available stock
    if (quantity > product.quantity) {
      return NextResponse.json(
        {
          error: "Out of stock",
          availableQuantity: product.quantity,
          unit: product.unit,
          status: "OUT_OF_STOCK",
        },
        { status: 400 }
      );
    }
    if (
      !product ||
      product.blocked ||
      product.status !== "available" ||
      product.quantity <= 0
    ) {
      // Remove invalid item from cart
      cart.items.splice(itemIndex, 1);
      await cart.save();
      return NextResponse.json(
        { error: "Product is no longer available", removed: true },
        { status: 400 }
      );
    }

    // Cap quantity at available stock
    const finalQty = Math.min(quantity, product.quantity);

    // Update quantity
    cart.items[itemIndex].quantity = finalQty;
    await cart.save();

    return NextResponse.json({ success: true, message: "Quantity updated" });
  } catch (error) {
    console.error("❌ Cart PUT Error:", error);
    return NextResponse.json(
      { error: "Failed to update cart", details: error.message },
      { status: 500 }
    );
  }
}

//remove product from cart

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Please login first" },
        { status: 401 }
      );
    }
    const userId = session.user.id;
    await connectDB();

    // Try to get productId from body if provided
    let productId;
    try {
      const body = await request.json();
      productId = body.productId;
    } catch (e) {
      // If no body provided, clear entire cart
      await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });
      return NextResponse.json({
        success: true,
        message: "Cart cleared successfully",
      });
    }

    // If productId provided, remove specific item
    if (productId) {
      const cart = await Cart.findOne({ userId });
      if (!cart) {
        return NextResponse.json({ error: "Cart not found" }, { status: 404 });
      }

      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex === -1) {
        return NextResponse.json(
          { error: "Product not found in cart" },
          { status: 404 }
        );
      }

      cart.items.splice(itemIndex, 1);
      await cart.save();

      return NextResponse.json({
        success: true,
        message: "Product removed from cart",
      });
    }

    // If no productId and no error catching body, clear cart
    await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });

    return NextResponse.json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("❌ Cart DELETE Error:", error);
    return NextResponse.json(
      { error: "Failed to modify cart", details: error.message },
      { status: 500 }
    );
  }
}
