import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Request from "@/models/Request";
import RequestResponse from "@/models/RequestResponse";
import Notification from "@/models/Notification";
import CartItem from "@/models/Cart";

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

    // 1. Find and validate response
    const response = await RequestResponse.findById(responseId);
    if (!response) {
      return NextResponse.json({ error: "Response not found" }, { status: 404 });
    }

    // 2. Find and validate request
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

    // 3. Mark the selected response as accepted
    response.status = "accepted";
    await response.save();

    // 4. Mark the request as fulfilled
    request.status = "fulfilled";
    await request.save();

    // 5. Mark other pending responses as rejected
    await RequestResponse.updateMany(
      { 
        requestId: request._id, 
        _id: { $ne: responseId },
        status: "pending" 
      },
      { status: "rejected" }
    );

    // 6. Create notifications for other sellers who were rejected
    const otherResponses = await RequestResponse.find({
      requestId: request._id,
      _id: { $ne: responseId },
      status: "rejected"
    });

    for (const otherResp of otherResponses) {
      await Notification.create({
        userId: otherResp.sellerId.toString(),
        message: `❌ Your offer for "${request.title}" was not accepted.`,
        type: "offer_rejected",
        requestId: request._id.toString(),
      });
    }

    // 7. Create notification for the winning seller
    await Notification.create({
      userId: response.sellerId.toString(),
      message: `🎉 Your offer for "${request.title}" was accepted! Awaiting checkout.`,
      type: "offer_accepted",
      requestId: request._id.toString(),
    });

    // 8. Add the item to the user's cart
    const existingCartItem = await CartItem.findOne({ 
      userId: session.user.id, 
      itemId: response.productId 
    });

    if (!existingCartItem) {
      await CartItem.create({
        userId: session.user.id,
        itemId: response.productId,
        itemModel: "Product",
      });
    }

    return NextResponse.json({ 
      message: "Offer accepted successfully and item added to cart", 
      productId: response.productId 
    });
  } catch (error: any) {
    console.error("Error in accept offer API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
