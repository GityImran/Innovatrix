/**
 * app/api/register/route.ts
 * User registration API endpoint.
 *
 * POST /api/register
 * Body: { name, email, password }
 *
 * Steps:
 *  1. Validate input fields
 *  2. Connect to MongoDB
 *  3. Check if email is already registered
 *  4. Hash password with bcrypt (cost factor 12)
 *  5. Save new user to DB
 *  6. Return success (never return the password)
 */

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, college, password } = body;

    /* -------------------------------------------------------------- */
    // 1. Input Validation
    /* -------------------------------------------------------------- */
    if (!name || !email || !college || !password) {
      return NextResponse.json(
        { error: "Name, email, college and password are required" },
        { status: 400 }
      );
    }

    if (name.trim().length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters" },
        { status: 400 }
      );
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid college email address" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    /* -------------------------------------------------------------- */
    // 2. Connect to MongoDB
    /* -------------------------------------------------------------- */
    await connectToDatabase();

    /* -------------------------------------------------------------- */
    // 3. Check for duplicate email
    /* -------------------------------------------------------------- */
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 } // 409 Conflict
      );
    }

    /* -------------------------------------------------------------- */
    // 4. Hash password (cost factor 12 for production-grade security)
    /* -------------------------------------------------------------- */
    const hashedPassword = await bcrypt.hash(password, 12);

    /* -------------------------------------------------------------- */
    // 5. Create and save user
    /* -------------------------------------------------------------- */
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      college: college.trim(),
      password: hashedPassword,
    });

    /* -------------------------------------------------------------- */
    // 6. Return success — exclude password from response
    /* -------------------------------------------------------------- */
    return NextResponse.json(
      {
        message: "Account created successfully! You can now log in.",
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          college: newUser.college,
          createdAt: newUser.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("[REGISTER ERROR]", error);

    // Handle Mongoose duplicate key error (race condition)
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
