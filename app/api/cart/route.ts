import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import CartItem from "@/models/Cart";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    // Fetch cart items and populate the actual product/rent item details
    const cartItems = await CartItem.find({ userId: session.user.id })
      .populate({
        path: "itemId",
        select: "title expectedPrice pricing image category status",
      })
      .sort({ addedAt: -1 });

    return NextResponse.json(cartItems);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { itemId, itemModel } = body;

    if (!itemId || !itemModel) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();

    // Check if item already exists in cart for this user
    const existing = await CartItem.findOne({ userId: session.user.id, itemId });
    if (existing) {
      return NextResponse.json({ message: "Item already in cart" }, { status: 200 });
    }

    const newItem = await CartItem.create({
      userId: session.user.id,
      itemId,
      itemModel,
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cartItemId = searchParams.get("id");

    if (!cartItemId) {
      return NextResponse.json({ error: "Missing cart item ID" }, { status: 400 });
    }

    await connectToDatabase();
    await CartItem.deleteOne({ _id: cartItemId, userId: session.user.id });

    return NextResponse.json({ message: "Item removed from cart" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
