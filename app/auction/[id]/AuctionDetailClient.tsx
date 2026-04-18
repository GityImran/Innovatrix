"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CountdownTimer from "@/app/components/Auction/CountdownTimer";
import { formatDistanceToNow } from "date-fns";
import { io } from "socket.io-client";

let socket: any;

interface AuctionDetailClientProps {
  initialAuction: any;
  initialBids: any[];
  session: any;
}

export default function AuctionDetailClient({
  initialAuction,
  initialBids,
  session,
}: AuctionDetailClientProps) {
  const router = useRouter();
  const [auction, setAuction] = useState(initialAuction);
  const [bids, setBids] = useState(initialBids);
  const [bidAmount, setBidAmount] = useState<number>(
    auction.currentBid + auction.minIncrement
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);

  const minBid = auction.currentBid + auction.minIncrement;

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      router.push("/login");
      return;
    }

    if (bidAmount < minBid) {
      setError(`Minimum bid is ₹${minBid}`);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/auctions/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auctionId: auction._id,
          amount: bidAmount,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to place bid");
      }

      // Refresh data
      await fetchUpdatedData();
      setBidAmount(data.currentBid + auction.minIncrement);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const fetchUpdatedData = async () => {
    try {
      const res = await fetch(`/api/auctions/${auction._id}`);
      const data = await res.json();
      if (res.ok) {
        setAuction(data.auction);
        setBids(data.bids);
      }
    } catch (err) {
      console.error("Failed to refresh auction data:", err);
    }
  };

  // Socket.io initialization and listeners
  useEffect(() => {
    const socketInitializer = async () => {
      // Initialize socket connection
      socket = io({
        path: "/api/socket",
      });

      socket.on("connect", () => {
        console.log("Socket connected");
        socket.emit("join-auction", auction._id);
      });

      socket.on("newBid", (data: any) => {
        if (data.auctionId === auction._id) {
          // Update auction state with new highest bidder and amount
          setAuction((prev: any) => ({
            ...prev,
            currentBid: data.amount,
            highestBidderId: {
              _id: data.highestBidderId,
              name: data.highestBidderName,
            },
          }));
          
          // Add new bid to history
          setBids((prevBids) => [data.newBid, ...prevBids]);
          
          // Update bid amount for the current user if they aren't the one who just bid
          if (session?.user?.id !== data.highestBidderId) {
            setBidAmount(data.amount + auction.minIncrement);
          }
        }
      });
    };

    socketInitializer();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [auction._id]);

  // Poll for updates every 30 seconds as a fallback
  useEffect(() => {
    const interval = setInterval(fetchUpdatedData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handlePurchase = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/auctions/${auction._id}/purchase`, {
        method: "POST",
      });
      if (res.ok) {
        router.push("/cart");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to initiate purchase");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const isSeller = session?.user?.id === auction.sellerId?._id;
  const isHighestBidder = session?.user?.id === (auction.highestBidderId?._id || auction.highestBidderId);
  const isEnded = auction.status === "ended" || new Date() > new Date(auction.endTime);
  const lastBidderId = bids[0]?.userId?._id || bids[0]?.userId;
  const isLastBidder = session?.user?.id === lastBidderId;

  const handleEndAuction = async () => {
    if (!confirm("Are you sure you want to end this auction early?")) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/auctions/${auction._id}/end`, { method: "POST" });
      if (res.ok) {
        await fetchUpdatedData();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to end auction");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12 relative">

      {/* Left: Images & Info */}
      <div className="xl:col-span-7 space-y-8">
        {/* Main Image Stage */}
        <div style={{ position: 'relative', paddingTop: '75%', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {auction.images && auction.images[activeImage] ? (
            <img
              src={auction.images[activeImage]}
              alt={auction.productTitle}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              <span style={{ fontSize: '4rem', marginBottom: '16px', opacity: 0.5 }}>📦</span>
              <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>No Image</span>
            </div>
          )}
          
          {/* Overlays */}
          {isEnded && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-20">
              <div className="bg-white/5 border border-white/10 px-8 py-4 rounded-2xl backdrop-blur-xl transform -rotate-6 shadow-2xl">
                <span className="text-white font-black text-3xl uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600">
                  Auction Ended
                </span>
              </div>
            </div>
          )}
          
          {!isEnded && isHighestBidder && (
            <div className="absolute top-6 left-6 z-10">
              <span className="bg-green-500/10 backdrop-blur-lg border border-green-500/30 text-green-400 px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-green-500/20 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Highest Bidder
              </span>
            </div>
          )}
        </div>
        
        {/* Thumbnails */}
        {auction.images && auction.images.length > 1 && (
          <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px' }} className="custom-scrollbar">
            {auction.images.map((img: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                style={{ 
                  position: 'relative', flexShrink: 0, width: '120px', height: '90px', borderRadius: '16px', overflow: 'hidden', 
                  border: activeImage === idx ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.05)',
                  opacity: activeImage === idx ? 1 : 0.6,
                  transition: 'opacity 0.2s, transform 0.2s'
                }}
              >
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        )}

        {/* Description Section */}
        <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '32px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '24px', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.2rem' }}>📝</span> About this item
          </h2>
          <p style={{ margin: 0, color: '#94a3b8', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {auction.description || "No description provided."}
          </p>
        </div>
      </div>

      {/* Right: Bidding Dashboard */}
      <div className="xl:col-span-5">
        <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '32px', position: 'sticky', top: '24px' }}>
          {/* Header Info */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#fbbf24', backgroundColor: 'rgba(245,158,11,0.1)', padding: '4px 10px', borderRadius: '999px', border: '1px solid rgba(245,158,11,0.2)' }}>
                {auction.category}
              </span>
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', backgroundColor: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.1)' }}>
                {auction.condition}
              </span>
              {isEnded ? (
                <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', padding: '4px 10px', borderRadius: '999px', border: '1px solid rgba(239,68,68,0.2)' }}>
                  Auction Ended
                </span>
              ) : (
                <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', padding: '4px 10px', borderRadius: '999px', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Live Auction
                </span>
              )}
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 3vw, 2.5rem)', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 8px 0', background: 'linear-gradient(135deg, #fff 60%, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {auction.productTitle}
            </h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#64748b', fontWeight: 600 }}>
              Sold by: <span style={{ color: '#e2e8f0' }}>{auction.sellerId?.name}</span>
            </p>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '16px', marginBottom: '32px' }}>
            <div style={{ backgroundColor: 'rgba(15,15,15,0.5)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', margin: '0 0 8px 0' }}>Current Bid</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '18px', color: '#64748b', fontWeight: 800 }}>₹</span>
                <span style={{ fontSize: '32px', fontWeight: 900, background: 'linear-gradient(135deg, #f59e0b, #d97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {auction.currentBid}
                </span>
              </div>
            </div>
            <div style={{ backgroundColor: 'rgba(15,15,15,0.5)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isEnded ? "Time Ended" : "Time Left"} 
                {!isEnded && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444', animation: 'pulse 2s infinite' }} />}
              </p>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                <CountdownTimer endTime={auction.endTime} onEnd={fetchUpdatedData} compact={false} />
              </div>
            </div>
          </div>

          {/* Bidding Actions */}
          {!isEnded ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {isSeller ? (
                <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '24px', borderRadius: '16px', textAlign: 'center' }}>
                  <p style={{ color: '#94a3b8', fontWeight: 700, margin: '0 0 16px 0' }}>⛔ You cannot bid on your own auction</p>
                  <button
                    type="button"
                    onClick={handleEndAuction}
                    disabled={submitting}
                    style={{ width: '100%', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '16px', borderRadius: '16px', fontWeight: 800, fontSize: '14px', border: '1px solid rgba(239, 68, 68, 0.2)', cursor: 'pointer' }}
                  >
                    End Auction Early
                  </button>
                </div>
              ) : isLastBidder ? (
                <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)', padding: '24px', borderRadius: '16px', textAlign: 'center' }}>
                  <p style={{ color: '#10b981', fontWeight: 800, margin: 0 }}>✅ You currently have the highest bid!</p>
                  <p style={{ color: '#64748b', fontSize: '13px', marginTop: '8px' }}>Wait for someone else to bid before you can bid again.</p>
                </div>
              ) : (
                <form onSubmit={handlePlaceBid} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {error && (
                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '16px', borderRadius: '12px', fontSize: '14px', fontWeight: 600 }}>
                      ⚠️ {error}
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '0 20px', transition: 'all 0.2s' }}>
                      <span style={{ fontSize: '20px', color: '#94a3b8', fontWeight: 800 }}>₹</span>
                      <input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(Number(e.target.value))}
                        min={minBid}
                        style={{ width: '100%', backgroundColor: 'transparent', border: 'none', padding: '20px 16px', fontSize: '24px', fontWeight: 900, color: '#f8fafc', outline: 'none' }}
                        disabled={submitting}
                      />
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      {[minBid, Math.ceil(auction.currentBid * 1.1), Math.ceil(auction.currentBid * 1.2)].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setBidAmount(val)}
                          style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#e2e8f0', padding: '12px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, border: '1px solid rgba(255,255,255,0.1)', transition: 'background-color 0.2s', cursor: 'pointer' }}
                        >
                          + ₹{val - auction.currentBid}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{ 
                      width: '100%', padding: '20px', borderRadius: '16px', fontWeight: 900, fontSize: '16px', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
                      backgroundColor: '#f59e0b',
                      color: '#000',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      boxShadow: '0 8px 24px rgba(245,158,11,0.25)'
                    }}
                  >
                    {submitting ? "Placing Bid..." : "Place Bid Now"}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '32px', borderRadius: '24px', textAlign: 'center' }}>
              {isHighestBidder ? (
                <div style={{ padding: '24px', backgroundColor: 'rgba(16, 185, 129, 0.05)', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.2)', textAlign: 'center' }}>
                  <div style={{ fontSize: '40px', marginBottom: '16px' }}>🏆</div>
                  <p style={{ color: '#10b981', fontWeight: 800, marginBottom: '8px', fontSize: '1.25rem' }}>🎉 You won this auction!</p>
                  <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}> Winning Price: <span style={{ color: '#fbbf24', fontWeight: 800 }}>₹{auction.currentBid?.toLocaleString('en-IN')}</span></p>
                  <button 
                    onClick={handlePurchase}
                    disabled={submitting}
                    style={{ width: '100%', backgroundColor: '#10b981', color: '#000', padding: '18px', borderRadius: '16px', fontWeight: 900, fontSize: '16px', border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)', transition: 'all 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    🛒 Proceed to Buy
                  </button>
                </div>
              ) : (
                <div style={{ padding: '24px', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>❌</div>
                  <p style={{ color: '#94a3b8', fontWeight: 700, margin: 0 }}>Auction Ended</p>
                  <p style={{ color: '#64748b', fontSize: '13px', marginTop: '8px' }}>
                    Winner: <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{auction.highestBidderId?.name || "No Bids"}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Bid History (Stylized Timeline) */}
          <div style={{ marginTop: '48px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              Bid History
              <span style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.05)' }} />
              <span style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', color: '#e2e8f0' }}>{bids.length}</span>
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto', paddingRight: '16px' }} className="custom-scrollbar">
              {bids.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px' }}>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '14px', fontWeight: 600 }}>Be the first to bid!</p>
                </div>
              ) : (
                bids.map((bid, idx) => (
                  <div key={bid._id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.02)', transition: 'background-color 0.2s' }}>
                    {/* Rank indicator */}
                    <div style={{ 
                      flexShrink: 0, width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '12px',
                      backgroundColor: idx === 0 ? 'rgba(245,158,11,0.1)' : 'transparent',
                      border: idx === 0 ? '1px solid rgba(245,158,11,0.5)' : '1px solid rgba(255,255,255,0.1)',
                      color: idx === 0 ? '#f59e0b' : '#64748b',
                      boxShadow: idx === 0 ? '0 0 10px rgba(245,158,11,0.2)' : 'none'
                    }}>
                      #{idx + 1}
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: idx === 0 ? '#f8fafc' : '#94a3b8' }}>
                        {bid.userId?.name}
                      </p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>
                        {formatDistanceToNow(new Date(bid.createdAt))} ago
                      </p>
                    </div>
                    
                    <p style={{ margin: 0, textAlign: 'right', fontWeight: 900, fontSize: idx === 0 ? '20px' : '16px', color: idx === 0 ? '#f59e0b' : '#64748b' }}>
                      ₹{bid.amount}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
