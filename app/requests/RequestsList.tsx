"use client";

import React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function RequestsList({ requests }: { requests: any[] }) {
  return (
    <>
      <style>{`
        .rq-card { transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s; }
        .rq-card:hover { border-color: rgba(255,255,255,0.18) !important; transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.5); }
      `}</style>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {requests.map((request) => (
          <div 
            key={request._id} 
            className="rq-card"
            style={{ 
              background: 'linear-gradient(145deg, rgba(20,20,20,0.9), rgba(10,10,10,0.9))',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '20px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Glow accent */}
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(245,158,11,0.05)', borderRadius: '50%', filter: 'blur(30px)', pointerEvents: 'none' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', position: 'relative' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '4px 12px', borderRadius: '999px', fontSize: '10px', fontWeight: 800,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                background: 'rgba(245,158,11,0.1)', color: '#fbbf24',
                border: '1px solid rgba(245,158,11,0.2)',
              }}>
                {request.category}
              </span>
              <span style={{ fontSize: '12px', color: '#475569', fontWeight: 500 }}>
                {formatDistanceToNow(new Date(request.createdAt))} ago
              </span>
            </div>
            
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 20px 0', color: '#f8fafc', lineHeight: 1.3 }}>
              {request.title}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px', flex: 1, position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', fontSize: '13px' }}>
                <span style={{ width: '80px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '11px' }}>Budget</span>
                <span style={{ color: '#fbbf24', fontWeight: 800, fontSize: '16px' }}>₹{request.budget?.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', fontSize: '13px' }}>
                <span style={{ width: '80px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '11px' }}>Condition</span>
                <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{request.condition}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', fontSize: '13px' }}>
                <span style={{ width: '80px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '11px' }}>Buyer</span>
                <span style={{ color: '#94a3b8' }}>{request.userId?.name}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', position: 'relative' }}>
              <Link 
                href={`/requests/${request._id}`}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#e2e8f0',
                  fontSize: '13px',
                  fontWeight: 700,
                  padding: '10px 0',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  border: '1px solid rgba(255,255,255,0.1)',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                Details
              </Link>
              <Link 
                href={`/requests/${request._id}`}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  background: 'rgba(245,158,11,0.1)',
                  color: '#fbbf24',
                  fontSize: '13px',
                  fontWeight: 800,
                  padding: '10px 0',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  border: '1px solid rgba(245,158,11,0.25)',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#f59e0b'; e.currentTarget.style.color = '#000'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(245,158,11,0.1)'; e.currentTarget.style.color = '#fbbf24'; }}
              >
                Fulfill
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
