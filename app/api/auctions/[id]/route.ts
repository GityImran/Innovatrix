import { NextRequest, NextResponse } from "next/server";
import Auction from "@/models/Auction";
import Bid from "@/models/Bid";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const auction = await Auction.findById(id)
      .populate("sellerId", "name")
      .populate("highestBidderId", "name");

    if (!auction) {
      return NextResponse.json({ error: "Auction not found" }, { status: 404 });
    }

    // Auto-end if expired
    if (auction.status === "active" && new Date() > auction.endTime) {
      auction.status = "ended";
      await auction.save();
    }

    const bids = await Bid.find({ auctionId: id })
      .populate("userId", "name")
      .sort({ amount: -1 })
      .limit(10);

    return NextResponse.json({ auction, bids });
  } catch (err: any) {
    console.error("Fetch Auction Detail Error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch auction details" }, { status: 500 });
  }
}
