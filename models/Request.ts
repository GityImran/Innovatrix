import mongoose from "mongoose";

const RequestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    budget: { type: Number, required: true },
    condition: {
      type: String,
      enum: ["New", "Good", "Used"],
      required: true,
    },
    description: { type: String },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["open", "fulfilled", "closed"],
      default: "open",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Request ||
  mongoose.model("Request", RequestSchema);
