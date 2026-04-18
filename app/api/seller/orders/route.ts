import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";
import { auth } from "@/lib/auth";


export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    // Fetch orders received by the current seller
    // Populate buyer details and item details
    const orders = await Order.find({ sellerId: session.user.id })
      .sort({ createdAt: -1 })
      .populate("buyerId", "name email");

    // Manually populate item details since itemId points to different collections
    const populatedOrders = await Promise.all(
      orders.map(async (order) => {
        let itemInfo = null;
        if (order.itemModel === "Product") {
          itemInfo = await mongoose.model("Product").findById(order.itemId).select("title category images image");
        } else if (order.itemModel === "RentItem") {
          itemInfo = await mongoose.model("RentItem").findById(order.itemId).select("title category images image");
        } else if (order.itemModel === "Auction") {
          const auction = await mongoose.model("Auction").findById(order.itemId).select("productTitle category images");
          if (auction) {
            // Normalize Auction fields to the common { title, category, image } shape used by the UI
            itemInfo = {
              _id: auction._id,
              title: auction.productTitle,
              category: auction.category,
              image: auction.images && auction.images.length > 0 ? { url: auction.images[0] } : null,
            };
          }
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
