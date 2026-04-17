import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrder extends Document {
  buyerId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  itemId: mongoose.Types.ObjectId;
  itemModel: "Product" | "RentItem";
  orderType: "purchase" | "rent";
  totalAmount: number;
  status: "pending" | "completed" | "cancelled";
  paymentMethod: string;
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
      enum: ["Product", "RentItem"],
    },
    orderType: {
      type: String,
      required: true,
      enum: ["purchase", "rent"],
    },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
    paymentMethod: { type: String, default: "cash" },
  },
  { timestamps: true }
);

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
