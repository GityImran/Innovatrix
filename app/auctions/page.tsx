import React from "react";
import Header from "@/app/components/Header/Header";
import CategoriesNav from "@/app/components/CategoriesNav/CategoriesNav";
import AuctionCard from "@/app/components/Auction/AuctionCard";
import { connectToDatabase } from "@/lib/mongodb";
import Auction from "@/models/Auction";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function getAuctions(userId?: string) {
  await connectToDatabase();
  const now = new Date();
  
  // Auto-end expired auctions
  await Auction.updateMany(
    { status: "active", endTime: { $lt: now } },
    { $set: { status: "ended" } }
  );

  const liveAuctions = await Auction.find({ status: "active" })
    .sort({ endTime: 1 })
    .lean();
    
  const pastAuctions = await Auction.find({ status: { $in: ["ended", "sold"] } })
    .sort({ endTime: -1 })
    .limit(12)
    .populate("highestBidderId", "name")
    .lean();

  let wonAuctions: Record<string, unknown>[] = [];
  if (userId) {
    wonAuctions = await Auction.find({
      status: { $in: ["ended", "sold"] },
      highestBidderId: userId
    })
    .sort({ endTime: -1 })
    .lean();
  }
    
  return {
    live: JSON.parse(JSON.stringify(liveAuctions)),
    past: JSON.parse(JSON.stringify(pastAuctions)),
    won: JSON.parse(JSON.stringify(wonAuctions))
  };
}

export default async function AuctionsPage() {
  const session = await auth();
  const { live, past, won } = await getAuctions(session?.user?.id);

  return (
    <>
      <Header />
      <CategoriesNav />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#080808', color: '#e2e8f0' }}>
        <main style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', padding: '32px 24px', width: '100%' }}>
          {/* Hero Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', marginBottom: '16px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.5)' }}></span>
                Campus Auction Floor
              </div>
              
              <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 12px 0', color: '#f8fafc' }}>
                Bid. Win. <span style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Dominate.</span>
              </h1>
              <p style={{ margin: 0, fontSize: '16px', color: '#64748b', maxWidth: '600px', lineHeight: 1.6 }}>
                Real-time bidding on campus essentials. From textbooks to tech, get the best deals before they're gone.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
               <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', padding: '12px 20px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>Live</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f8fafc' }}>{live.length}</span>
              </div>
              {won.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', padding: '12px 20px', borderRadius: '16px', backgroundColor: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#10b981' }}>Won</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981' }}>{won.length}</span>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 1: LIVE AUCTIONS */}
          <section style={{ marginBottom: '64px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f8fafc', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.5rem' }}>🔥</span> Live Auctions
              <span style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.05)' }} />
            </h2>
            
            {live.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                <p style={{ margin: 0, color: '#64748b', fontWeight: 600 }}>No live auctions at the moment.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {live.map((auction: any) => (
                  <AuctionCard key={auction._id} auction={auction} />
                ))}
              </div>
            )}
          </section>

          {/* SECTION 2: WON AUCTIONS (Only if any) */}
          {won.length > 0 && (
            <section style={{ marginBottom: '64px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10b981', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.5rem' }}>🏆</span> Auctions You Won
                <span style={{ flex: 1, height: '1px', backgroundColor: 'rgba(16,185,129,0.1)' }} />
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {won.map((auction: any) => (
                  <AuctionCard key={auction._id} auction={auction} />
                ))}
              </div>
            </section>
          )}

          {/* SECTION 3: PAST AUCTIONS */}
          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#94a3b8', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.5rem' }}>🏁</span> Past Auctions
              <span style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.05)' }} />
            </h2>
            
            {past.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                <p style={{ margin: 0, color: '#64748b', fontWeight: 600 }}>No past auctions found.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {past.map((auction: any) => (
                  <AuctionCard key={auction._id} auction={auction} />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </>
  );
}
