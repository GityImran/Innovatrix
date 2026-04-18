import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Request from "@/models/Request";
import RequestResponse from "@/models/RequestResponse";
import Notification from "@/models/Notification";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ responseId: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { responseId } = await params;
    await connectToDatabase();

    const response = await RequestResponse.findById(responseId);
    if (!response) {
      return NextResponse.json({ error: "Response not found" }, { status: 404 });
    }

    const request = await Request.findById(response.requestId);
    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Only the request owner can reject responses
    if (request.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Only the request owner can reject offers" },
        { status: 403 }
      );
    }

    if (response.status !== "pending") {
      return NextResponse.json(
        { error: "Can only reject pending offers" },
        { status: 400 }
      );
    }

    // Mark the selected response as rejected
    response.status = "rejected";
    await response.save();

    // Create notification for the seller
    await Notification.create({
      userId: response.sellerId.toString(),
      message: `❌ Your offer for "${request.title}" was rejected.`,
      type: "offer_rejected",
      requestId: request._id.toString(),
    });

    return NextResponse.json({ message: "Offer rejected successfully" });
  } catch (error: any) {
    console.error("Error in reject offer API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
