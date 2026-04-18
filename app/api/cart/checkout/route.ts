import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import CartItem from "@/models/Cart";
import Order from "@/models/Order";
import Product from "@/models/Product";
import RentItem from "@/models/RentItem";
import Auction from "@/models/Auction";
import User from "@/models/User";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Read paymentMethod and useSuperCoins from request body
    let paymentMethod = "cod";
    let useSuperCoins = false;
    try {
      const body = await req.json();
      if (body?.paymentMethod) paymentMethod = body.paymentMethod;
      if (body?.useSuperCoins) useSuperCoins = body.useSuperCoins;
    } catch {
      // Body may be empty — fall back to default "cod"
    }

    await connectToDatabase();

    // 1. Get all cart items for the user
    const cartItems = await CartItem.find({ userId: session.user.id });

    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // 2. Fetch User to check superCoins
    let availableCoins = 0;
    const userDoc = await User.findById(session.user.id);
    if (useSuperCoins && userDoc && typeof userDoc.superCoins === "number") {
      availableCoins = userDoc.superCoins;
    }

    // 3. Pre-calculate total cart value
    const orderDetails = [];
    let cartTotal = 0;

    for (const item of cartItems) {
      let productDetail: any = null;
      if (item.itemModel === "Product") productDetail = await Product.findById(item.itemId);
      else if (item.itemModel === "RentItem") productDetail = await RentItem.findById(item.itemId);
      else if (item.itemModel === "Auction") productDetail = await Auction.findById(item.itemId);

      if (!productDetail) continue;

      let price = 0;
      if (item.itemModel === "Product") price = productDetail.expectedPrice;
      else if (item.itemModel === "RentItem") price = productDetail.pricing?.day || 0;
      else if (item.itemModel === "Auction") price = productDetail.currentBid;

      cartTotal += price;
      orderDetails.push({ item, productDetail, price });
    }

    if (orderDetails.length === 0) {
      return NextResponse.json({ error: "No valid items in cart" }, { status: 400 });
    }

    // 4. Calculate discount
    let coinsToDeduct = 0;
    let remainingDiscount = 0;

    if (useSuperCoins && availableCoins > 0) {
      const maxDiscount = availableCoins * 0.01;
      const appliedDiscount = Math.min(maxDiscount, cartTotal);
      coinsToDeduct = Math.ceil(appliedDiscount / 0.01);
      remainingDiscount = appliedDiscount;
    }

    const orders = [];

    // 5. Create orders and apply discount proportionally or sequentially
    for (const { item, productDetail, price } of orderDetails) {
      const actualItemId = productDetail._id || item.itemId;
      const actualSellerId = productDetail.sellerId;

      let finalPrice = price;
      if (remainingDiscount > 0) {
        if (remainingDiscount >= price) {
          finalPrice = 0;
          remainingDiscount -= price;
        } else {
          finalPrice -= remainingDiscount;
          remainingDiscount = 0;
        }
      }

      // If price is completely covered by SuperCoins, we could mark it as paid.
      // But for simplicity and to match the seller flow, we keep it 'pending'.
      // If the seller generates a Razorpay link for 0 Rs, it might fail,
      // so the seller might just have to collect 0 Rs (cash) or we should handle it in the seller app.
      
      const order = await Order.create({
        buyerId: session.user.id,
        sellerId: actualSellerId,
        itemId: actualItemId,
        itemModel: item.itemModel,
        orderType: item.itemModel === "RentItem" ? "rent" : "purchase",
        totalAmount: finalPrice,
        status: "pending",
        paymentMethod,
      });
      orders.push(order);

      // Mark item as sold/rented
      if (item.itemModel === "Product") {
        await Product.findByIdAndUpdate(actualItemId, { status: "sold" });
      } else if (item.itemModel === "RentItem") {
        await RentItem.findByIdAndUpdate(actualItemId, { status: "rented" });
      }
    }

    // 6. Deduct SuperCoins
    if (coinsToDeduct > 0 && userDoc) {
      userDoc.superCoins -= coinsToDeduct;
      await userDoc.save();
    }

    // 7. Clear the cart
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
