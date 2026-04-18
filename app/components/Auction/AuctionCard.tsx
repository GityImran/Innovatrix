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
  const isEndingSoon = new Date(auction.endTime).getTime() - Date.now() < 3600000;

  return (
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        backgroundColor: '#0a0a0a', 
        border: '1px solid rgba(255,255,255,0.1)', 
        borderRadius: '24px', 
        overflow: 'hidden', 
        transition: 'transform 0.3s, box-shadow 0.3s',
        cursor: 'pointer',
        height: '100%'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.6)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      
      {/* Image Section */}
      <div style={{ position: 'relative', paddingTop: '75%', backgroundColor: '#111', borderBottom: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        {auction.images && auction.images[0] ? (
          <img
            src={auction.images[0]}
            alt={auction.productTitle}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b', backgroundColor: '#0a0a0a' }}>
            <span style={{ fontSize: '48px', marginBottom: '8px', opacity: 0.5 }}>📦</span>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.1em' }}>No Image</span>
          </div>
        )}
        
        {/* Top Badges */}
        <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '8px', zIndex: 10 }}>
          <span style={{ backgroundColor: 'rgba(0,0,0,0.8)', color: '#fff', fontSize: '10px', padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em', border: '1px solid rgba(255,255,255,0.1)' }}>
            {auction.condition}
          </span>
          {isEndingSoon && (
            <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.9)', color: '#fff', fontSize: '10px', padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em', border: '1px solid rgba(239, 68, 68, 0.5)', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}>
              Ending Soon
            </span>
          )}
        </div>

        {/* Timer Badge */}
        <div style={{ position: 'absolute', bottom: '16px', left: '16px', zIndex: 10 }}>
          <div style={{ backgroundColor: 'rgba(0,0,0,0.9)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.5)' }}>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 800, color: '#94a3b8' }}>Ends In</span>
            <div style={{ color: '#fff', fontSize: '12px', fontFamily: 'monospace', fontWeight: 700 }}>
              <CountdownTimer endTime={auction.endTime} />
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1, backgroundColor: '#0a0a0a' }}>
        <div style={{ marginBottom: '12px' }}>
          <span style={{ color: '#fbbf24', fontSize: '10px', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            {auction.category}
          </span>
        </div>
        
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#f1f5f9', margin: '0 0 20px 0', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {auction.productTitle}
        </h3>
        
        {/* Bottom Actions Row */}
        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>
              Current Bid
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 700 }}>₹</span>
              <span style={{ fontSize: '24px', fontWeight: 900, color: '#fff' }}>
                {auction.currentBid}
              </span>
            </div>
          </div>
          
          <Link
            href={`/auction/${auction._id}`}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f59e0b', color: '#000', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', padding: '12px 20px', borderRadius: '12px', textDecoration: 'none', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)' }}
          >
            Bid Now <span style={{ fontSize: '12px' }}>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
