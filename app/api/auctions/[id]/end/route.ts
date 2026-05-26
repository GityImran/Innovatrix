import { NextRequest, NextResponse } from "next/server";
import Auction from "@/models/Auction";
import Bid from "@/models/Bid";
import { connectToDatabase } from "@/lib/mongodb";
import { auth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const auction = await Auction.findById(id);

    if (!auction) {
      return NextResponse.json({ error: "Auction not found" }, { status: 404 });
    }

    // Only the seller can manually end the auction
    if (auction.sellerId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Only the seller can end this auction" },
        { status: 403 }
      );
    }

    if (auction.status === "ended") {
      return NextResponse.json(
        { error: "Auction is already ended" },
        { status: 400 }
      );
    }

    // Determine the highest bid and bidder
    const highestBid = await Bid.findOne({ auctionId: id })
      .sort({ amount: -1 });

    auction.status = "ended";
    if (highestBid) {
      auction.highestBidderId = highestBid.userId;
      auction.currentBid = highestBid.amount;
    }
    
    await auction.save();

    return NextResponse.json({ 
      success: true, 
      message: "Auction ended successfully",
      winner: highestBid ? highestBid.userId : null 
    });
  } catch (err: any) {
    console.error("End Auction Error:", err);
    return NextResponse.json({ error: err.message || "Failed to end auction" }, { status: 500 });
  }
}
