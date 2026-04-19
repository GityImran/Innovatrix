import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Trade from "@/models/Trade";
import Product from "@/models/Product";
import { auth } from "@/lib/auth";

interface CreateTradeBody {
  requestedProductId: string;
  offeredProductIds: string[];
  cashOffered?: number;
}

/**
 * POST /api/trade/create
 * Propose a trade — requester offers their products (+ optional cash) for an owner's product.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CreateTradeBody = await req.json();
    const { requestedProductId, offeredProductIds, cashOffered = 0 } = body;

    // ── Basic input validation ──────────────────────────────────────────
    if (!requestedProductId) {
      return NextResponse.json(
        { error: "requestedProductId is required" },
        { status: 400 }
      );
    }
    if (!offeredProductIds || offeredProductIds.length === 0) {
      return NextResponse.json(
        { error: "You must offer at least one product" },
        { status: 400 }
      );
    }
    if (typeof cashOffered !== "number" || cashOffered < 0) {
      return NextResponse.json(
        { error: "cashOffered must be a non-negative number" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const requesterId = session.user.id;

    // ── Validate requested product ──────────────────────────────────────
    const requestedProduct = await Product.findById(requestedProductId);
    if (!requestedProduct) {
      return NextResponse.json(
        { error: "The product you want to trade for does not exist" },
        { status: 404 }
      );
    }
    if (!requestedProduct.isTradeEnabled) {
      return NextResponse.json(
        { error: "This product is not available for trade" },
        { status: 400 }
      );
    }
    if (requestedProduct.status !== "active") {
      return NextResponse.json(
        { error: "This product is no longer available" },
        { status: 400 }
      );
    }

    const ownerId = requestedProduct.sellerId.toString();

    // ── Requester cannot be the owner ───────────────────────────────────
    if (ownerId === requesterId) {
      return NextResponse.json(
        { error: "You cannot propose a trade on your own item" },
        { status: 400 }
      );
    }

    // ── Validate offered products ───────────────────────────────────────
    const offeredProducts = await Product.find({
      _id: { $in: offeredProductIds },
    });

    if (offeredProducts.length !== offeredProductIds.length) {
      return NextResponse.json(
        { error: "One or more offered products not found" },
        { status: 404 }
      );
    }

    for (const p of offeredProducts) {
      if (p.sellerId.toString() !== requesterId) {
        return NextResponse.json(
          { error: `Product "${p.title}" does not belong to you` },
          { status: 403 }
        );
      }
      if (p.status !== "active") {
        return NextResponse.json(
          { error: `Product "${p.title}" is no longer available` },
          { status: 400 }
        );
      }
    }

    // ── Prevent duplicate pending trade for the same product pair ───────
    const existing = await Trade.findOne({
      requesterId,
      requestedProductId,
      status: "pending",
    });
    if (existing) {
      return NextResponse.json(
        { error: "You already have a pending trade request for this item" },
        { status: 409 }
      );
    }

    // ── Create trade ────────────────────────────────────────────────────
    const trade = await Trade.create({
      requesterId: new mongoose.Types.ObjectId(requesterId),
      ownerId: new mongoose.Types.ObjectId(ownerId),
      requestedProductId: requestedProduct._id,
      offeredProductIds: offeredProducts.map((p) => p._id),
      cashOffered,
      status: "pending",
    });

    return NextResponse.json(trade, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
