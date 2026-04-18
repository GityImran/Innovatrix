import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";

/**
 * POST /api/orders/:id/confirm
 * Confirms a pending negotiated order, effectively "placing" it.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { paymentMethod } = await req.json();

    await connectToDatabase();

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only the buyer can confirm their negotiated order
    if (order.buyerId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!order.isNegotiated) {
      return NextResponse.json({ error: "This endpoint is for negotiated orders only" }, { status: 400 });
    }

    if (order.status !== "pending") {
      return NextResponse.json({ error: `Order is already ${order.status}` }, { status: 400 });
    }

    // Update payment method and keep status as pending (awaiting delivery/payment)
    order.paymentMethod = paymentMethod || "cod";
    await order.save();

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("Confirm Order Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
