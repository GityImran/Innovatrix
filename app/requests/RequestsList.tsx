"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

export default function RequestsList({ 
  requests, 
  isOwnSection = false,
  onFulfillClick
}: { 
  requests: any[], 
  isOwnSection?: boolean,
  onFulfillClick?: (requestId: string) => void
}) {
  const router = useRouter();
  const [requestOffers, setRequestOffers] = useState<Record<string, any[]>>({});
  const [loadingOffers, setLoadingOffers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOwnSection) {
      requests.forEach(req => {
        fetchOffers(req._id);
      });
    }
  }, [isOwnSection, requests]);

  const fetchOffers = async (requestId: string) => {
    setLoadingOffers(prev => ({ ...prev, [requestId]: true }));
    try {
      const res = await fetch(`/api/requests/${requestId}/responses`);
      if (res.ok) {
        const data = await res.json();
        setRequestOffers(prev => ({ ...prev, [requestId]: data }));
      }
    } catch (err) {
      console.error(`Error fetching offers for ${requestId}:`, err);
    } finally {
      setLoadingOffers(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleAcceptOffer = async (requestId: string, offerId: string) => {
    if (!confirm("Accept this offer? Other offers will be rejected.")) return;

    try {
      const res = await fetch(`/api/requests/respond/${offerId}/accept`, {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok) {
        router.push("/cart");
      } else {
        alert(data.error || "Failed to accept offer");
      }
    } catch (err) {
      console.error("Error accepting offer:", err);
    }
  };

  const handleRejectOffer = async (requestId: string, offerId: string) => {
    if (!confirm("Reject this offer?")) return;

    try {
      const res = await fetch(`/api/requests/respond/${offerId}/reject`, {
        method: "POST",
      });
      
      if (res.ok) {
        fetchOffers(requestId);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to reject offer");
      }
    } catch (err) {
      console.error("Error rejecting offer:", err);
    }
  };

  return (
    <>
      <style>{`
        .rq-card { transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s; }
        .rq-card:hover { border-color: rgba(255,255,255,0.18) !important; transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.5); }
        .offer-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 12px; margin-top: 12px; }
      `}</style>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {requests.map((request) => {
          const offers = requestOffers[request._id] || [];
          const isLoading = loadingOffers[request._id];

          return (
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
                  background: isOwnSection ? 'rgba(59,130,246,0.1)' : 'rgba(245,158,11,0.1)', 
                  color: isOwnSection ? '#60a5fa' : '#fbbf24',
                  border: `1px solid ${isOwnSection ? 'rgba(59,130,246,0.2)' : 'rgba(245,158,11,0.2)'}`,
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
                {!isOwnSection && (
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: '13px' }}>
                    <span style={{ width: '80px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '11px' }}>Buyer</span>
                    <span style={{ color: '#94a3b8' }}>{request.userId?.name}</span>
                  </div>
                )}
              </div>

              {isOwnSection && (
                <div style={{ marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    📦 Offers Received
                    <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', padding: '2px 8px', borderRadius: '999px' }}>
                      {isLoading ? "..." : offers.length}
                    </span>
                  </h4>
                  
                  {offers.length === 0 && !isLoading ? (
                    <p style={{ fontSize: '12px', color: '#475569', fontStyle: 'italic' }}>No offers yet</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {offers.map((offer) => {
                        const isAccepted = offer.status === 'accepted';
                        const isRejected = offer.status === 'rejected';
                        
                        return (
                          <div key={offer._id} className="offer-card" style={{ 
                            border: isAccepted ? '1px solid rgba(16,185,129,0.3)' : isRejected ? '1px solid rgba(239,68,68,0.1)' : '1px solid rgba(255,255,255,0.05)',
                            background: isAccepted ? 'rgba(16,185,129,0.05)' : isRejected ? 'rgba(239,68,68,0.02)' : 'rgba(255,255,255,0.03)',
                            opacity: isRejected ? 0.6 : 1
                          }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                              <div style={{ width: '40px', height: '40px', background: '#0a0a0a', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                                {offer.productId?.image?.url ? (
                                  <img src={offer.productId.image.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>📦</div>
                                )}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <p style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {offer.productId?.title}
                                </p>
                                <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
                                  Seller: {offer.sellerId?.name}
                                </p>
                              </div>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '14px', fontWeight: 800, color: '#fbbf24' }}>
                                ₹{offer.offeredPrice?.toLocaleString('en-IN')}
                              </span>
                              
                              <div style={{ display: 'flex', gap: '8px' }}>
                                {offer.status === 'pending' ? (
                                  <>
                                    <button 
                                      onClick={() => handleRejectOffer(request._id, offer._id)}
                                      style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.2)', background: 'transparent', color: '#ef4444', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                                    >
                                      Reject
                                    </button>
                                    <button 
                                      onClick={() => handleAcceptOffer(request._id, offer._id)}
                                      style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#10b981', color: '#fff', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                                    >
                                      Accept
                                    </button>
                                  </>
                                ) : (
                                  <span style={{ 
                                    fontSize: '10px', 
                                    fontWeight: 800, 
                                    textTransform: 'uppercase', 
                                    color: isAccepted ? '#10b981' : '#ef4444',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    background: isAccepted ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'
                                  }}>
                                    {offer.status}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', position: 'relative', marginTop: 'auto' }}>
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
                  {isOwnSection ? "View Request" : "Details"}
                </Link>
                {!isOwnSection && (
                  <button 
                    onClick={() => onFulfillClick?.(request._id)}
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
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = '#f59e0b'; e.currentTarget.style.color = '#000'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(245,158,11,0.1)'; e.currentTarget.style.color = '#fbbf24'; }}
                  >
                    Fulfill
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
