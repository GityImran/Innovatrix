import React from "react";
import Header from "@/app/components/Header/Header";
import CategoriesNav from "@/app/components/CategoriesNav/CategoriesNav";
import AuctionCard from "@/app/components/Auction/AuctionCard";
import { connectToDatabase } from "@/lib/mongodb";
import Auction from "@/models/Auction";

export const dynamic = "force-dynamic";

async function getAuctions() {
  await connectToDatabase();
  const now = new Date();
  
  // Auto-end expired auctions
  await Auction.updateMany(
    { status: "active", endTime: { $lt: now } },
    { $set: { status: "ended" } }
  );

  const auctions = await Auction.find({ status: "active" })
    .sort({ endTime: 1 })
    .lean();
    
  return JSON.parse(JSON.stringify(auctions));
}

export default async function AuctionsPage() {
  const auctions = await getAuctions();

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-yellow-500/30 selection:text-yellow-200">
      <Header />
      <CategoriesNav />

      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-yellow-500/10 blur-[120px] rounded-full pointer-events-none opacity-50 mix-blend-screen -z-10" />

      <main className="container mx-auto px-4 py-16 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16 border-b border-white/5 pb-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-zinc-400 mb-6">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
              Live Marketplace
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter">
              Discover <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500">
                Premium Deals.
              </span>
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed max-w-xl">
              Bid on pre-owned textbooks, electronics, and rare finds. Dominate the CampusMart auction floor.
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-2 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="text-sm font-bold uppercase tracking-widest text-zinc-500 relative z-10">
              Active Listings
            </span>
            <span className="text-5xl font-black text-white relative z-10 tracking-tighter">
              {auctions.length.toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        {auctions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white/[0.02] rounded-[3rem] border border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
            <div className="text-7xl mb-8 relative">
              <div className="absolute inset-0 blur-2xl bg-yellow-400/20 rounded-full scale-150" />
              <span className="relative z-10">🏷️</span>
            </div>
            <h2 className="text-3xl font-black mb-4 tracking-tight">The Floor is Quiet</h2>
            <p className="text-zinc-500 text-lg max-w-md text-center mb-8">
              There are no active auctions right now. Check back later or start your own!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {auctions.map((auction: any, idx: number) => (
              <div key={auction._id} style={{ animationFillMode: 'both', animationDelay: `${idx * 100}ms` }} className="animate-fade-in-up">
                <AuctionCard auction={auction} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
