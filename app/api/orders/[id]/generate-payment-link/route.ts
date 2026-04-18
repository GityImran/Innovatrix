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
import { getRazorpayInstance } from "@/lib/razorpay";
import { auth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log("🚀 Razorpay API HIT");

  try {
    const { id } = await params;
    const session = await auth();

    console.log("🔑 ENV CHECK:", {
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET ? "EXISTS" : "MISSING",
    });

    // Step 3 — REQUEST DATA
    let body = {};
    try {
      body = await req.json();
      console.log("📥 Incoming Request Body:", body);
    } catch (e) {
      console.log("📥 No Request Body provided");
    }

    // Step 4 — SAFE ENV VALIDATION
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.warn("⚠️ Razorpay ENV missing");

      return NextResponse.json(
        { error: "Payment service unavailable" },
        { status: 503 }
      );
    }

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Step 5 — INITIALIZE RAZORPAY
    console.log("🔧 Initializing Razorpay...");
    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      console.warn("⚠️ Razorpay initialization failed (check keys)");
      return NextResponse.json(
        { error: "Payment service unavailable" },
        { status: 503 }
      );
    }
    console.log("✅ Razorpay initialized");

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
      console.log("ℹ️ Payment link already exists:", order.paymentLinkId);
      return NextResponse.json({
        success: true,
        message: "Payment link already exists",
        paymentLinkId: order.paymentLinkId,
      });
    }

    // Razorpay expects amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(order.totalAmount * 100);

    // Step 6 — CREATE ORDER (using Payment Link logic as per existing business logic)
    console.log("📦 Creating Razorpay Payment Link...", {
      amount: amountInPaise,
      currency: "INR",
      order_id: order._id.toString(),
    });

    const paymentLink = await razorpay.paymentLink.create({
      amount: amountInPaise,
      currency: "INR",
      accept_partial: false,
      description: `Payment for Order #${order._id} — Campus Marketplace`,
      customer: {
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
    } as any);

    console.log("✅ Payment Link Created:", paymentLink.id);

    // Store the Razorpay Payment Link ID for webhook lookup
    order.paymentLinkId = paymentLink.id;
    await order.save();

    // Step 7 — RESPONSE
    console.log("📤 Sending Response to Frontend:", {
      paymentLinkId: paymentLink.id,
      short_url: (paymentLink as any).short_url,
      orderId: order._id,
    });

    return NextResponse.json({
      success: true,
      paymentLinkId: paymentLink.id,
      short_url: (paymentLink as any).short_url,
      amount: order.totalAmount,
      orderId: order._id,
    });
  } catch (error: any) {
    // Step 8 — FULL ERROR TRACE
    console.error("❌ Razorpay FULL ERROR:", error);

    if (error instanceof Error) {
      console.error("❌ Error Message:", error.message);
      console.error("❌ Stack:", error.stack);
    }

    return NextResponse.json({ error: error.message || "Payment failed" }, { status: 500 });
  }
}
