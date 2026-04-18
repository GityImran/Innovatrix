"use client";

import React from "react";
import Link from "next/link";
import CountdownTimer from "./CountdownTimer";

interface AuctionCardProps {
  auction: {
    _id: string;
    productTitle: string;
    currentBid: number;
    endTime: string | Date;
    images: string[];
    condition: string;
    category: string;
  };
}

export default function AuctionCard({ auction }: AuctionCardProps) {
  const isEndingSoon = new Date(auction.endTime).getTime() - Date.now() < 3600000; // < 1 hour

  return (
    <div className="group relative bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden hover:border-yellow-500/30 hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_0_40px_-10px_rgba(234,179,8,0.15)] flex flex-col">
      {/* Image Container */}
      <div className="relative aspect-[4/3] bg-zinc-900 overflow-hidden">
        {auction.images && auction.images[0] ? (
          <img
            src={auction.images[0]}
            alt={auction.productTitle}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 bg-zinc-900 border-b border-white/5">
            <span className="text-4xl mb-2">📦</span>
            <span className="text-xs uppercase font-bold tracking-widest text-zinc-700">No Image</span>
          </div>
        )}
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex gap-2 z-10">
          <span className="bg-black/50 backdrop-blur-md text-white text-[10px] px-3 py-1.5 rounded-full uppercase font-bold tracking-widest border border-white/10 shadow-xl">
            {auction.condition}
          </span>
          {isEndingSoon && (
            <span className="bg-red-500/80 backdrop-blur-md text-white text-[10px] px-3 py-1.5 rounded-full uppercase font-black tracking-widest animate-pulse border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
              ⏳ Ending Soon
            </span>
          )}
        </div>

        {/* Timer Badge (Bottom Left) */}
        <div className="absolute bottom-3 left-3 z-10 transition-transform duration-300 group-hover:-translate-y-1">
          <div className="bg-black/70 backdrop-blur-xl px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2 shadow-2xl">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Ends in</span>
            <CountdownTimer endTime={auction.endTime} />
          </div>
        </div>

        {/* Gradient Overlay for legibility */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
      </div>

      {/* Content Container */}
      <div className="p-5 flex flex-col flex-grow relative z-20 bg-[#0a0a0a]">
        <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-[0.2em] mb-2 block">
          {auction.category}
        </span>
        
        <h3 className="text-lg font-bold text-white mb-6 line-clamp-2 leading-tight group-hover:text-yellow-400 transition-colors duration-300">
          {auction.productTitle}
        </h3>
        
        <div className="mt-auto pt-4 border-t border-white/5 flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">
              Highest Bid
            </span>
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
              ₹{auction.currentBid}
            </span>
          </div>
          
          <Link
            href={`/auction/${auction._id}`}
            className="group/btn relative overflow-hidden bg-white/5 hover:bg-yellow-500 text-white hover:text-black text-xs font-black uppercase tracking-widest px-5 py-3 rounded-xl transition-all duration-300 border border-white/10 hover:border-yellow-400 shadow-lg"
          >
            <span className="relative z-10 flex items-center gap-2">
              Bid Now
              <span className="transition-transform duration-300 group-hover/btn:translate-x-1">→</span>
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
