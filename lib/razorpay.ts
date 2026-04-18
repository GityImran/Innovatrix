/**
 * lib/razorpay.ts
 * Razorpay Node SDK singleton.
 *
 * Usage:
 *   import { razorpay } from "@/lib/razorpay";
 *   const link = await razorpay.paymentLink.create({ ... });
 *
 * Keys come from .env:
 *   RAZORPAY_KEY_ID     — rzp_test_xxxxx  (use test keys in development)
 *   RAZORPAY_KEY_SECRET — your webhook-signing secret
 */

import Razorpay from "razorpay";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  throw new Error(
    "Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET environment variables."
  );
}

/**
 * Singleton instance — reused across hot-reloads in dev mode
 * via the global cache pattern (same as lib/mongodb.ts).
 */
declare global {
  // eslint-disable-next-line no-var
  var _razorpayInstance: Razorpay | undefined;
}

export const razorpay: Razorpay =
  global._razorpayInstance ??
  (global._razorpayInstance = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  }));
