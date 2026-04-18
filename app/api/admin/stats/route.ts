import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import SellerRequest from "@/models/SellerRequest";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectToDatabase();

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isVerified: true });
    const pendingRequests = await SellerRequest.countDocuments({ status: "pending" });
    const totalListings = await Product.countDocuments({ status: "active" });

    return NextResponse.json({
      totalUsers,
      activeUsers,
      pendingRequests,
      totalListings,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
