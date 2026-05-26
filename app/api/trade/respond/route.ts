import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Trade from "@/models/Trade";
import { auth } from "@/lib/auth";

interface RespondBody {
  tradeId: string;
  action: "accept" | "reject";
}

/**
 * POST /api/trade/respond
 * Only the product owner (ownerId) can accept or reject a pending trade.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: RespondBody = await req.json();
    const { tradeId, action } = body;

    if (!tradeId || !["accept", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "tradeId and action (accept | reject) are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const trade = await Trade.findById(tradeId);
    if (!trade) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    }

    // Only the owner of the requested product can respond
    if (trade.ownerId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Only the product owner can respond to this trade" },
        { status: 403 }
      );
    }

    if (trade.status !== "pending") {
      return NextResponse.json(
        { error: `Trade is already ${trade.status}` },
        { status: 400 }
      );
    }

    trade.status = action === "accept" ? "accepted" : "rejected";
    await trade.save();

    return NextResponse.json({ success: true, status: trade.status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
