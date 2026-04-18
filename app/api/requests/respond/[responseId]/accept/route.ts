import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Request from "@/models/Request";
import RequestResponse from "@/models/RequestResponse";

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

    // Only the request owner can accept responses
    if (request.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Only the request owner can accept offers" },
        { status: 403 }
      );
    }

    if (request.status !== "open") {
      return NextResponse.json(
        { error: "This request is already fulfilled or closed" },
        { status: 400 }
      );
    }

    // Mark the selected response as accepted
    response.status = "accepted";
    await response.save();

    // Mark the request as fulfilled
    request.status = "fulfilled";
    await request.save();

    // Optionally mark other pending responses as rejected
    await RequestResponse.updateMany(
      { 
        requestId: request._id, 
        _id: { $ne: responseId },
        status: "pending" 
      },
      { status: "rejected" }
    );

    return NextResponse.json({ message: "Offer accepted successfully", productId: response.productId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
