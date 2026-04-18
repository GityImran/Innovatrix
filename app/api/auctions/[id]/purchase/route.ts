import { NextRequest, NextResponse } from "next/server";
import Auction from "@/models/Auction";
import CartItem from "@/models/Cart"; // Assuming CartItem model exists based on codebase search
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

    if (auction.status !== "ended") {
      // Auto-end if time passed but status not updated
      if (new Date() > auction.endTime) {
        auction.status = "ended";
        await auction.save();
      } else {
        return NextResponse.json({ error: "Auction is still active" }, { status: 400 });
      }
    }

    if (auction.highestBidderId?.toString() !== session.user.id) {
      return NextResponse.json({ error: "Only the winner can purchase this item" }, { status: 403 });
    }

    // Add to cart as an "Auction" type
    await CartItem.create({
      userId: session.user.id,
      itemId: auction._id,
      itemModel: "Auction",
    });

    return NextResponse.json({ success: true, message: "Added to cart" });
  } catch (err: any) {
    console.error("Auction Purchase Error:", err);
    return NextResponse.json({ error: err.message || "Failed to initiate purchase" }, { status: 500 });
  }
}
