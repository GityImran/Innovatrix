import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";

/**
 * GET /api/messages/[id]
 * Fetch all messages for a conversation.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify user is part of this conversation
    const convo = await Conversation.findById(id);
    if (!convo) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const userId = session.user.id;
    if (
      convo.buyerId.toString() !== userId &&
      convo.sellerId.toString() !== userId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const messages = await Message.find({ conversationId: id })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json(messages);
  } catch (error: any) {
    console.error("Messages GET error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/messages/[id]
 * Save a new message to the conversation.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { message } = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const newMsg = await Message.create({
      conversationId: id,
      senderId: session.user.id,
      message: message.trim(),
    });

    // Update conversation's updatedAt
    await Conversation.findByIdAndUpdate(id, { updatedAt: new Date() });

    return NextResponse.json(newMsg);
  } catch (error: any) {
    console.error("Messages POST error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}
