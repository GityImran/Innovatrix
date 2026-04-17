import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRentItem extends Document {
  sellerId: mongoose.Types.ObjectId;
  category: string;
  title: string;
  description: string;
  condition: "new" | "good" | "used";
  pricing: {
    day: number;
    week?: number;
    month?: number;
  };
  availability: {
    from: Date;
    till: Date;
  };
  securityDeposit?: number;
  images: string[];
  isUrgent: boolean;
  allowNegotiation: boolean;
  status: "active" | "rented" | "unavailable";
  createdAt: Date;
  updatedAt: Date;
}

const RentItemSchema = new Schema<IRentItem>(
  {
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    condition: { type: String, enum: ["new", "good", "used"], required: true },
    pricing: {
      day: { type: Number, required: true },
      week: { type: Number },
      month: { type: Number },
    },
    availability: {
      from: { type: Date, required: true },
      till: { type: Date, required: true },
    },
    securityDeposit: { type: Number },
    images: { type: [String], required: true },
    isUrgent: { type: Boolean, default: false },
    allowNegotiation: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "rented", "unavailable"],
      default: "active",
    },
  },
  { timestamps: true }
);

const RentItem: Model<IRentItem> =
  mongoose.models.RentItem ||
  mongoose.model<IRentItem>("RentItem", RentItemSchema);

export default RentItem;
