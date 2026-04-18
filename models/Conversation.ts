import mongoose, { Schema, Document, Model } from "mongoose";

export interface IConversation extends Document {
  itemId: mongoose.Types.ObjectId;
  buyerId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  unreadCounts: Map<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    itemId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Map of userId -> number of unread messages for that user
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

const Conversation: Model<IConversation> =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>("Conversation", ConversationSchema);

export default Conversation;
