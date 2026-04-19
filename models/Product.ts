import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  sellerId: mongoose.Types.ObjectId;
  sellerDomain: string;
  college?: string;
  category: string;
  title: string;
  description: string;
  condition: "new" | "good" | "used";
  originalPrice?: number;
  expectedPrice: number;
  image: {
    url: string;
    public_id: string;
  };
  aiCondition?: {
    detected: string;
    mismatch: boolean;
    aiFailed: boolean;
  };
  isUrgent: boolean;
  isBundle: boolean;
  bundleTitle?: string;
  isTradeEnabled: boolean;
  tradePreferences?: string[];
  status: "active" | "draft" | "sold";
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sellerDomain: { type: String, default: "", index: true },
    college: { type: String, index: true },
    category: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    condition: { type: String, enum: ["new", "good", "used"], required: true },
    originalPrice: { type: Number },
    expectedPrice: { type: Number, required: true },
    image: {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    aiCondition: {
      detected: { type: String },
      mismatch: { type: Boolean, default: false },
      aiFailed: { type: Boolean, default: false },
    },
    isUrgent: { type: Boolean, default: false },
    isBundle: { type: Boolean, default: false },
    bundleTitle: { type: String },
    isTradeEnabled: { type: Boolean, default: false },
    tradePreferences: [{ type: String }],
    status: {
      type: String,
      enum: ["active", "draft", "sold"],
      default: "active",
    },
  },
  { timestamps: true }
);

// Compound index: domain + recency (for search query)
ProductSchema.index({ sellerDomain: 1, createdAt: -1 });

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
