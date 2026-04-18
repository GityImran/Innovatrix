import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Conversation from "@/models/Conversation";

/**
 * GET /api/conversation/unread
 * Returns the total number of unread messages across all conversations for the logged-in user.
 */
export async function GET() {
  try {
    await connectToDatabase();

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ unreadCount: 0 });
    }

    const userId = session.user.id;

    const convos = await Conversation.find({
      $or: [{ buyerId: userId }, { sellerId: userId }],
    }).lean() as any[];

    const unreadCount = convos.reduce((sum, c) => {
      // unreadCounts is a Map stored as plain object in lean()
      const counts = c.unreadCounts as Record<string, number> | undefined;
      return sum + (counts?.[userId] ?? 0);
    }, 0);

    return NextResponse.json({ unreadCount });
  } catch (error: any) {
    console.error("Unread count error:", error);
    return NextResponse.json({ unreadCount: 0 });
  }
}
