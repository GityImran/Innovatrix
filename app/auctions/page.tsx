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
    <>
      <Header />
      <CategoriesNav />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#080808', color: '#e2e8f0' }}>
        <main style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', padding: '32px 24px', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', marginBottom: '16px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.5)' }}></span>
                Live Marketplace
              </div>
              
              <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 12px 0', color: '#f8fafc' }}>
                Discover <span style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Premium Deals</span>
              </h1>
              <p style={{ margin: 0, fontSize: '16px', color: '#64748b', maxWidth: '600px', lineHeight: 1.6 }}>
                Bid on pre-owned textbooks, electronics, and rare finds. Dominate the CampusMart auction floor.
              </p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', padding: '16px 24px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>
                Active Listings
              </span>
              <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#f8fafc', lineHeight: 1 }}>
                {auctions.length.toString().padStart(2, '0')}
              </span>
            </div>
          </div>

          {auctions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '4rem', display: 'block', marginBottom: '20px', opacity: 0.5 }}>🏷️</span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 8px 0', color: '#f1f5f9' }}>The Floor is Quiet</h2>
              <p style={{ margin: 0, color: '#64748b' }}>There are no active auctions right now. Check back later or start your own!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
              {auctions.map((auction: any) => (
                <AuctionCard key={auction._id} auction={auction} />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
