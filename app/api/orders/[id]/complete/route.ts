/**
 * app/api/orders/[id]/complete/route.ts
 *
 * PATCH /api/orders/:id/complete
 *
 * Transitions order status from "paid" → "completed".
 * Only callable by the seller — and ONLY when Razorpay webhook has already
 * confirmed payment (status === "paid").
 *
 * This is the final step: marks the item as sold/rented after physical delivery
 * and payment are both confirmed.
 *
 * Security:
 *   - NEVER allow completing an order that hasn't been confirmed PAID by Razorpay.
 *   - The "paid" status is set EXCLUSIVELY by the webhook handler.
 *   - This endpoint only checks DB state — it does NOT trust any frontend signal.
 */

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import RentItem from "@/models/RentItem";
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

    // Only the seller can mark delivery complete
    if (session.user.id !== order.sellerId.toString()) {
      return NextResponse.json(
        { error: "Only the seller can complete the order" },
        { status: 403 }
      );
    }

    /**
     * ⚠️  CRITICAL SECURITY CHECK:
     * Order must be "paid" — confirmed ONLY by Razorpay webhook.
     * This prevents a seller from manually completing an unpaid order.
     */
    if (order.status !== "paid") {
      return NextResponse.json(
        {
          error: `Order cannot be completed. Current status: "${order.status}". Payment must be confirmed first.`,
          hint: "The order status will be updated to 'paid' automatically once the buyer completes the UPI payment.",
        },
        { status: 409 }
      );
    }

    // Transition to completed
    order.status = "completed";
    await order.save();

    // Mark the item as sold or rented (same logic as existing /api/orders/[id])
    if (order.itemModel === "Product") {
      await Product.findByIdAndUpdate(order.itemId, { status: "sold" });
    } else if (order.itemModel === "RentItem") {
      await RentItem.findByIdAndUpdate(order.itemId, { status: "rented" });
    }

    return NextResponse.json({
      success: true,
      orderId: order._id,
      status: order.status,
      razorpayPaymentId: order.razorpayPaymentId,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
