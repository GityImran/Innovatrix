import mongoose, { Schema, Document } from "mongoose";

export interface IBid extends Document {
  auctionId: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

const BidSchema = new Schema<IBid>(
  {
    auctionId: { type: Schema.Types.ObjectId, ref: "Auction", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Bid || mongoose.model<IBid>("Bid", BidSchema);
