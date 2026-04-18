import React from 'react';
import Link from 'next/link';
import Header from '../components/Header/Header';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';
import { redirect } from 'next/navigation';
import styles from './Chat.module.css';

export default async function ChatListPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  await connectToDatabase();
  const userId = session.user.id;

  const conversations = await Conversation.find({
    $or: [{ buyerId: userId }, { sellerId: userId }],
  })
    .populate('itemId', 'title image expectedPrice')
    .populate('buyerId', 'name email')
    .populate('sellerId', 'name email')
    .sort({ updatedAt: -1 })
    .lean() as any[];

  // Get last message for each conversation and filter invalid data
  const convosWithLastMsg = (await Promise.all(
    conversations.map(async (convo: any) => {
      // Filter invalid data: MUST have buyer and seller
      if (!convo.buyerId || !convo.sellerId) return null;

      const lastMsg = await Message.findOne({ conversationId: convo._id })
        .sort({ createdAt: -1 })
        .lean() as any;
      return { ...convo, lastMessage: lastMsg };
    })
  )).filter(Boolean) as any[];

  return (
    <div className={styles.chatListContainer}>
      <Header />
      <main className={styles.chatListMain}>
        <h1 className={styles.chatListTitle}>
          💬 Messages
        </h1>

        {convosWithLastMsg.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📭</div>
            <h2>No conversations yet</h2>
            <p>Start chatting by clicking &quot;Chat with Seller&quot; on any product page.</p>
          </div>
        ) : (
          convosWithLastMsg.map((convo: any) => {
            const buyerId = convo.buyerId?._id?.toString();
            const sellerId = convo.sellerId?._id?.toString();

            if (!buyerId || !sellerId) return null;

            const otherUser =
              buyerId === userId ? convo.sellerId : convo.buyerId;

            const initial = otherUser?.name?.charAt(0).toUpperCase() || '?';
            const itemTitle = convo.itemId?.title || 'Unknown Item';
            const lastMsgText = convo.lastMessage?.message || 'No messages yet';
            const timeAgo = convo.updatedAt
              ? new Date(convo.updatedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              : '';


            return (
              <Link
                key={convo._id.toString()}
                href={`/chat/${convo._id.toString()}`}
                className={styles.convoCard}
              >
                <div className={styles.convoAvatar}>{initial}</div>
                <div className={styles.convoInfo}>
                  <div className={styles.convoName}>{otherUser?.name || 'Unknown'}</div>
                  <div className={styles.convoItem}>
                    📦 {itemTitle} &middot; {lastMsgText.length > 40
                      ? lastMsgText.slice(0, 40) + '...'
                      : lastMsgText}
                  </div>
                </div>
                <div className={styles.convoTime}>{timeAgo}</div>
              </Link>
            );
          })
        )}
      </main>
    </div>
  );
}
