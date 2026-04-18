import React from "react";
import Link from "next/link";
import Header from "@/app/components/Header/Header";
import CategoriesNav from "@/app/components/CategoriesNav/CategoriesNav";
import { connectToDatabase } from "@/lib/mongodb";
import Auction from "@/models/Auction";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function getSellerAuctions(userId: string) {
  await connectToDatabase();
  const auctions = await Auction.find({ sellerId: userId })
    .sort({ createdAt: -1 })
    .lean();
  return JSON.parse(JSON.stringify(auctions));
}

export default async function SellerAuctionsPage() {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/login");
  }

  const auctions = await getSellerAuctions(session.user.id);
  const activeAuctions = auctions.filter((a: any) => a.status === "active");
  const endedAuctions = auctions.filter((a: any) => a.status === "ended");

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-yellow-500/30 selection:text-yellow-200">
      <Header />
      <CategoriesNav />

      {/* Decorative Glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-yellow-500/10 blur-[150px] rounded-full pointer-events-none opacity-40 mix-blend-screen -z-10" />

      <main className="container mx-auto px-4 py-16 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 border-b border-white/5 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">
              Seller Dashboard
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">My Auctions</h1>
            <p className="text-zinc-500 mt-2 text-lg">Manage your live listings and ended auctions.</p>
          </div>
          <Link
            href="/seller/auctions/create"
            className="group relative overflow-hidden bg-yellow-500 text-black font-black px-8 py-4 rounded-2xl transition-all duration-300 shadow-[0_0_30px_rgba(234,179,8,0.2)] hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3 border border-yellow-400"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative z-10 text-xl leading-none">+</span> 
            <span className="relative z-10">Create Auction</span>
          </Link>
        </div>

        <div className="space-y-16">
          {/* Active Auctions */}
          <section>
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <h2 className="text-2xl font-black tracking-tight">Active Listings</h2>
              <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-green-500 text-xs font-bold uppercase tracking-widest">{activeAuctions.length} Live</span>
              </div>
            </div>
            
            {activeAuctions.length === 0 ? (
              <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-[2.5rem] p-16 text-center shadow-inner relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
                <div className="relative z-10 max-w-md mx-auto">
                  <span className="text-5xl mb-4 block">📡</span>
                  <h3 className="text-2xl font-bold mb-2">No Active Auctions</h3>
                  <p className="text-zinc-500 mb-8">List an item to start receiving bids from the campus community.</p>
                  <Link href="/seller/auctions/create" className="text-yellow-500 font-bold hover:text-yellow-400 transition-colors uppercase tracking-widest text-sm">
                    Start Selling →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {activeAuctions.map((auction: any) => (
                  <SellerAuctionCard key={auction._id} auction={auction} />
                ))}
              </div>
            )}
          </section>

          {/* Ended Auctions */}
          <section>
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <h2 className="text-2xl font-black tracking-tight text-zinc-500">Ended Auctions</h2>
              <span className="bg-white/5 border border-white/10 text-zinc-500 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                {endedAuctions.length} Total
              </span>
            </div>
            
            {endedAuctions.length === 0 ? (
              <div className="bg-white/[0.02] border border-dashed border-white/5 rounded-[2.5rem] p-12 text-center text-zinc-600">
                You have no past auctions.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {endedAuctions.map((auction: any) => (
                  <SellerAuctionCard key={auction._id} auction={auction} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function SellerAuctionCard({ auction }: { auction: any }) {
  const isActive = auction.status === "active";
  
  return (
    <div className={`group relative bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col ${
      isActive 
      ? "hover:border-yellow-500/30 hover:-translate-y-1 hover:shadow-[0_0_40px_-10px_rgba(234,179,8,0.15)]" 
      : "opacity-70 hover:opacity-100 grayscale hover:grayscale-0"
    }`}>
      {/* Image Container */}
      <div className="aspect-[4/3] relative overflow-hidden bg-zinc-900 border-b border-white/5">
        {auction.images?.[0] ? (
          <img
            src={auction.images[0]}
            alt={auction.productTitle}
            className={`w-full h-full object-cover transition-transform duration-700 ${isActive ? "group-hover:scale-110" : ""}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl opacity-50">📦</div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3 z-10">
          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border backdrop-blur-md shadow-xl ${
            isActive 
            ? "bg-green-500/20 text-green-400 border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.3)]" 
            : "bg-zinc-900/80 text-zinc-400 border-zinc-700 shadow-none"
          }`}>
            {auction.status}
          </span>
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
      </div>

      {/* Content Container */}
      <div className="p-5 flex flex-col flex-grow relative z-20 bg-[#0a0a0a]">
        <h3 className="font-bold text-white text-lg line-clamp-2 leading-tight mb-6 transition-colors group-hover:text-yellow-400">
          {auction.productTitle}
        </h3>
        
        <div className="mt-auto flex items-end justify-between pt-4 border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">
              {isActive ? "Current Bid" : "Final Bid"}
            </span>
            <span className={`text-xl font-black ${isActive ? "text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600" : "text-white"}`}>
              ₹{auction.currentBid}
            </span>
          </div>
          
          <Link
            href={`/auction/${auction._id}`}
            className="group/btn relative overflow-hidden bg-white/5 hover:bg-yellow-500 text-white hover:text-black text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all duration-300 border border-white/10 hover:border-yellow-400"
          >
            <span className="relative z-10 flex items-center gap-1.5">
              View
              <span className="transition-transform duration-300 group-hover/btn:translate-x-1">→</span>
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
