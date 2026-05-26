import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Trade from "@/models/Trade";
import Product from "@/models/Product";
import { auth } from "@/lib/auth";

interface CompleteBody {
  tradeId: string;
}

/**
 * POST /api/trade/complete
 * Either party can mark a scheduled trade as completed.
 * Marks all involved products as "sold" to remove them from the marketplace.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CompleteBody = await req.json();
    const { tradeId } = body;

    if (!tradeId) {
      return NextResponse.json({ error: "tradeId is required" }, { status: 400 });
    }

    await connectToDatabase();

    const trade = await Trade.findById(tradeId);
    if (!trade) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    }

    const userId = session.user.id;
    const isParticipant =
      trade.requesterId.toString() === userId ||
      trade.ownerId.toString() === userId;

    if (!isParticipant) {
      return NextResponse.json(
        { error: "You are not a participant in this trade" },
        { status: 403 }
      );
    }

    if (trade.status !== "scheduled") {
      return NextResponse.json(
        { error: "Trade must be scheduled before it can be completed" },
        { status: 400 }
      );
    }

    trade.status = "completed";
    await trade.save();

    // Mark all traded products as sold so they disappear from listings
    await Product.findByIdAndUpdate(trade.requestedProductId, { status: "sold" });
    await Product.updateMany(
      { _id: { $in: trade.offeredProductIds } },
      { status: "sold" }
    );

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
