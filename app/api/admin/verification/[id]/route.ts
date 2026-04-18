import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import SellerRequest from "@/models/SellerRequest";
import User from "@/models/User";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { status } = await req.json();
    const { id } = await params;

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await connectToDatabase();

    const sellerRequest = await SellerRequest.findByIdAndUpdate(
      id,
      { status, reviewedAt: new Date() },
      { new: true }
    );

    if (!sellerRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (status === "approved") {
      await User.findByIdAndUpdate(sellerRequest.userId, { isVerified: true });
    }

    return NextResponse.json(sellerRequest);
  } catch (error) {
    console.error("Error updating verification status:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
