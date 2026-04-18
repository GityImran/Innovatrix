import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";
import mongoose from "mongoose";

/**
 * POST /api/chat/offer
 * Send a new offer or counter-offer
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId, itemId, receiverId, price, type } = await req.json();

    if (!itemId || !receiverId || !price || !type) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await connectToDatabase();

    let actualConvId = conversationId;

    // If no conversationId, find or create one
    if (!actualConvId) {
      let conv = await Conversation.findOne({
        itemId,
        $or: [
          { buyerId: session.user.id, sellerId: receiverId },
          { buyerId: receiverId, sellerId: session.user.id },
        ],
      });

      if (!conv) {
        conv = await Conversation.create({
          itemId,
          buyerId: type === "offer" ? session.user.id : receiverId,
          sellerId: type === "offer" ? receiverId : session.user.id,
        });
      }
      actualConvId = conv._id;
    }

    const convo = await Conversation.findById(actualConvId);
    if (!convo) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const newMessage = await Message.create({
      conversationId: actualConvId,
      senderId: session.user.id,
      type,
      offerData: {
        price,
        status: type === "offer" ? "pending" : "countered",
        productId: convo.itemId,
        buyerId: convo.buyerId,
        sellerId: convo.sellerId,
      },
      isRead: false,
    });

    // Update unread count for receiver in conversation
    await Conversation.findByIdAndUpdate(actualConvId, {
      $inc: { [`unreadCounts.${receiverId}`]: 1 },
      updatedAt: new Date(),
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error: any) {
    console.error("Offer API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PATCH /api/chat/offer
 * Accept, Reject, or Counter an offer
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageId, status, counterPrice } = await req.json();

    if (!messageId || !["accepted", "rejected", "countered"].includes(status)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    await connectToDatabase();

    const message = await Message.findById(messageId);
    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Update the message status
    message.offerData!.status = status;
    await message.save();

    let responseData: any = { message };

    if (status === "countered" && counterPrice) {
      const convo = await Conversation.findById(message.conversationId);
      // Create a counter-offer message
      const counterMsg = await Message.create({
        conversationId: message.conversationId,
        senderId: session.user.id,
        type: "counter",
        offerData: {
          price: counterPrice,
          status: "countered",
          productId: convo?.itemId,
          buyerId: convo?.buyerId,
          sellerId: convo?.sellerId,
        },
        isRead: false,
      });
      responseData.counterMsg = counterMsg;
    } else {
      // Create a system message for accept/reject
      const systemMsg = await Message.create({
        conversationId: message.conversationId,
        senderId: session.user.id,
        type: "system",
        message: `Offer ${status} for ₹${message.offerData?.price}`,
        isRead: false,
      });
      responseData.systemMsg = systemMsg;
    }

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("Offer Update API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
