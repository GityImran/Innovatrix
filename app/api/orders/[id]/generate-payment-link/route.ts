/**
 * app/api/orders/[id]/generate-payment-link/route.ts
 *
 * POST /api/orders/:id/generate-payment-link
 *
 * Creates a Razorpay Payment Link for a COD order at the point of delivery.
 * The seller calls this when they're at the buyer's door.
 *
 * Flow:
 *   1. Verify seller is authenticated and owns this order
 *   2. Confirm order is in "out_for_delivery" status
 *   3. Create Razorpay Payment Link (amount in paise)
 *   4. Store payment_link_id in DB
 *   5. Return short_url — seller shows this as QR to buyer
 *
 * TEST MODE:
 *   Using rzp_test_* keys automatically enables Razorpay sandbox.
 *   No real money is transferred. Test UPI ID: success@razorpay
 */

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";
import { razorpay } from "@/lib/razorpay";
import { auth } from "@/lib/auth";

export async function POST(
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

    // Only the seller generates the payment link
    if (session.user.id !== order.sellerId.toString()) {
      return NextResponse.json(
        { error: "Only the seller can generate a payment link" },
        { status: 403 }
      );
    }

    // Must be out for delivery before generating link
    if (order.status !== "out_for_delivery") {
      return NextResponse.json(
        {
          error: `Order must be "out_for_delivery" to generate a payment link. Current: "${order.status}"`,
        },
        { status: 409 }
      );
    }

    // Idempotency: if a link was already generated, return it
    if (order.paymentLinkId) {
      return NextResponse.json({
        success: true,
        message: "Payment link already exists",
        paymentLinkId: order.paymentLinkId,
        // Note: We cannot retrieve short_url again from stored ID without an API call.
        // The seller should save the original short_url from the first call.
      });
    }

    // Razorpay expects amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(order.totalAmount * 100);

    /**
     * Create Razorpay Payment Link
     * Docs: https://razorpay.com/docs/payments/payment-links/apis/create/
     *
     * TEST: Use UPI ID "success@razorpay" to simulate a successful payment.
     * The webhook will fire a "payment_link.paid" event automatically in test mode.
     */
    const paymentLink = await razorpay.paymentLink.create({
      amount: amountInPaise,
      currency: "INR",
      accept_partial: false,
      description: `Payment for Order #${order._id} — Campus Marketplace`,
      customer: {
        // Seller provides buyer's contact at delivery time
        // These can be left blank for anonymous UPI QR payments
        name: "Campus Buyer",
        email: "buyer@campus.com",
      },
      notify: {
        sms: false,
        email: false,
      },
      reminder_enable: false,
      notes: {
        order_id: order._id.toString(),
        seller_id: order.sellerId.toString(),
      },
      // Webhook will fire "payment_link.paid" upon payment
    } as any);

    // Store the Razorpay Payment Link ID for webhook lookup
    order.paymentLinkId = paymentLink.id;
    await order.save();

    return NextResponse.json({
      success: true,
      paymentLinkId: paymentLink.id,
      /**
       * short_url: The URL/QR code to show the buyer.
       * In test mode: opens Razorpay checkout in sandbox.
       * Seller can display this as a QR code using any QR library.
       */
      short_url: (paymentLink as any).short_url,
      amount: order.totalAmount,
      orderId: order._id,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
