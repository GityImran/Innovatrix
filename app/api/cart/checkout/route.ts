import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import CartItem from "@/models/Cart";
import Order from "@/models/Order";
import Product from "@/models/Product";
import RentItem from "@/models/RentItem";
import Auction from "@/models/Auction";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Read paymentMethod from request body (sent by CartClient)
    let paymentMethod = "cod";
    try {
      const body = await req.json();
      if (body?.paymentMethod) paymentMethod = body.paymentMethod;
    } catch {
      // Body may be empty — fall back to default "cod"
    }

    await connectToDatabase();

    // 1. Get all cart items for the user
    const cartItems = await CartItem.find({ userId: session.user.id });

    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const orders = [];

    // 2. Create an order for each item and mark the item as sold/rented
    for (const item of cartItems) {
      let productDetail: any = null;
      if (item.itemModel === "Product") {
        productDetail = await Product.findById(item.itemId);
      } else if (item.itemModel === "RentItem") {
        productDetail = await RentItem.findById(item.itemId);
      } else if (item.itemModel === "Auction") {
        productDetail = await Auction.findById(item.itemId);
      }

      if (!productDetail) continue;

      let price = 0;
      if (item.itemModel === "Product") {
        price = productDetail.expectedPrice;
      } else if (item.itemModel === "RentItem") {
        price = productDetail.pricing?.day || 0;
      } else if (item.itemModel === "Auction") {
        price = productDetail.currentBid;
      }

      // Ensure we extract proper ObjectIds
      const actualItemId = productDetail._id || item.itemId;
      const actualSellerId = productDetail.sellerId;

      // Create the order with paymentMethod persisted
      const order = await Order.create({
        buyerId: session.user.id,
        sellerId: actualSellerId,
        itemId: actualItemId,
        itemModel: item.itemModel,
        orderType: item.itemModel === "RentItem" ? "rent" : "purchase",
        totalAmount: price,
        status: "pending",
        paymentMethod,
      });
      orders.push(order);

      // ─── KEY CHANGE: Mark item as sold/rented so it disappears from search ───
      if (item.itemModel === "Product") {
        await Product.findByIdAndUpdate(actualItemId, { status: "sold" });
      } else if (item.itemModel === "RentItem") {
        await RentItem.findByIdAndUpdate(actualItemId, { status: "rented" });
      } else if (item.itemModel === "Auction") {
        // Auction is already "ended", but we can mark it as "purchased" if needed
        // For now, it stays "ended".
      }
    }

    // 3. Clear the cart
    await CartItem.deleteMany({ userId: session.user.id });

    return NextResponse.json(
      {
        message: "Checkout successful",
        orderCount: orders.length,
        orders,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
