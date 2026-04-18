import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Request from "@/models/Request";
import RequestResponse from "@/models/RequestResponse";
import Product from "@/models/Product";
import SellerRequest from "@/models/SellerRequest";
import Notification from "@/models/Notification";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = session.user.id;

    const body = await req.json();
    const { requestId, productId, offeredPrice } = body;

    if (!requestId || !productId) {
      return NextResponse.json(
        { error: "Missing requestId or productId" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 1. Check seller verification status
    const sellerStatus = await SellerRequest.findOne({ userId: currentUserId });
    if (!sellerStatus || sellerStatus.status !== "approved") {
      return NextResponse.json(
        { error: "Seller not verified. Please register as a seller first." },
        { status: 403 }
      );
    }

    // 2. Check if request exists and is open
    const request = await Request.findById(requestId);
    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // 3. Prevent self-fulfillment
    if (request.userId.toString() === currentUserId) {
      return NextResponse.json(
        { error: "You cannot fulfill your own request" },
        { status: 403 }
      );
    }

    if (request.status !== "open") {
      return NextResponse.json(
        { error: "This request is no longer open" },
        { status: 400 }
      );
    }

    // Verify product exists and belongs to the seller
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    if (product.sellerId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "You can only respond with your own listings" },
        { status: 403 }
      );
    }

    // Prevent duplicate responses (same seller + same product for same request)
    const existingResponse = await RequestResponse.findOne({
      requestId,
      productId,
      sellerId: session.user.id,
    });
    if (existingResponse) {
      return NextResponse.json(
        { error: "You have already responded to this request with this product" },
        { status: 400 }
      );
    }

    const newResponse = await RequestResponse.create({
      requestId,
      productId,
      sellerId: session.user.id,
      offeredPrice: offeredPrice || product.expectedPrice,
    });

    // Create notification for request owner
    await Notification.create({
      userId: request.userId.toString(),
      message: `📦 Someone sent an offer for your request: "${request.title}"`,
      type: "request_offer",
      requestId: request._id.toString(),
    });

    return NextResponse.json(newResponse, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
