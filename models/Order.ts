import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrder extends Document {
  buyerId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  itemId: mongoose.Types.ObjectId;
  itemModel: "Product" | "RentItem" | "Auction";
  orderType: "purchase" | "rent";
  totalAmount: number;
  /**
   * Status flow for COD → UPI on delivery:
   * pending → out_for_delivery → paid → completed
   * cancelled is a terminal state reachable from pending/out_for_delivery.
   */
  status: "pending" | "out_for_delivery" | "paid" | "completed" | "cancelled";
  paymentMethod: "cod" | "upi" | "online" | "cash";
  /** Razorpay Payment Link ID — set when seller generates the QR link */
  paymentLinkId: string | null;
  /** Razorpay Payment ID — set when the webhook confirms payment */
  razorpayPaymentId: string | null;
  isNegotiated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    itemId: { type: Schema.Types.ObjectId, required: true, refPath: "itemModel" },
    itemModel: {
      type: String,
      required: true,
      enum: ["Product", "RentItem", "Auction"],
    },
    orderType: {
      type: String,
      required: true,
      enum: ["purchase", "rent"],
    },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      // Extended for Razorpay COD → UPI on delivery flow
      enum: ["pending", "out_for_delivery", "paid", "completed", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "upi", "online", "cash"],
      default: "cod",
    },
    /** Razorpay Payment Link ID stored when seller generates QR at delivery */
    paymentLinkId: { type: String, default: null },
    /** Razorpay Payment ID stored when webhook confirms payment */
    razorpayPaymentId: { type: String, default: null },
    isNegotiated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
