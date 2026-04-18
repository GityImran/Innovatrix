import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";

/**
 * POST /api/orders/create-from-negotiation
 * Creates a pending order from an accepted negotiation offer.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, price, sellerId } = await req.json();

    if (!productId || !price || !sellerId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();

    // Verify the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Create the negotiated order
    const order = await Order.create({
      buyerId: session.user.id,
      sellerId,
      itemId: productId,
      itemModel: "Product",
      orderType: "purchase",
      totalAmount: price,
      status: "pending",
      paymentMethod: "cod", // Default for negotiated deals
      isNegotiated: true,
    });

    return NextResponse.json({ orderId: order._id });
  } catch (error: any) {
    console.error("Create Negotiated Order Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
