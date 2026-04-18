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
  message?: string;
  type: "text" | "offer" | "counter" | "system";
  offerData?: {
    price: number;
    status: "pending" | "accepted" | "rejected" | "countered";
  };
  createdAt: string;
}

interface ChatRoomProps {
  conversationId: string;
  currentUserId: string;
  otherUserName: string;
  itemTitle: string;
  itemCategory: string;
  itemCondition: string;
  itemPrice: number;
}

export default function ChatRoom({
  conversationId,
  currentUserId,
  otherUserName,
  itemTitle,
  itemCategory,
  itemCondition,
  itemPrice,
}: ChatRoomProps) {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [counterPrice, setCounterPrice] = useState<string>("");
  const [activeCounterId, setCounterId] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load market stats for insights
  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/products/similar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: itemTitle,
            category: itemCategory,
            condition: itemCondition,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to load market stats:", err);
      }
    }
    if (itemTitle && itemCategory) fetchStats();
  }, [itemTitle, itemCategory, itemCondition]);

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

  const updateOfferStatus = async (messageId: string, status: "accepted" | "rejected") => {
    try {
      const res = await fetch("/api/chat/offer", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, status }),
      });
      if (res.ok) {
        const { message: updatedMsg, systemMsg } = await res.json();
        setMessages(prev => prev.map(m => m._id === messageId ? updatedMsg : m));
        setMessages(prev => [...prev, systemMsg]);
        // Emit through socket so other side sees it
        socket?.emit("send_message", systemMsg);
      }
    } catch (err) {
      console.error("Failed to update offer:", err);
    }
  };

  const handleCounter = async (messageId: string) => {
    if (!counterPrice || isNaN(Number(counterPrice))) return;
    try {
      const res = await fetch("/api/chat/offer", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId,
          status: "countered",
          counterPrice: Number(counterPrice),
        }),
      });
      if (res.ok) {
        const { message: updatedMsg, counterMsg } = await res.json();
        setMessages(prev => prev.map(m => m._id === messageId ? updatedMsg : m));
        if (counterMsg) {
          setMessages(prev => [...prev, counterMsg]);
          socket?.emit("send_message", counterMsg);
        }
        setCounterId(null);
        setCounterPrice("");
      }
    } catch (err) {
      console.error("Failed to send counter:", err);
    }
  };

  const getInsightText = (offerPrice: number) => {
    const listingPrice = itemPrice;
    if (!listingPrice) return null;
    
    const diff = ((listingPrice - offerPrice) / listingPrice) * 100;
    const roundedDiff = Math.abs(Math.round(diff));

    if (offerPrice < listingPrice) {
      return `💡 ${roundedDiff}% below listed price`;
    } else if (offerPrice === listingPrice) {
      return `💡 Matches listed price`;
    } else {
      return `💡 ${roundedDiff}% above listed price`;
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

      {/* Market Intelligence Strip */}
      {stats?.hasData && (
        <div style={s.marketStrip}>
          <span style={{ color: "#94a3b8" }}>Market Average for {itemCondition}:</span>
          <strong style={{ color: "#f59e0b" }}> ₹{stats.avgPrice}</strong>
          <span style={{ marginLeft: "auto", color: "#64748b", fontSize: "0.7rem" }}>
            Data-driven insights 📈
          </span>
        </div>
      )}

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

          if (msg.type === "offer" || msg.type === "counter") {
            const status = msg.offerData?.status || "pending";
            const price = msg.offerData?.price || 0;
            const insight = getInsightText(price);
            
            const isOffer = msg.type === "offer";
            const isCounter = msg.type === "counter";
            
            // Define colors based on type and status
            let cardColor = "#3b82f6"; // Default Blue for Offer
            if (isCounter) cardColor = "#a855f7"; // Purple for Counter
            if (status === "accepted") cardColor = "#10b981"; // Green
            if (status === "rejected") cardColor = "#ef4444"; // Red

            return (
              <div 
                key={msg._id} 
                className={`${styles.messageBubble} ${isOwn ? styles.messageOwn : styles.messageOther} ${styles.offerMessage}`}
                style={{ 
                  borderLeft: `4px solid ${cardColor}`,
                  backgroundColor: isOwn ? "rgba(30, 41, 59, 0.9)" : "rgba(15, 23, 42, 0.9)"
                }}
              >
                <div style={{ fontWeight: 700, fontSize: "0.75rem", marginBottom: "0.5rem", color: cardColor, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {isOffer ? "💰 Price Offer" : "🔁 Counter Offer"}
                </div>
                
                <div style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.25rem", color: "#f8fafc" }}>
                  ₹{price.toLocaleString('en-IN')}
                </div>

                {!isOwn && (
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.75rem" }}>
                    Listed Price: <strong>₹{itemPrice}</strong>
                  </div>
                )}
                
                {insight && (
                  <div style={{ 
                    fontSize: "0.8rem", 
                    marginBottom: "1rem", 
                    padding: "0.4rem 0.6rem", 
                    backgroundColor: "rgba(255,255,255,0.05)", 
                    borderRadius: "6px",
                    color: "#cbd5e1"
                  }}>
                    {insight}
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                  <div style={{ 
                    width: "8px", 
                    height: "8px", 
                    borderRadius: "50%", 
                    backgroundColor: cardColor 
                  }} />
                  <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8", textTransform: "capitalize" }}>
                    {status}
                  </span>
                </div>

                {!isOwn && (status === "pending" || status === "countered") && (
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => updateOfferStatus(msg._id, "accepted")} style={s.actionBtnAccept}>Accept</button>
                    <button onClick={() => updateOfferStatus(msg._id, "rejected")} style={s.actionBtnReject}>Reject</button>
                    <button onClick={() => setCounterId(msg._id)} style={s.actionBtnCounter}>
                      {status === "countered" ? "Counter Again" : "Counter"}
                    </button>
                  </div>
                )}

                {activeCounterId === msg._id && (
                  <div style={{ marginTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1rem" }}>
                    <p style={{ fontSize: "0.7rem", color: "#94a3b8", marginBottom: "0.5rem" }}>Enter your counter price:</p>
                    <div style={{ position: "relative", marginBottom: "0.5rem" }}>
                      <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#64748b" }}>₹</span>
                      <input 
                        type="number" 
                        placeholder="Price" 
                        value={counterPrice}
                        onChange={(e) => setCounterPrice(e.target.value)}
                        style={{ ...s.counterInput, paddingLeft: "1.75rem" }}
                      />
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button onClick={() => handleCounter(msg._id)} style={s.confirmBtn}>Send Offer</button>
                      <button onClick={() => setCounterId(null)} style={s.cancelBtn}>Cancel</button>
                    </div>
                  </div>
                )}

                <div className={`${styles.messageTime} ${isOwn ? styles.messageTimeOwn : ''}`}>{time}</div>
              </div>
            );
          }

          if (msg.type === "system") {
            return (
              <div key={msg._id} style={{ textAlign: "center", margin: "1rem 0", color: "#64748b", fontSize: "0.75rem", fontStyle: "italic" }}>
                {msg.message}
              </div>
            );
          }

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

const s: Record<string, React.CSSProperties> = {
  marketStrip: {
    padding: "0.75rem 1.25rem",
    backgroundColor: "#0f172a",
    borderBottom: "1px solid #1e293b",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.8rem",
  },
  actionBtnAccept: {
    flex: 1,
    padding: "0.5rem",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "0.75rem",
    fontWeight: 700,
    cursor: "pointer",
  },
  actionBtnReject: {
    flex: 1,
    padding: "0.5rem",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "0.75rem",
    fontWeight: 700,
    cursor: "pointer",
  },
  actionBtnCounter: {
    flex: 1.5,
    padding: "0.5rem",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "0.75rem",
    fontWeight: 700,
    cursor: "pointer",
  },
  counterInput: {
    width: "100%",
    backgroundColor: "#020617",
    border: "1px solid #334155",
    borderRadius: "8px",
    padding: "0.6rem",
    color: "#f8fafc",
    fontSize: "0.9rem",
    marginBottom: "0.5rem",
    outline: "none",
  },
  confirmBtn: {
    flex: 1,
    padding: "0.5rem",
    backgroundColor: "#f59e0b",
    color: "black",
    border: "none",
    borderRadius: "6px",
    fontSize: "0.75rem",
    fontWeight: 700,
    cursor: "pointer",
  },
  cancelBtn: {
    padding: "0.5rem 1rem",
    backgroundColor: "transparent",
    color: "#94a3b8",
    border: "1px solid #334155",
    borderRadius: "6px",
    fontSize: "0.75rem",
    fontWeight: 600,
    cursor: "pointer",
  },
};

