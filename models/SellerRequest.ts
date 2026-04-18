import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISellerRequest extends Document {
  userId: mongoose.Types.ObjectId;
  // Section 1: Basic Details
  fullName: string;
  email: string;
  phoneNumber: string;

  // Section 2: College Details
  collegeName: string;
  course: "Engineering" | "Medical" | "BSc" | "BCA" | "BBA" | "Other";
  department?: string; // Conditional for Engineering/Medical
  studentStatus: "Current Student" | "Passout";
  yearBatch?: string;
  rollNumber?: string;
  idCardPhotoUrl: string;

  // Section 3: Payment Details
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;

  status: "pending" | "approved" | "rejected" | "disabled";
  appliedAt: Date;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SellerRequestSchema = new Schema<ISellerRequest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Only one request per user
    },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },

    collegeName: { type: String, required: true },
    course: {
      type: String,
      enum: ["Engineering", "Medical", "BSc", "BCA", "BBA", "Other"],
      required: true,
    },
    department: { type: String },
    studentStatus: {
      type: String,
      enum: ["Current Student", "Passout"],
      required: true,
    },
    yearBatch: { type: String },
    rollNumber: { type: String },
    idCardPhotoUrl: { type: String, required: true },

    accountHolderName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true },
    upiId: { type: String, required: true },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "disabled"],
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
