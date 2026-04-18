"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle } from 'lucide-react';

interface ChatButtonProps {
  itemId: string;
  sellerId: string;
}

export default function ChatButton({ itemId, sellerId }: ChatButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleChat = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, sellerId }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to start chat');
        return;
      }

      const convo = await res.json();
      router.push(`/chat/${convo._id}`);
    } catch (err) {
      console.error('Chat button error:', err);
      alert('Could not start conversation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleChat}
      disabled={loading}
      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-8 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <MessageCircle size={20} />
      {loading ? 'Starting Chat...' : 'Chat with Seller'}
    </button>
  );
}
