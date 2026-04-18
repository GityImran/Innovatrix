import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Request from "@/models/Request";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const request = await Request.findById(id).populate("userId", "name");
    
    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json(request);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
