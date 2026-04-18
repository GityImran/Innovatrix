"use client";

import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import styles from '../Chat.module.css';

interface MessageData {
  _id: string;
  conversationId: string;
  senderId: string;
  message: string;
  createdAt: string;
}

interface ChatRoomProps {
  conversationId: string;
  currentUserId: string;
  otherUserName: string;
  itemTitle: string;
}

export default function ChatRoom({
  conversationId,
  currentUserId,
  otherUserName,
  itemTitle,
}: ChatRoomProps) {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load initial messages
  useEffect(() => {
    async function fetchMessages() {
      try {
        const res = await fetch(`/api/messages/${conversationId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    }
    fetchMessages();
  }, [conversationId]);

  // Socket.IO connection
  useEffect(() => {
    const newSocket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('join_conversation', {
        conversationId,
        userId: currentUserId,
      });
    });

    newSocket.on('receive_message', (msg: MessageData) => {
      setMessages((prev) => {
        // Prevent duplicates
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [conversationId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !socket) return;

    socket.emit('send_message', {
      conversationId,
      senderId: currentUserId,
      message: input.trim(),
    });

    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.chatRoomContainer}>
      {/* Header */}
      <div className={styles.chatHeader}>
        <Link href="/chat" className={styles.chatBackBtn}>
          <ArrowLeft size={20} />
        </Link>
        <div className={styles.chatHeaderInfo}>
          <div className={styles.chatHeaderName}>{otherUserName}</div>
          <div className={styles.chatHeaderItem}>
            📦 {itemTitle} &middot;{' '}
            <span style={{ color: isConnected ? '#22c55e' : '#ef4444' }}>
              {isConnected ? '● Online' : '● Connecting...'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className={styles.messagesArea}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#475569', marginTop: '4rem' }}>
            <p style={{ fontSize: '2rem' }}>👋</p>
            <p>Start the conversation!</p>
          </div>
        )}
        {messages.map((msg) => {
          const isOwn = msg.senderId === currentUserId;
          const time = new Date(msg.createdAt).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={msg._id}
              className={`${styles.messageBubble} ${
                isOwn ? styles.messageOwn : styles.messageOther
              }`}
            >
              {msg.message}
              <div
                className={`${styles.messageTime} ${
                  isOwn ? styles.messageTimeOwn : ''
                }`}
              >
                {time}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={styles.chatInputArea}>
        <input
          className={styles.chatInput}
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className={styles.chatSendBtn}
          onClick={handleSend}
          disabled={!input.trim()}
        >
          <Send size={18} /> Send
        </button>
      </div>
    </div>
  );
}
