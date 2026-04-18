import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import SellerRequest from "@/models/SellerRequest";

export async function GET() {
  try {
    await connectToDatabase();

    const requests = await SellerRequest.find().sort({ appliedAt: -1 });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching seller requests:", error);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}
