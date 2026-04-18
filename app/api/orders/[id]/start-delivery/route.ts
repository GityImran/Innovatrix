/**
 * app/api/orders/[id]/start-delivery/route.ts
 *
 * PATCH /api/orders/:id/start-delivery
 *
 * Transitions order status from "pending" → "out_for_delivery".
 * Only the seller of the order can call this endpoint.
 *
 * Flow:
 *   Buyer places order (pending)
 *     → Seller picks up item and starts delivery
 *     → PATCH here → status: "out_for_delivery"
 *     → Seller then generates payment link at the door
 */

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";
import { auth } from "@/lib/auth";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only the seller can start delivery
    if (session.user.id !== order.sellerId.toString()) {
      return NextResponse.json(
        { error: "Only the seller can start delivery" },
        { status: 403 }
      );
    }

    // Only allow transition from "pending"
    if (order.status !== "pending") {
      return NextResponse.json(
        {
          error: `Cannot start delivery from status "${order.status}". Order must be "pending".`,
        },
        { status: 409 }
      );
    }

    order.status = "out_for_delivery";
    await order.save();

    return NextResponse.json({
      success: true,
      orderId: order._id,
      status: order.status,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
