import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICartItem extends Document {
  userId: mongoose.Types.ObjectId;
  itemId: mongoose.Types.ObjectId;
  itemModel: "Product" | "RentItem";
  addedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    itemId: { type: Schema.Types.ObjectId, required: true, refPath: "itemModel" },
    itemModel: {
      type: String,
      required: true,
      enum: ["Product", "RentItem"],
    },
    addedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Unique index to prevent same item being added to cart twice by same user
CartItemSchema.index({ userId: 1, itemId: 1 }, { unique: true });

const CartItem: Model<ICartItem> =
  mongoose.models.CartItem || mongoose.model<ICartItem>("CartItem", CartItemSchema);

export default CartItem;
