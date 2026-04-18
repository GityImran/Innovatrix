import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Conversation from "@/models/Conversation";

/**
 * POST /api/conversation
 * Create or fetch an existing conversation between buyer and seller for an item.
 */
export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId, sellerId } = await req.json();

    if (!itemId || !sellerId) {
      return NextResponse.json(
        { error: "itemId and sellerId are required" },
        { status: 400 }
      );
    }

    const buyerId = session.user.id;

    // Don't allow chatting with yourself
    if (buyerId === sellerId) {
      return NextResponse.json(
        { error: "Cannot start a conversation with yourself" },
        { status: 400 }
      );
    }

    // Find existing conversation or create new one
    let convo = await Conversation.findOne({ itemId, buyerId, sellerId });

    if (!convo) {
      convo = await Conversation.create({ itemId, buyerId, sellerId });
    }

    return NextResponse.json(convo);
  } catch (error: any) {
    console.error("Conversation API error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/conversation
 * Fetch all conversations for the logged-in user (as buyer or seller).
 */
export async function GET() {
  try {
    await connectToDatabase();

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const conversations = await Conversation.find({
      $or: [{ buyerId: userId }, { sellerId: userId }],
    })
      .populate("itemId", "title image expectedPrice")
      .populate("buyerId", "name email")
      .populate("sellerId", "name email")
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json(conversations);
  } catch (error: any) {
    console.error("Conversation GET error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}
