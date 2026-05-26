import mongoose, { Schema, Document, Model } from "mongoose";

export type MeetingStatus = "pending" | "accepted" | "rejected";

export interface IMeetingDetails {
  proposedBy: string;
  place: string;
  time: string;
  status: MeetingStatus;
  acceptedBy: string[];
}

export type TradeStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "scheduled"
  | "completed";

export interface ITrade extends Document {
  requesterId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  requestedProductId: mongoose.Types.ObjectId;
  offeredProductIds: mongoose.Types.ObjectId[];
  cashOffered: number;
  status: TradeStatus;
  meetingDetails?: IMeetingDetails;
  createdAt: Date;
  updatedAt: Date;
}

const TradeSchema = new Schema<ITrade>(
  {
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requestedProductId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    offeredProductIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
    ],
    cashOffered: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "scheduled", "completed"],
      default: "pending",
    },
    meetingDetails: {
      proposedBy:  { type: String },
      place:       { type: String },
      time:        { type: String },
      status:      { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
      acceptedBy:  [{ type: String }],
    },
  },
  { timestamps: true }
);

// Prevent duplicate pending trades for the same product pair
TradeSchema.index(
  { requesterId: 1, requestedProductId: 1, status: 1 },
  { sparse: true }
);

const Trade: Model<ITrade> =
  mongoose.models.Trade || mongoose.model<ITrade>("Trade", TradeSchema);

export default Trade;
