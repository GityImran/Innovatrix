import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import RequestResponse from "@/models/RequestResponse";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    const responses = await RequestResponse.find({ requestId: id })
      .populate("productId")
      .populate("sellerId", "name")
      .sort({ createdAt: -1 });

    return NextResponse.json(responses);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
