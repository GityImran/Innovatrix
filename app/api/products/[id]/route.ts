import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";
import RentItem from "@/models/RentItem";
import User from "@/models/User"; // Ensure User is registered to avoid populate errors

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    // Prevent unpopulated User models error if Next.js hasn't loaded User yet.
    if (!User) console.warn("User model not loaded");

    // Try finding as Product (Sell)
    let item: any = await Product.findById(id).populate("sellerId", "email name").lean();
    let type = "sell";

    // If not found, try finding as RentItem (Rent)
    if (!item) {
      item = await RentItem.findById(id).populate("sellerId", "email name").lean();
      type = "rent";
    }

    if (!item) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const seller = item.sellerId
      ? { 
          id: item.sellerId._id?.toString() || item.sellerId.toString(), 
          email: item.sellerId.email || "seller@campus.edu", 
          name: item.sellerId.name || "Campus Student",
          rating: 5 // Future scope rating
        }
      : { id: "", email: "Unknown", name: "Unknown", rating: 5 };

    // Standard base object structure
    const responseData: any = {
      id: item._id.toString(),
      type,
      title: item.title,
      description: item.description,
      category: item.category,
      condition: item.condition,
      images: [item.image?.url ?? ""], // Wrapping single image into required array format
      sellerDomain: item.sellerDomain,
      seller, // Detailed nested seller object
      isUrgent: item.isUrgent || false,
      status: item.status, // We return inactive status intentionally for "Already Sold" frontend UI 
      createdAt: item.createdAt,
    };

    if (type === "sell") {
      responseData.price = item.expectedPrice;
      responseData.originalPrice = item.originalPrice;
      responseData.isBundle = item.isBundle || false;
      responseData.bundleTitle = item.bundleTitle;
    } else {
      responseData.pricing = item.pricing;
      responseData.availability = item.availability;
      responseData.securityDeposit = item.securityDeposit;
      responseData.allowNegotiation = item.allowNegotiation || false;
    }

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("API /products/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
