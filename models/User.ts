/**
 * models/User.ts
 * Mongoose User schema for the campus circular economy platform.
 * Fields: name, email (unique college email), password (bcrypt-hashed), createdAt
 */

import mongoose, { Schema, Document, Model } from "mongoose";

/* ------------------------------------------------------------------ */
// TypeScript interface for a User document
/* ------------------------------------------------------------------ */
export interface IUser extends Document {
  name: string;
  email: string;       // College email — must be unique
  college: string;     // Must be from the approved list
  password: string;    // Stored as bcrypt hash — NEVER plain text
  isVerified: boolean; // Added for admin verification
  superCoins: number;  // Coins earned from purchases
  createdAt: Date;
  updatedAt: Date;
}

/* ------------------------------------------------------------------ */
// Schema Definition
/* ------------------------------------------------------------------ */
const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "College email is required"],
      unique: true,                    // Prevents duplicate registrations
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
    college: {
      type: String,
      required: [true, "College name is required"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    superCoins: {
      type: Number,
      default: 0,
    },
  },
  {
    // Automatically adds `createdAt` and `updatedAt` fields
    timestamps: true,
  }
);

/* ------------------------------------------------------------------ */
// Prevent model re-compilation during Next.js hot-reload
/* ------------------------------------------------------------------ */
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
