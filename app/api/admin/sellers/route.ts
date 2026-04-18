import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import SellerRequest from "@/models/SellerRequest";
import Product from "@/models/Product";
import User from "@/models/User";

export async function GET() {
  try {
    await connectToDatabase();

    // Fetch all requests that are either approved or disabled
    const requests = await SellerRequest.find({
      status: { $in: ["approved", "disabled"] },
    }).populate("userId");

    const sellerData = await Promise.all(
      requests.map(async (req) => {
        const listingsCount = await Product.countDocuments({ sellerId: req.userId });
        const user = req.userId as any;
        
        return {
          id: user?._id,
          name: user?.name || req.fullName,
          status: req.status === "approved" ? "active" : "disabled",
          listings: listingsCount,
          lastActive: user?.updatedAt || req.updatedAt,
        };
      })
    );

    return NextResponse.json(sellerData);
  } catch (error) {
    console.error("Error fetching sellers:", error);
    return NextResponse.json({ error: "Failed to fetch sellers" }, { status: 500 });
  }
}
