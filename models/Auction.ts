import mongoose, { Schema, Document } from "mongoose";

export interface IAuction extends Document {
  productTitle: string;
  description: string;
  category: string;
  condition: "New" | "Good" | "Used";
  images: string[];

  sellerId: mongoose.Schema.Types.ObjectId;

  startingPrice: number;
  currentBid: number;
  highestBidderId?: mongoose.Schema.Types.ObjectId;

  minIncrement: number;
  reservePrice?: number;

  endTime: Date;
  status: "active" | "ended";

  createdAt: Date;
  updatedAt: Date;
}

const AuctionSchema = new Schema<IAuction>(
  {
    productTitle: { type: String, required: true },
    description: String,
    category: String,
    condition: { type: String, enum: ["New", "Good", "Used"], required: true },
    images: [String],

    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    startingPrice: { type: Number, required: true },
    currentBid: { type: Number, required: true },
    highestBidderId: { type: Schema.Types.ObjectId, ref: "User" },

    minIncrement: { type: Number, required: true },
    reservePrice: Number,

    endTime: { type: Date, required: true },
    status: { type: String, enum: ["active", "ended"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.models.Auction || mongoose.model<IAuction>("Auction", AuctionSchema);
