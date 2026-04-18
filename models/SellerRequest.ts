import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISellerRequest extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  status: "pending" | "approved" | "rejected";
  appliedAt: Date;
  reviewedAt?: Date;
}

const SellerRequestSchema = new Schema<ISellerRequest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const SellerRequest: Model<ISellerRequest> =
  mongoose.models.SellerRequest ||
  mongoose.model<ISellerRequest>("SellerRequest", SellerRequestSchema);

export default SellerRequest;
