import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import ChatRoom from './ChatRoom';

interface ChatPageProps {
  params: Promise<{ id: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const { id } = await params;

  await connectToDatabase();

  const conversation = await Conversation.findById(id)
    .populate('itemId', 'title image expectedPrice category condition')
    .populate('buyerId', 'name email')
    .populate('sellerId', 'name email')
    .lean() as any;

  if (!conversation) {
    notFound();
  }

  const userId = session.user.id;
  const buyerId = conversation.buyerId?._id?.toString();
  const sellerId = conversation.sellerId?._id?.toString();

  if (!buyerId || !sellerId) {
    notFound();
  }

  const isBuyer = buyerId === userId;
  const isSeller = sellerId === userId;


  if (!isBuyer && !isSeller) {
    notFound();
  }

  const otherUser = isBuyer ? conversation.sellerId : conversation.buyerId;
  const itemTitle = conversation.itemId?.title || 'Unknown Item';
  const itemCategory = conversation.itemId?.category || '';
  const itemCondition = conversation.itemId?.condition || '';
  const itemPrice = conversation.itemId?.expectedPrice || 0;

  return (
    <ChatRoom
      conversationId={id}
      currentUserId={userId}
      otherUserName={otherUser?.name || 'Unknown'}
      itemTitle={itemTitle}
      itemCategory={itemCategory}
      itemCondition={itemCondition}
      itemPrice={itemPrice}
      sellerId={sellerId}
    />
  );
}
