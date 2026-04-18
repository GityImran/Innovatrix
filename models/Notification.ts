import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userId: string;
  message: string;
  type: "request_offer" | "offer_accepted" | "offer_rejected";
  read: boolean;
  requestId?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: String, required: true },
    message: { type: String, required: true },
    type: { 
      type: String, 
      enum: ["request_offer", "offer_accepted", "offer_rejected"],
      required: true 
    },
    read: { type: Boolean, default: false },
    requestId: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);
