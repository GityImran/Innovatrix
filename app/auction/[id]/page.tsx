import React from "react";
import Header from "@/app/components/Header/Header";
import CategoriesNav from "@/app/components/CategoriesNav/CategoriesNav";
import AuctionDetailClient from "./AuctionDetailClient";
import { connectToDatabase } from "@/lib/mongodb";
import Auction from "@/models/Auction";
import Bid from "@/models/Bid";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function getAuctionData(id: string) {
  await connectToDatabase();
  
  const auction = await Auction.findById(id)
    .populate("sellerId", "name")
    .populate("highestBidderId", "name")
    .lean();
    
  if (!auction) return null;

  const bids = await Bid.find({ auctionId: id })
    .populate("userId", "name")
    .sort({ amount: -1 })
    .limit(20)
    .lean();

  return {
    auction: JSON.parse(JSON.stringify(auction)),
    bids: JSON.parse(JSON.stringify(bids)),
  };
}

export default async function AuctionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getAuctionData(id);
  const session = await auth();

  if (!data) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        <Header />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl font-black mb-4">Auction not found</h1>
          <p className="text-zinc-500">The auction you are looking for does not exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Header />
      <CategoriesNav />

      <main className="container mx-auto px-4 py-12">
        <AuctionDetailClient
          initialAuction={data.auction}
          initialBids={data.bids}
          session={session}
        />
      </main>
    </div>
  );
}
