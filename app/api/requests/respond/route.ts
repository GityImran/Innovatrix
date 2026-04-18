import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Request from "@/models/Request";
import RequestResponse from "@/models/RequestResponse";
import Product from "@/models/Product";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { requestId, productId, offeredPrice } = body;

    if (!requestId || !productId) {
      return NextResponse.json(
        { error: "Missing requestId or productId" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if request exists and is open
    const request = await Request.findById(requestId);
    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
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

    return NextResponse.json(newResponse, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
