import { NextResponse } from "next/server";
import Auction from "@/models/Auction";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectToDatabase();

    // Auto-end expired auctions before fetching
    const now = new Date();
    await Auction.updateMany(
      { status: "active", endTime: { $lt: now } },
      { $set: { status: "ended" } }
    );

    const auctions = await Auction.find({ status: "active" })
      .populate("sellerId", "name")
      .sort({ endTime: 1 }); // Show ending soonest first

    return NextResponse.json(auctions);
  } catch (err: any) {
    console.error("Fetch Auctions Error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch auctions" }, { status: 500 });
  }
}
