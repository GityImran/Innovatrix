import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";
import { auth } from "@/lib/auth";

/**
 * PATCH /api/orders/:id
 *
 * Generic order update — scoped to cancellation only.
 *
 * The full Razorpay COD → UPI on delivery flow uses dedicated sub-routes:
 *   PATCH /api/orders/:id/start-delivery        → pending → out_for_delivery
 *   POST  /api/orders/:id/generate-payment-link → creates Razorpay payment link
 *   POST  /api/webhook/razorpay                 → sets status "paid" (Razorpay only)
 *   PATCH /api/orders/:id/complete              → paid → completed (marks item sold)
 *
 * Only "cancelled" is accepted here to prevent any client from bypassing
 * the payment verification gate.
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
