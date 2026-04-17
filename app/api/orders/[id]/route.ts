import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import RentItem from "@/models/RentItem";
import { auth } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    // Find the order
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only allow seller or buyer (depending on status) to update?
    // For now, let's keep it simple: seller updates status to 'completed'
    if (session.user.id !== order.sellerId.toString() && session.user.id !== order.buyerId.toString()) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const previousStatus = order.status;
    order.status = status;
    await order.save();

    // If order is marked 'completed', update the item status
    if (status === "completed" && previousStatus !== "completed") {
      if (order.itemModel === "Product") {
        await Product.findByIdAndUpdate(order.itemId, { status: "sold" });
      } else if (order.itemModel === "RentItem") {
        await RentItem.findByIdAndUpdate(order.itemId, { status: "rented" });
      }
    }

    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
