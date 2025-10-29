import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/DataBase/connectDB";
import User from "../../../../models/User";
import Address from "../../../../models/Address";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// GET all addresses
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const addresses = await Address.find({ userId: session.user.id }).lean();
    return NextResponse.json(addresses);
  } catch (error) {
    console.error("❌ Addresses GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch addresses" },
      { status: 500 }
    );
  }
}

// ADD new address
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const addressData = await request.json();

    await connectDB();
    const address = new Address({
      userId: session.user.id,
      ...addressData,
    });

    await address.save();
    return NextResponse.json(address);
  } catch (error) {
    console.error("❌ Address POST Error:", error);
    return NextResponse.json(
      { error: "Failed to add address" },
      { status: 500 }
    );
  }
}
