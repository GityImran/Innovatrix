import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Trade from "@/models/Trade";
import { auth } from "@/lib/auth";

interface ScheduleBody {
  tradeId: string;
  place: string;
  time: string;
}

/**
 * POST /api/trade/schedule  (legacy — kept for backward compat)
 * Delegates to propose-meeting logic — auto-accepted by sole proposer for old UX.
 * New flows should use /api/trade/propose-meeting & /api/trade/accept-meeting.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: ScheduleBody = await req.json();
    const { tradeId, place, time } = body;

    if (!tradeId || !place?.trim() || !time?.trim()) {
      return NextResponse.json(
        { error: "tradeId, place, and time are required" },
        { status: 400 }
      );
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

    if (trade.status !== "accepted") {
      return NextResponse.json(
        { error: "Trade must be accepted before scheduling" },
        { status: 400 }
      );
    }

    if (trade.meetingDetails?.status === "accepted") {
      return NextResponse.json(
        { error: "Meeting already confirmed — no changes allowed" },
        { status: 400 }
      );
    }

    trade.meetingDetails = {
      proposedBy: userId,
      place: place.trim(),
      time: time.trim(),
      status: "pending",
      acceptedBy: [userId],
    };

    await trade.save();

    return NextResponse.json({ success: true, trade });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
