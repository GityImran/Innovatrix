import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";
import { auth } from "@/lib/auth";

/**
 * GET /api/orders/:id
 * Fetches order details for checkout/cart.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const order = await Order.findById(id)
      .populate("itemId")
      .populate("sellerId", "name email");

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only buyer or seller can view order details
    if (
      session.user.id !== order.buyerId.toString() &&
      session.user.id !== order.sellerId.toString()
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("GET Order Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PATCH /api/orders/:id
 * Generic order update — scoped to cancellation only.
 */
const ALLOWED_STATUSES = ["cancelled"] as const;
type AllowedStatus = (typeof ALLOWED_STATUSES)[number];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    // Strict allowlist — only "cancelled" is permitted here
    if (!ALLOWED_STATUSES.includes(status as AllowedStatus)) {
      return NextResponse.json(
        {
          error: `Status "${status}" cannot be set via this endpoint.`,
          hint: "Use dedicated routes: /start-delivery, /generate-payment-link, /complete",
        },
        { status: 400 }
      );
    }

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only seller or buyer can cancel
    if (
      session.user.id !== order.sellerId.toString() &&
      session.user.id !== order.buyerId.toString()
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Cannot cancel after payment has been confirmed
    if (order.status === "paid" || order.status === "completed") {
      return NextResponse.json(
        { error: `Cannot cancel an order that is already "${order.status}"` },
        { status: 409 }
      );
    }

    order.status = "cancelled";
    await order.save();

    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
