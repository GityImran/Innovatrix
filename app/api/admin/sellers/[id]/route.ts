import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import SellerRequest from "@/models/SellerRequest";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { action } = await req.json();
    const { id } = await params;

    await connectToDatabase();

    if (action === "disable") {
      // Set isVerified to false in User model
      await User.findByIdAndUpdate(id, { isVerified: false });
      
      // Update the SellerRequest status to disabled
      await SellerRequest.findOneAndUpdate({ userId: id }, { status: "disabled" });

      return NextResponse.json({ message: "Seller disabled successfully" });
    }

    if (action === "enable") {
      await User.findByIdAndUpdate(id, { isVerified: true });
      await SellerRequest.findOneAndUpdate({ userId: id }, { status: "approved" });
      return NextResponse.json({ message: "Seller enabled successfully" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating seller status:", error);
    return NextResponse.json({ error: "Failed to update seller status" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const sellerRequest = await SellerRequest.findOne({ userId: id }).populate("userId", "name email isVerified");
    
    if (!sellerRequest) {
      return NextResponse.json({ error: "Seller info not found" }, { status: 404 });
    }

    return NextResponse.json(sellerRequest);
  } catch (error) {
    console.error("Error fetching seller details:", error);
    return NextResponse.json({ error: "Failed to fetch seller details" }, { status: 500 });
  }
}
