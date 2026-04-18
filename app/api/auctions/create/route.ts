import { NextRequest, NextResponse } from "next/server";
import Auction from "@/models/Auction";
import { connectToDatabase } from "@/lib/mongodb";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const body = await req.json();
    const {
      productTitle,
      description,
      category,
      condition,
      images,
      startingPrice,
      minIncrement,
      durationHours,
      reservePrice,
    } = body;

    if (!productTitle || !startingPrice || !minIncrement || !durationHours || !condition) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const endTime = new Date(Date.now() + durationHours * 60 * 60 * 1000);

    const auction = await Auction.create({
      productTitle,
      description,
      category,
      condition,
      images,
      sellerId: session.user.id,
      startingPrice,
      currentBid: startingPrice,
      minIncrement,
      reservePrice,
      endTime,
      status: "active",
    });

    return NextResponse.json(auction, { status: 201 });
  } catch (err: any) {
    console.error("Create Auction Error:", err);
    return NextResponse.json({ error: err.message || "Failed to create auction" }, { status: 500 });
  }
}
