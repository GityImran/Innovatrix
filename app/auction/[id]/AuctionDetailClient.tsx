"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CountdownTimer from "@/app/components/Auction/CountdownTimer";
import { formatDistanceToNow } from "date-fns";

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

  // Poll for updates every 10 seconds
  useEffect(() => {
    const interval = setInterval(fetchUpdatedData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAcceptOffer = async () => {
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/auctions/${auction._id}/purchase`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to initiate purchase");
      }

      router.push("/cart");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const isSeller = session?.user?.id === auction.sellerId?._id;
  const isHighestBidder = session?.user?.id === (auction.highestBidderId?._id || auction.highestBidderId);
  const isEnded = auction.status === "ended" || new Date() > new Date(auction.endTime);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12 relative">
      {/* Decorative background glow for the detail page */}
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-yellow-500/10 blur-[150px] rounded-full pointer-events-none opacity-40 mix-blend-screen -z-10" />

      {/* Left: Images & Info */}
      <div className="xl:col-span-7 space-y-8">
        {/* Main Image Stage */}
        <div className="relative pt-[75%] bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden group shadow-2xl shadow-black">
          {auction.images && auction.images[activeImage] ? (
            <img
              src={auction.images[activeImage]}
              alt={auction.productTitle}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600 bg-[#0a0a0a]">
              <span className="text-6xl mb-4 opacity-50">📦</span>
              <span className="text-sm font-bold uppercase tracking-widest text-zinc-700">No Image</span>
            </div>
          )}
          
          {/* Gradients */}
          <div className="absolute inset-0 border-[4px] border-white/5 rounded-[2.5rem] pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

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
          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
            {auction.images.map((img: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`relative flex-shrink-0 w-32 h-24 rounded-2xl overflow-hidden transition-all duration-300 ${
                  activeImage === idx 
                    ? "ring-2 ring-yellow-500 scale-[1.02] shadow-[0_0_20px_rgba(234,179,8,0.2)]" 
                    : "border border-white/5 opacity-50 hover:opacity-100 hover:scale-[1.02]"
                }`}
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Description Section */}
        <div className="bg-[#0a0a0a]/80 backdrop-blur-sm border border-white/5 rounded-3xl p-8 lg:p-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1 h-6 bg-yellow-500 rounded-full" />
            <h2 className="text-2xl font-bold">About this item</h2>
          </div>
          <p className="text-zinc-400 leading-relaxed whitespace-pre-wrap text-lg">
            {auction.description || "No description provided."}
          </p>
        </div>
      </div>

      {/* Right: Bidding Dashboard */}
      <div className="xl:col-span-5">
        <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 lg:p-10 sticky top-24 shadow-2xl">
          {/* Header Info */}
          <div className="mb-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-xs font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full">
                {auction.category}
              </span>
              <span className="bg-white/5 text-zinc-300 border border-white/10 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                {auction.condition}
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-2">
              {auction.productTitle}
            </h1>
            <p className="text-zinc-500 text-sm font-bold tracking-widest uppercase">
              Sold by: <span className="text-zinc-300">{auction.sellerId?.name}</span>
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-[#0a0a0a] p-5 rounded-3xl border border-white/5">
              <p className="text-zinc-500 text-xs uppercase font-bold tracking-widest mb-2">Current Bid</p>
              <div className="flex items-baseline gap-1">
                <span className="text-lg text-zinc-400 font-bold">₹</span>
                <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                  {auction.currentBid}
                </p>
              </div>
            </div>
            <div className="bg-[#0a0a0a] p-5 rounded-3xl border border-white/5">
              <p className="text-zinc-500 text-xs uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                {isEnded ? "Time Ended" : "Time Left"} 
                {!isEnded && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
              </p>
              <div className="text-2xl pt-1">
                <CountdownTimer endTime={auction.endTime} onEnd={fetchUpdatedData} compact={false} />
              </div>
            </div>
          </div>

          {/* Bidding Actions */}
          {!isEnded ? (
            <form onSubmit={handlePlaceBid} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-2xl font-bold flex items-center gap-3">
                  <span>⚠️</span> {error}
                </div>
              )}
              
              <div className="space-y-3">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
                  <div className="relative flex items-center bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden focus-within:border-yellow-500/50 transition-colors">
                    <span className="pl-6 text-zinc-500 font-bold text-xl">₹</span>
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(Number(e.target.value))}
                      min={minBid}
                      className="w-full bg-transparent py-5 px-4 text-2xl font-black text-white focus:outline-none"
                      disabled={submitting || isSeller}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[minBid, Math.ceil(auction.currentBid * 1.1), Math.ceil(auction.currentBid * 1.2)].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setBidAmount(val)}
                      className="bg-white/5 hover:bg-white/10 text-zinc-300 py-3 rounded-xl text-sm font-bold transition-all border border-white/5 hover:border-white/20"
                    >
                      + ₹{val - auction.currentBid}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || isSeller}
                className={`w-full py-5 rounded-2xl font-black text-lg transition-all duration-300 relative overflow-hidden group ${
                  isSeller 
                  ? "bg-white/5 text-zinc-600 cursor-not-allowed" 
                  : "bg-yellow-500 text-black hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(234,179,8,0.3)]"
                }`}
              >
                {!isSeller && (
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                )}
                <span className="relative z-10">
                  {submitting ? "Placing Bid..." : isSeller ? "Your Listing" : "Place Bid Now"}
                </span>
              </button>
            </form>
          ) : (
            <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl text-center shadow-inner">
              <p className="text-zinc-500 font-bold mb-2 uppercase text-xs tracking-[0.2em]">Highest Bidder</p>
              <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-2">
                {auction.highestBidderId?.name || "No Bids"}
              </p>
              
              {isHighestBidder && (
                <div className="mt-8 pt-8 border-t border-white/5">
                  <p className="text-green-400 font-bold mb-4">🎉 You won this auction!</p>
                  <button 
                    className="w-full bg-green-500 hover:bg-green-400 text-black py-4 rounded-2xl font-black text-lg shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                    onClick={handleAcceptOffer}
                    disabled={submitting}
                  >
                    {submitting ? "Processing..." : "Claim & Checkout"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Bid History (Stylized Timeline) */}
          <div className="mt-12">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-3">
              Bid History
              <span className="flex-1 h-px bg-white/5" />
              <span className="bg-white/10 px-2 py-1 rounded text-zinc-300">{bids.length}</span>
            </h3>
            
            <div className="space-y-1 max-h-[250px] overflow-y-auto custom-scrollbar pr-4 relative">
              {bids.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-white/10 rounded-2xl">
                  <p className="text-zinc-600 text-sm font-bold">Be the first to bid!</p>
                </div>
              ) : (
                bids.map((bid, idx) => (
                  <div key={bid._id} className="group relative flex items-center gap-4 py-3 px-4 rounded-2xl hover:bg-white/5 transition-colors">
                    {/* Rank indicator */}
                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-black text-xs border ${
                      idx === 0 
                        ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.2)]" 
                        : "bg-transparent border-white/10 text-zinc-600"
                    }`}>
                      #{idx + 1}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${idx === 0 ? "text-white" : "text-zinc-400"}`}>
                        {bid.userId?.name}
                      </p>
                      <p className="text-xs text-zinc-600 font-mono">
                        {formatDistanceToNow(new Date(bid.createdAt))} ago
                      </p>
                    </div>
                    
                    <p className={`text-right font-black tracking-tight ${idx === 0 ? "text-xl text-yellow-500" : "text-base text-zinc-500"}`}>
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
