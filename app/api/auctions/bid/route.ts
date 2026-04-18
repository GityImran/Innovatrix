import { NextRequest, NextResponse } from "next/server";
import Auction from "@/models/Auction";
import Bid from "@/models/Bid";
import { connectToDatabase } from "@/lib/mongodb";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { auctionId, amount } = await req.json();

    if (!auctionId || !amount) {
      return NextResponse.json({ error: "Auction ID and amount are required" }, { status: 400 });
    }

    const auction = await Auction.findById(auctionId);

    if (!auction) {
      return NextResponse.json({ error: "Auction not found" }, { status: 404 });
    }

    if (auction.status !== "active") {
      return NextResponse.json({ error: "Auction has already ended" }, { status: 400 });
    }

    if (new Date() > auction.endTime) {
      auction.status = "ended";
      await auction.save();
      return NextResponse.json({ error: "Auction has expired" }, { status: 400 });
    }

    if (auction.sellerId.toString() === session.user.id) {
      return NextResponse.json({ error: "You cannot bid on your own auction" }, { status: 400 });
    }

    const minAllowed = auction.currentBid + auction.minIncrement;

    if (amount < minAllowed) {
      return NextResponse.json(
        { error: `Minimum bid must be ₹${minAllowed}` },
        { status: 400 }
      );
    }

    // Save bid
    await Bid.create({
      auctionId,
      userId: session.user.id,
      amount,
    });

    // Update auction
    auction.currentBid = amount;
    auction.highestBidderId = session.user.id;

    await auction.save();

    return NextResponse.json({ success: true, currentBid: amount });
  } catch (err: any) {
    console.error("Place Bid Error:", err);
    return NextResponse.json({ error: err.message || "Failed to place bid" }, { status: 500 });
  }
}
