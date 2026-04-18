import React from "react";
import { connectToDatabase } from "@/lib/mongodb";
import Auction from "@/models/Auction";
import Bid from "@/models/Bid";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import Header from "@/app/components/Header/Header";
import { formatDistanceToNow } from "date-fns";

export default async function SellerAuctionDashboard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  await connectToDatabase();

  const auction = await Auction.findById(id).populate("highestBidderId", "name");
  if (!auction) notFound();

  // Security check: Only the seller can access this dashboard
  if (auction.sellerId.toString() !== session.user.id) {
    redirect("/dashboard");
  }

  const bids = await Bid.find({ auctionId: id })
    .sort({ amount: -1 })
    .populate("userId", "name")
    .lean();

  const isEnded = auction.status === "ended" || new Date() > new Date(auction.endTime);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#080808', color: '#e2e8f0' }}>
      <Header />
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '8px', background: 'linear-gradient(135deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Auction Dashboard
          </h1>
          <p style={{ color: '#64748b' }}>Manage your auction and track bids in real-time</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
          {/* Left Column: Details & History */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Auction Info Card */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '4px' }}>{auction.title}</h2>
                  <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Category: {auction.category}</span>
                </div>
                <span style={{ 
                  padding: '6px 16px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase',
                  backgroundColor: isEnded ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                  color: isEnded ? '#ef4444' : '#10b981',
                  border: `1px solid ${isEnded ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`
                }}>
                  {isEnded ? "Ended" : "Live"}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                <div>
                  <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Current Bid</p>
                  <p style={{ fontSize: '2rem', fontWeight: 900, color: '#fbbf24' }}>₹{auction.currentBid.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Starting Price</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#e2e8f0' }}>₹{auction.startingPrice.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Total Bids</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#e2e8f0' }}>{bids.length}</p>
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Time Left</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 800, color: isEnded ? '#64748b' : '#f8fafc' }}>
                    {isEnded ? "Auction Ended" : formatDistanceToNow(new Date(auction.endTime))}
                  </p>
                </div>
              </div>
            </div>

            {/* Bid History */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '32px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '24px' }}>Bid History</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {bids.length === 0 ? (
                  <p style={{ color: '#475569', textAlign: 'center', fontStyle: 'italic' }}>No bids placed yet</p>
                ) : (
                  bids.map((bid: any, index: number) => (
                    <div key={bid._id.toString()} style={{ 
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                      padding: '16px 20px', borderRadius: '16px', backgroundColor: index === 0 ? 'rgba(245,158,11,0.05)' : 'rgba(255,255,255,0.02)',
                      border: index === 0 ? '1px solid rgba(245,158,11,0.2)' : '1px solid rgba(255,255,255,0.04)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>👤</div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: '14px' }}>{bid.userId?.name}</p>
                          <p style={{ margin: 0, fontSize: '11px', color: '#475569' }}>{formatDistanceToNow(new Date(bid.createdAt))} ago</p>
                        </div>
                      </div>
                      <span style={{ fontWeight: 900, color: index === 0 ? '#fbbf24' : '#e2e8f0' }}>₹{bid.amount.toLocaleString('en-IN')}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Winner & Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ background: 'linear-gradient(145deg, rgba(20,20,20,0.9), rgba(10,10,10,0.9))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '32px', position: 'sticky', top: '40px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '24px' }}>
                {isEnded ? "🏆 Final Result" : "🔥 Highest Bidder"}
              </h3>

              {auction.highestBidderId ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>{isEnded ? "👑" : "💎"}</div>
                  <p style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '4px' }}>{auction.highestBidderId?.name}</p>
                  <p style={{ color: '#fbbf24', fontWeight: 800, fontSize: '1.25rem' }}>₹{auction.currentBid.toLocaleString('en-IN')}</p>
                  
                  {isEnded && (
                    <div style={{ marginTop: '24px', padding: '16px', borderRadius: '16px', backgroundColor: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)' }}>
                      <p style={{ margin: 0, fontSize: '12px', color: '#10b981', fontWeight: 700 }}>Winner identified. Waiting for payment.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <p style={{ color: '#475569', fontStyle: 'italic' }}>No winner yet</p>
                </div>
              )}

              {!isEnded && (
                <div style={{ marginTop: '32px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '32px' }}>
                   <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6, marginBottom: '24px' }}>
                    Ending the auction early will finalize the current highest bidder as the winner.
                  </p>
                  {/* Since this is a server component, we link to the detail page for action or handle via a separate client component if needed. For now, let's keep it simple. */}
                  <a 
                    href={`/auction/${auction._id}`}
                    style={{ 
                      display: 'block', width: '100%', padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(239,68,68,0.1)', 
                      color: '#ef4444', textDecoration: 'none', textAlign: 'center', fontWeight: 800, fontSize: '14px', border: '1px solid rgba(239,68,68,0.2)' 
                    }}
                  >
                    Go to End Auction
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
