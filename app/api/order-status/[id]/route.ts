/**
 * app/api/order-status/[id]/route.ts
 *
 * GET /api/order-status/:id
 *
 * Returns the current payment + order status for an order.
 * Used by both buyer and seller for real-time status polling.
 *
 * Frontend can poll this every few seconds after the buyer scans the QR code
 * to detect when Razorpay's webhook has updated the status to "paid".
 *
 * Response:
 * {
 *   orderId: string,
 *   status: "pending" | "out_for_delivery" | "paid" | "completed" | "cancelled",
 *   paymentLinkId: string | null,
 *   razorpayPaymentId: string | null,
 *   totalAmount: number,
 *   updatedAt: Date
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";
import { auth } from "@/lib/auth";

export async function GET(
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

    const order = await Order.findById(id).select(
      "_id status paymentLinkId razorpayPaymentId totalAmount updatedAt buyerId sellerId"
    );

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only buyer or seller can view order status
    const userId = session.user.id;
    if (
      userId !== order.buyerId.toString() &&
      userId !== order.sellerId.toString()
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      orderId: order._id,
      status: order.status,
      paymentLinkId: order.paymentLinkId,
      /**
       * razorpayPaymentId is set ONLY after webhook confirms payment.
       * Frontend can use its presence as a secondary confirmation signal.
       */
      razorpayPaymentId: order.razorpayPaymentId,
      totalAmount: order.totalAmount,
      updatedAt: order.updatedAt,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
