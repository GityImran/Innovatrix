"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface MarketStats {
  hasData: boolean;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
}

interface NegotiationModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  sellerId: string;
  productTitle: string;
  productCategory: string;
  productCondition: string;
  currentPrice: number;
}

export const NegotiationModal: React.FC<NegotiationModalProps> = ({
  isOpen,
  onClose,
  productId,
  sellerId,
  productTitle,
  productCategory,
  productCondition,
  currentPrice,
}) => {
  const router = useRouter();
  const [offerPrice, setOfferPrice] = useState<number>(currentPrice);
  const [stats, setStats] = useState<MarketStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchStats = async () => {
        setLoading(true);
        try {
          const res = await fetch("/api/products/similar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: productTitle,
              category: productCategory,
              condition: productCondition,
              price: currentPrice,
              excludeId: productId,
            }),
          });
          if (res.ok) {
            const data = await res.ok ? await res.json() : null;
            setStats(data);
          }
        } catch (err) {
          console.error("Failed to fetch market stats:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchStats();
    }
  }, [isOpen, productTitle, productCategory, productCondition, currentPrice, productId]);

  const handleSendOffer = async () => {
    if (offerPrice <= 0) return;
    setSending(true);
    try {
      const res = await fetch("/api/chat/offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: productId,
          receiverId: sellerId,
          price: offerPrice,
          type: "offer",
        }),
      });

      if (res.ok) {
        onClose();
        router.push("/chat"); // Redirect to chat to see the offer
      }
    } catch (err) {
      console.error("Failed to send offer:", err);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  const listingPrice = currentPrice;
  const avgMarketPrice = stats?.avgPrice || listingPrice;

  const suggestions = [
    { price: Math.round(listingPrice * 0.9), label: "Negotiated" },
    { price: Math.round(listingPrice * 0.95), label: "Fair" },
    { price: Math.round(Math.min(listingPrice, avgMarketPrice)), label: "Safe" },
  ];

  const getFeedback = () => {
    if (offerPrice < listingPrice * 0.85) return { text: "⚠️ Too low — unlikely to be accepted", color: "#ef4444" };
    if (offerPrice <= listingPrice) return { text: "✅ Fair negotiation", color: "#10b981" };
    return { text: "💰 You can buy at listed price", color: "#f59e0b" };
  };

  const feedback = getFeedback();

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        <div style={s.header}>
          <h2 style={s.title}>💰 Negotiate Price</h2>
          <button style={s.closeBtn} onClick={onClose}>&times;</button>
        </div>

        <div style={s.content}>
          <div style={s.itemBrief}>
            <p style={s.itemTitleBrief}>{productTitle}</p>
            <p style={s.itemPriceBrief}>Listed Price: <strong>₹{listingPrice}</strong></p>
          </div>

          {/* Section 1: Market Insights */}
          <div style={s.section}>
            <p style={s.sectionLabel}>📊 Market Insights ({productCondition})</p>
            {loading ? (
              <p style={s.loading}>Analyzing market data...</p>
            ) : stats?.hasData ? (
              <div style={s.statsBox}>
                <div style={s.statItem}>
                  <span>Average:</span>
                  <strong>₹{stats.avgPrice}</strong>
                </div>
                <div style={s.statItem}>
                  <span>Range:</span>
                  <strong>₹{stats.minPrice} – ₹{stats.maxPrice}</strong>
                </div>
              </div>
            ) : (
              <p style={s.noData}>Not enough data for market insights.</p>
            )}
          </div>

          {/* Section 2: Suggested Offers */}
          <div style={s.section}>
            <p style={s.sectionLabel}>💡 Suggested Offers</p>
            <div style={s.suggestionGrid}>
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  style={s.sugBtn}
                  onClick={() => setOfferPrice(sug.price)}
                >
                  <span style={s.sugPrice}>₹{sug.price}</span>
                  <span style={s.sugLabel}>{sug.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Input Box */}
          <div style={s.section}>
            <p style={s.sectionLabel}>Enter your offer</p>
            <div style={s.inputWrapper}>
              <span style={s.currency}>₹</span>
              <input
                type="number"
                value={offerPrice}
                onChange={(e) => setOfferPrice(Number(e.target.value))}
                style={s.input}
              />
            </div>
            
            {/* Section 4: Live Feedback */}
            {feedback && (
              <p style={{ ...s.feedback, color: feedback.color }}>
                {feedback.text}
              </p>
            )}
          </div>

          <button
            style={{
              ...s.sendBtn,
              opacity: sending ? 0.7 : 1,
              cursor: sending ? "not-allowed" : "pointer"
            }}
            onClick={handleSendOffer}
            disabled={sending}
          >
            {sending ? "Sending..." : "Send Offer"}
          </button>
        </div>
      </div>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.85)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)",
  },
  modal: {
    backgroundColor: "#0f172a",
    width: "100%",
    maxWidth: "400px",
    borderRadius: "16px",
    border: "1px solid #1e293b",
    overflow: "hidden",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
  },
  header: {
    padding: "1.25rem",
    borderBottom: "1px solid #1e293b",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "#f8fafc",
    margin: 0,
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: "#94a3b8",
    fontSize: "1.5rem",
    cursor: "pointer",
  },
  content: {
    padding: "1.5rem",
  },
  itemBrief: {
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: "0.75rem 1rem",
    borderRadius: "10px",
    marginBottom: "1.25rem",
    border: "1px solid rgba(255,255,255,0.05)",
  },
  itemTitleBrief: {
    fontSize: "0.85rem",
    color: "#94a3b8",
    margin: 0,
    marginBottom: "0.25rem",
  },
  itemPriceBrief: {
    fontSize: "0.95rem",
    color: "#f8fafc",
    margin: 0,
  },
  section: {
    marginBottom: "1.5rem",
  },
  sectionLabel: {
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.025em",
    marginBottom: "0.75rem",
  },
  statsBox: {
    backgroundColor: "#1e293b",
    padding: "1rem",
    borderRadius: "12px",
    border: "1px solid #334155",
  },
  statItem: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.9rem",
    color: "#cbd5e1",
    marginBottom: "0.5rem",
  },
  loading: {
    fontSize: "0.85rem",
    color: "#94a3b8",
    fontStyle: "italic",
  },
  noData: {
    fontSize: "0.85rem",
    color: "#94a3b8",
  },
  suggestionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "0.75rem",
  },
  sugBtn: {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "10px",
    padding: "0.75rem 0.5rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  sugPrice: {
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "#f8fafc",
  },
  sugLabel: {
    fontSize: "0.65rem",
    color: "#94a3b8",
    marginTop: "0.25rem",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  currency: {
    position: "absolute",
    left: "1rem",
    color: "#94a3b8",
    fontSize: "1.1rem",
    fontWeight: 600,
  },
  input: {
    width: "100%",
    backgroundColor: "#020617",
    border: "1px solid #334155",
    borderRadius: "12px",
    padding: "0.75rem 1rem 0.75rem 2.5rem",
    color: "#f8fafc",
    fontSize: "1.25rem",
    fontWeight: 700,
    outline: "none",
  },
  feedback: {
    fontSize: "0.85rem",
    fontWeight: 600,
    marginTop: "0.5rem",
    textAlign: "right",
  },
  sendBtn: {
    width: "100%",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "12px",
    padding: "1rem",
    fontSize: "1rem",
    fontWeight: 700,
    marginTop: "0.5rem",
    transition: "all 0.2s",
  },
};
