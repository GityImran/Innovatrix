import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Trade from "@/models/Trade";
import { auth } from "@/lib/auth";

interface RejectMeetingBody {
  tradeId: string;
}

/**
 * POST /api/trade/reject-meeting
 * Either participant can reject a pending proposal.
 * After rejection, either user may propose a new meeting time.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: RejectMeetingBody = await req.json();
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

    if (!trade.meetingDetails) {
      return NextResponse.json(
        { error: "No meeting proposed to reject" },
        { status: 400 }
      );
    }

    if (trade.meetingDetails.status === "accepted") {
      return NextResponse.json(
        { error: "Meeting already confirmed — cannot reject" },
        { status: 400 }
      );
    }

    trade.meetingDetails.status = "rejected";
    await trade.save();

    return NextResponse.json({ success: true, trade });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
