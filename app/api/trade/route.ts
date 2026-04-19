import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Trade from "@/models/Trade";
import { auth } from "@/lib/auth";

/**
 * GET /api/trade
 * Returns all trades where the current user is requester or owner.
 * Populates product titles/images and user names.
 */
export async function GET(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const userId = session.user.id;

    const trades = await Trade.find({
      $or: [{ requesterId: userId }, { ownerId: userId }],
    })
      .sort({ createdAt: -1 })
      .populate("requesterId", "name email")
      .populate("ownerId", "name email")
      .populate(
        "requestedProductId",
        "title image sellerId isTradeEnabled tradePreferences"
      )
      .populate("offeredProductIds", "title image expectedPrice");

    return NextResponse.json(trades);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
