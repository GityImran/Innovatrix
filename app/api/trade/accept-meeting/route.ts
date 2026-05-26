import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Trade from "@/models/Trade";
import { auth } from "@/lib/auth";

interface AcceptMeetingBody {
  tradeId: string;
}

/**
 * POST /api/trade/accept-meeting
 * Any participant who has not yet accepted the current proposal can accept it.
 * When both participants have accepted → meetingDetails.status = "accepted"
 *   and trade.status advances to "scheduled".
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: AcceptMeetingBody = await req.json();
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
        { error: "No meeting has been proposed yet" },
        { status: 400 }
      );
    }

    if (trade.meetingDetails.status === "accepted") {
      return NextResponse.json(
        { error: "Meeting is already mutually confirmed" },
        { status: 400 }
      );
    }

    if (trade.meetingDetails.status === "rejected") {
      return NextResponse.json(
        { error: "This proposal was rejected. Please propose a new meeting." },
        { status: 400 }
      );
    }

    // Prevent duplicate acceptance
    if (trade.meetingDetails.acceptedBy.includes(userId)) {
      return NextResponse.json(
        { error: "You have already accepted this proposal" },
        { status: 400 }
      );
    }

    trade.meetingDetails.acceptedBy.push(userId);

    // Both participants have now accepted
    if (trade.meetingDetails.acceptedBy.length >= 2) {
      trade.meetingDetails.status = "accepted";
      trade.status = "scheduled";
    }

    await trade.save();

    return NextResponse.json({
      success: true,
      mutuallyAccepted: trade.meetingDetails.status === "accepted",
      trade,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
