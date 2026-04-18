/**
 * app/api/webhook/razorpay/route.ts
 *
 * POST /api/webhook/razorpay
 *
 * ⚠️  CRITICAL: This endpoint receives payment confirmations from Razorpay.
 *     NEVER trust frontend for payment status — only trust this webhook.
 *
 * Security:
 *   - Verifies Razorpay HMAC-SHA256 signature on raw request body
 *   - Idempotent: silently skips if order already in "paid" state
 *   - All Razorpay keys are environment variables only
 *
 * Handled events:
 *   - payment_link.paid → mark order as PAID, store razorpay_payment_id
 *
 * Setup in Razorpay Dashboard (Test Mode):
 *   1. Go to Settings → Webhooks → Add Webhook
 *   2. URL: https://your-domain.com/api/webhook/razorpay
 *   3. Secret: set RAZORPAY_WEBHOOK_SECRET in .env to match
 *   4. Events: select "payment_link.paid"
 *
 * Local testing with ngrok:
 *   npx ngrok http 3000
 *   → Use the https ngrok URL as the webhook URL in Razorpay Dashboard
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

/**
 * Verifies the Razorpay webhook signature.
 *
 * Razorpay signs the raw request body with HMAC-SHA256 using the webhook secret.
 * We compute the same HMAC and compare — if they match, the request is genuine.
 *
 * IMPORTANT: We must read the raw body (not parsed JSON) for signature verification.
 * Next.js App Router provides the raw body via req.text() before any parsing.
 */
function verifyRazorpaySignature(rawBody: string, signature: string): boolean {
  if (!WEBHOOK_SECRET) {
    throw new Error("RAZORPAY_WEBHOOK_SECRET is not configured");
  }

  const expectedSignature = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  // Use timingSafeEqual to prevent timing attacks
  const expectedBuffer = Buffer.from(expectedSignature, "utf-8");
  const receivedBuffer = Buffer.from(signature, "utf-8");

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

export async function POST(req: NextRequest) {
  try {
    // Step 1: Read raw body (required for HMAC verification)
    const rawBody = await req.text();

    // Step 2: Extract Razorpay signature from headers
    const razorpaySignature = req.headers.get("x-razorpay-signature");

    if (!razorpaySignature) {
      return NextResponse.json(
        { error: "Missing Razorpay signature" },
        { status: 400 }
      );
    }

    // Step 3: Verify HMAC-SHA256 signature — REJECT if invalid
    const isValid = verifyRazorpaySignature(rawBody, razorpaySignature);
    if (!isValid) {
      console.error("[Razorpay Webhook] ❌ Invalid signature — request rejected");
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    // Step 4: Parse the verified payload
    const payload = JSON.parse(rawBody);
    const event = payload.event as string;

    console.log(`[Razorpay Webhook] ✅ Verified event: ${event}`);

    // Step 5: Handle events
    if (event === "payment_link.paid") {
      await handlePaymentLinkPaid(payload);
    } else {
      // Log unhandled events but still respond 200 so Razorpay doesn't retry
      console.log(`[Razorpay Webhook] ℹ️  Unhandled event: ${event}`);
    }

    // Always respond 200 to acknowledge receipt
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error("[Razorpay Webhook] Error:", error.message);
    // Return 500 — Razorpay will retry failed webhooks
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Handles "payment_link.paid" event.
 *
 * Payload shape (abridged):
 * {
 *   event: "payment_link.paid",
 *   payload: {
 *     payment_link: { entity: { id: "plink_xxx", ... } },
 *     payment:      { entity: { id: "pay_xxx", amount: 50000, ... } }
 *   }
 * }
 */
async function handlePaymentLinkPaid(webhookPayload: any) {
  const paymentLinkEntity = webhookPayload?.payload?.payment_link?.entity;
  const paymentEntity = webhookPayload?.payload?.payment?.entity;

  if (!paymentLinkEntity || !paymentEntity) {
    console.error("[Razorpay Webhook] Missing payment_link or payment entity in payload");
    return;
  }

  const paymentLinkId: string = paymentLinkEntity.id;
  const razorpayPaymentId: string = paymentEntity.id;
  const paymentStatus: string = paymentLinkEntity.status; // "paid"

  if (paymentStatus !== "paid") {
    console.log(`[Razorpay Webhook] Payment link not yet paid (status: ${paymentStatus}), skipping`);
    return;
  }

  await connectToDatabase();

  // Find order by the payment link ID stored at generation time
  const order = await Order.findOne({ paymentLinkId });

  if (!order) {
    console.error(`[Razorpay Webhook] No order found for paymentLinkId: ${paymentLinkId}`);
    return;
  }

  // Idempotency guard: if already marked paid/completed, skip silently
  if (order.status === "paid" || order.status === "completed") {
    console.log(`[Razorpay Webhook] ℹ️  Order ${order._id} already in status "${order.status}", skipping duplicate event`);
    return;
  }

  // Update order: mark paid and record Razorpay payment ID
  order.status = "paid";
  order.razorpayPaymentId = razorpayPaymentId;
  await order.save();

  console.log(
    `[Razorpay Webhook] ✅ Order ${order._id} marked PAID | razorpay_payment_id: ${razorpayPaymentId}`
  );

  // Optional: emit Socket.io event for real-time status update
  // import { getIO } from "@/server"; // if you expose socket.io from server.js
  // getIO().to(order.buyerId.toString()).emit("order:paid", { orderId: order._id });
}
