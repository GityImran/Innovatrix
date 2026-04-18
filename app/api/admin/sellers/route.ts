import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectToDatabase();

    // Find all users who are verified (sellers)
    const sellers = await User.find({ isVerified: true });

    const sellerData = await Promise.all(
      sellers.map(async (seller) => {
        const listingsCount = await Product.countDocuments({ sellerId: seller._id });
        return {
          id: seller._id,
          name: seller.name,
          status: "active", // Defaulting to active if verified
          listings: listingsCount,
          lastActive: seller.updatedAt,
        };
      })
    );

    return NextResponse.json(sellerData);
  } catch (error) {
    console.error("Error fetching sellers:", error);
    return NextResponse.json({ error: "Failed to fetch sellers" }, { status: 500 });
  }
}
