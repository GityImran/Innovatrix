import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  message?: string;
  type: "text" | "offer" | "counter" | "system";
  offerData?: {
    price: number;
    status: "pending" | "accepted" | "rejected" | "countered";
    productId?: mongoose.Types.ObjectId;
    buyerId?: mongoose.Types.ObjectId;
    sellerId?: mongoose.Types.ObjectId;
  };
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
    },
    type: {
      type: String,
      enum: ["text", "offer", "counter", "system"],
      default: "text",
    },
    offerData: {
      price: { type: Number },
      status: {
        type: String,
        enum: ["pending", "accepted", "rejected", "countered"],
      },
      productId: { type: Schema.Types.ObjectId, ref: "Product" },
      buyerId: { type: Schema.Types.ObjectId, ref: "User" },
      sellerId: { type: Schema.Types.ObjectId, ref: "User" },
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Message: Model<IMessage> =
  mongoose.models.Message ||
  mongoose.model<IMessage>("Message", MessageSchema);

export default Message;
