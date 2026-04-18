import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import CartItem from "@/models/Cart";
import Order from "@/models/Order";
import Product from "@/models/Product";
import RentItem from "@/models/RentItem";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // 1. Get all cart items for the user
    const cartItems = await CartItem.find({ userId: session.user.id })
      .populate({
        path: "itemId",
      });

    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const orders = [];

    // 2. Create an order for each item
    for (const item of cartItems) {
      const productDetail = item.itemId as any;
      if (!productDetail) continue;

      const price = item.itemModel === "Product" 
        ? productDetail.expectedPrice 
        : (productDetail.pricing?.day || 0);

      const order = await Order.create({
        buyerId: session.user.id,
        sellerId: productDetail.sellerId,
        itemId: item.itemId,
        itemModel: item.itemModel,
        orderType: item.itemModel === "Product" ? "purchase" : "rent",
        totalAmount: price,
        status: "pending",
      });
      orders.push(order);
    }

    // 3. Clear the cart
    await CartItem.deleteMany({ userId: session.user.id });

    return NextResponse.json({ 
      message: "Checkout successful", 
      orderCount: orders.length,
      orders 
    }, { status: 201 });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
