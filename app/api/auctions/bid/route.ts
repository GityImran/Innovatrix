import { NextRequest, NextResponse } from "next/server";
import Auction from "@/models/Auction";
import Bid from "@/models/Bid";
import { connectToDatabase } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { getIO } from "@/lib/socket";

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

    const auction = await Auction.findById(auctionId).populate("sellerId", "name");

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
      return NextResponse.json({ error: "You cannot bid on your own auction" }, { status: 403 });
    }

    // 2. Rule: No consecutive bids by same user
    const lastBid = await Bid.findOne({ auctionId }).sort({ createdAt: -1 });
    if (lastBid && lastBid.userId.toString() === session.user.id) {
      return NextResponse.json(
        { error: "You already have the highest bid. Wait for another bidder." },
        { status: 400 }
      );
    }

    const minAllowed = auction.currentBid + auction.minIncrement;

    if (amount < minAllowed) {
      return NextResponse.json(
        { error: `Minimum bid must be ₹${minAllowed}` },
        { status: 400 }
      );
    }

    // Save bid
    const newBid = await Bid.create({
      auctionId,
      userId: session.user.id,
      amount,
    });

    const populatedBid = await Bid.findById(newBid._id).populate("userId", "name");

    // 4. Update auction current bid and highest bidder
    auction.currentBid = amount;
    auction.highestBidderId = session.user.id;
    await auction.save();

    // 5. Emit real-time update
    const io = getIO();
    if (io) {
      io.to(`auction:${auctionId}`).emit("newBid", {
        auctionId,
        amount,
        highestBidderId: session.user.id,
        highestBidderName: session.user.name,
        newBid: populatedBid,
        auction: auction,
      });
    }

    return NextResponse.json({ success: true, currentBid: amount }, { status: 201 });
  } catch (err: any) {
    console.error("Place Bid Error:", err);
    return NextResponse.json({ error: err.message || "Failed to place bid" }, { status: 500 });
  }
}
