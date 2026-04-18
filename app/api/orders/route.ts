import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import RentItem from "@/models/RentItem";
import { auth } from "@/lib/auth";
import mongoose from "mongoose";
import Auction from "@/models/Auction";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const body = await req.json();
    const { itemId, itemModel, sellerId, totalAmount, orderType } = body;

    if (!itemId || !itemModel || !sellerId || !totalAmount || !orderType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the order
    const order = await Order.create({
      buyerId: session.user.id,
      sellerId,
      itemId,
      itemModel,
      orderType,
      totalAmount,
      status: "pending",
    });

    // Optionally update the item status to 'sold' or mark it unavailable if immediate
    // For this MVP, we might wait for 'completed' status to mark it sold, 
    // but let's at least have the order created.

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Fetch orders placed by the current buyer
    const orders = await Order.find({ buyerId: session.user.id })
      .sort({ createdAt: -1 })
      .populate("sellerId", "name email");

    // Manually populate item details since itemId points to different collections
    const populatedOrders = await Promise.all(
      orders.map(async (order) => {
        let itemInfo = null;
        if (order.itemModel === "Product") {
          itemInfo = await Product.findById(order.itemId).select("title category image");
        } else if (order.itemModel === "RentItem") {
          itemInfo = await RentItem.findById(order.itemId).select("title category image");
        } else if (order.itemModel === "Auction") {
          itemInfo = await Auction.findById(order.itemId).select("title category image");
        }

        const orderObj = order.toObject();
        return {
          ...orderObj,
          item: itemInfo
        };
      })
    );

    return NextResponse.json(populatedOrders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
