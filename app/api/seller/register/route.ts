import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import SellerRequest from "@/models/SellerRequest";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    await connectToDatabase();

    // Check if a request already exists
    const existingRequest = await SellerRequest.findOne({ userId: session.user.id });
    if (existingRequest) {
      return NextResponse.json({ error: "Application already submitted" }, { status: 400 });
    }

    const newRequest = await SellerRequest.create({
      userId: session.user.id,
      ...data,
      status: "pending",
      appliedAt: new Date(),
    });

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error: any) {
    console.error("Seller registration error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit application" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const request = await SellerRequest.findOne({ userId: session.user.id });

    return NextResponse.json(request || { status: "none" });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch status" }, { status: 500 });
  }
}
