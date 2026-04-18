"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

export default function RequestDetails({ 
  request, 
  initialResponses, 
  session 
}: { 
  request: any, 
  initialResponses: any[], 
  session: any 
}) {
  const router = useRouter();
  const [responses, setResponses] = useState<any[]>(initialResponses);
  const [sellerProducts, setSellerProducts] = useState<any[]>([]);
  const [showFulfillModal, setShowFulfillModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [submittingResponse, setSubmittingResponse] = useState(false);
  const [error, setError] = useState("");

  const fetchResponses = async () => {
    try {
      const res = await fetch(`/api/requests/${request._id}/responses`);
      const data = await res.json();
      setResponses(data);
    } catch (err) {
      console.error("Error fetching responses:", err);
    }
  };

  const handleFulfillClick = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("/api/seller/products");
      const data = await res.json();
      
      const activeProducts = data.filter((p: any) => p.status === "active");
      
      if (activeProducts.length === 0) {
        const query = new URLSearchParams({
          title: request.title,
          category: request.category,
          condition: request.condition.toLowerCase(),
          fromRequest: request._id as string
        }).toString();
        router.push(`/seller/add-product?${query}`);
      } else {
        setSellerProducts(activeProducts);
        setShowFulfillModal(true);
      }
    } catch (err) {
      console.error("Error fetching seller products:", err);
    }
  };

  const handleResponseSubmit = async () => {
    if (!selectedProductId) return;
    
    setSubmittingResponse(true);
    setError("");

    try {
      const res = await fetch("/api/requests/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: request._id,
          productId: selectedProductId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit response");
      }

      setShowFulfillModal(false);
      fetchResponses();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmittingResponse(false);
    }
  };

  const handleAcceptOffer = async (responseId: string) => {
    if (!confirm("Are you sure you want to accept this offer?")) return;

    try {
      const res = await fetch(`/api/requests/respond/${responseId}/accept`, {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok) {
        router.push(`/product/${data.productId}`);
      } else {
        alert(data.error || "Failed to accept offer");
      }
    } catch (err) {
      console.error("Error accepting offer:", err);
    }
  };

  const isOwner = session?.user?.id === request.userId?._id;
  const isFulfilled = request.status === "fulfilled";

  return (
    <>
      {/* Request Top Section */}
      <div style={{
        background: 'linear-gradient(145deg, rgba(15,15,15,0.95), rgba(10,10,10,0.95))',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '24px',
        padding: '32px',
        marginBottom: '40px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
      }}>
        {/* Glow accent */}
        <div style={{ position: 'absolute', top: '-40px', left: '-40px', width: '200px', height: '200px', background: 'rgba(245,158,11,0.05)', borderRadius: '50%', filter: 'blur(50px)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 800,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                background: 'rgba(245,158,11,0.1)', color: '#fbbf24',
                border: '1px solid rgba(245,158,11,0.2)',
              }}>
                {request.category}
              </span>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                Posted {formatDistanceToNow(new Date(request.createdAt))} ago
              </span>
              {isFulfilled && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 800,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  background: 'rgba(16,185,129,0.1)', color: '#34d399',
                  border: '1px solid rgba(16,185,129,0.2)', marginLeft: 'auto'
                }}>
                  ✓ Fulfilled
                </span>
              )}
            </div>

            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.02em', margin: 0, color: '#f8fafc' }}>
              📢 {request.title}
            </h1>
            
            <p style={{ margin: 0, fontSize: '16px', color: '#94a3b8', lineHeight: 1.6, maxWidth: '800px', whiteSpace: 'pre-wrap' }}>
              {request.description || "No additional description provided."}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px' }}>
              <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>Budget</span>
              <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fbbf24' }}>₹{request.budget?.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px' }}>
              <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>Condition</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#e2e8f0', textTransform: 'capitalize' }}>{request.condition}</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px' }}>
              <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>Posted By</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#f59e0b,#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                  🎓
                </div>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#e2e8f0' }}>{request.userId?.name}</span>
              </div>
            </div>
          </div>

          {!isOwner && !isFulfilled && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '8px' }}>
              <button 
                onClick={handleFulfillClick}
                style={{ 
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#000',
                  fontWeight: 800,
                  fontSize: '15px',
                  padding: '16px 40px',
                  borderRadius: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(245,158,11,0.3)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  display: 'inline-block'
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(245,158,11,0.4)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(245,158,11,0.3)'; }}
              >
                Fulfill Request
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Responses Section */}
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          📦 Seller Offers 
          <span style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', fontSize: '13px', padding: '4px 10px', borderRadius: '999px', fontWeight: 700, border: '1px solid rgba(255,255,255,0.1)' }}>
            {responses.length}
          </span>
        </h2>

        {responses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <span style={{ fontSize: '3rem', opacity: 0.5, display: 'block', marginBottom: '16px' }}>⏳</span>
            <p style={{ margin: 0, color: '#64748b', fontSize: '15px' }}>No offers yet. Sellers are checking your request!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {responses.map((resp) => {
              const accepted = resp.status === 'accepted';
              return (
                <div 
                  key={resp._id} 
                  style={{
                    background: accepted ? 'rgba(16,185,129,0.04)' : 'linear-gradient(145deg, rgba(20,20,20,0.9), rgba(15,15,15,0.9))',
                    border: `1px solid ${accepted ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: '20px',
                    padding: '20px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '20px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: '1 1 min-content' }}>
                    <div style={{ width: '80px', height: '80px', background: '#0a0a0a', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', flexShrink: 0 }}>
                      {resp.productId?.image?.url ? (
                        <img src={resp.productId.image.url} alt={resp.productId.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', opacity: 0.3 }}>📦</div>
                      )}
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', fontWeight: 800, color: '#e2e8f0' }}>{resp.productId?.title}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
                        <span style={{ color: '#fbbf24', fontWeight: 800, fontSize: '15px' }}>₹{resp.offeredPrice?.toLocaleString('en-IN')}</span>
                        <span style={{ color: '#334155' }}>|</span>
                        <span style={{ color: '#94a3b8' }}>Seller: <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{resp.sellerId?.name}</span></span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => router.push(`/product/${resp.productId?._id}`)}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        color: '#e2e8f0',
                        fontSize: '13px',
                        fontWeight: 700,
                        padding: '10px 20px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    >
                      View Product
                    </button>
                    {isOwner && !isFulfilled && (
                      <button 
                        onClick={() => handleAcceptOffer(resp._id)}
                        style={{
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          color: '#fff',
                          fontSize: '13px',
                          fontWeight: 700,
                          padding: '10px 20px',
                          border: 'none',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(16,185,129,0.2)',
                          transition: 'transform 0.2s, box-shadow 0.2s'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(16,185,129,0.3)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(16,185,129,0.2)'; }}
                      >
                        Accept Offer
                      </button>
                    )}
                    {accepted && (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', alignSelf: 'center',
                        padding: '6px 16px', borderRadius: '999px', fontSize: '11px', fontWeight: 800,
                        textTransform: 'uppercase', letterSpacing: '0.08em',
                        background: 'rgba(16,185,129,0.15)', color: '#34d399',
                        border: '1px solid rgba(16,185,129,0.3)',
                      }}>
                        Accepted
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fulfill Modal */}
      {showFulfillModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
          <div style={{ 
            background: 'linear-gradient(145deg, #18181b, #111113)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '500px',
            overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
            animation: 'fadeInUp 0.2s ease-out forwards'
          }}>
            <style>{`
              @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
            `}</style>
            
            <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>Fulfill Request</h3>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>Select one of your listings to offer</p>
            </div>
            
            <div style={{ padding: '24px 32px', maxHeight: '60vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {error && <p style={{ margin: '0 0 16px 0', padding: '12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', fontSize: '13px' }}>{error}</p>}
              
              {sellerProducts.map((product) => {
                const isSelected = selectedProductId === product._id;
                return (
                  <div 
                    key={product._id}
                    onClick={() => setSelectedProductId(product._id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '16px', cursor: 'pointer',
                      background: isSelected ? 'rgba(245,158,11,0.05)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isSelected ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.05)'}`,
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ width: '50px', height: '50px', background: '#0a0a0a', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', flexShrink: 0 }}>
                      {product.image?.url ? (
                        <img src={product.image.url} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', opacity: 0.3 }}>📦</div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.title}</p>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#fbbf24' }}>₹{product.expectedPrice?.toLocaleString('en-IN')}</p>
                    </div>
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      border: `2px solid ${isSelected ? '#f59e0b' : 'rgba(255,255,255,0.1)'}`,
                      background: isSelected ? '#f59e0b' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                    }}>
                      {isSelected && <span style={{ color: '#000', fontSize: '12px', fontWeight: 900 }}>✓</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ padding: '20px 32px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '16px' }}>
              <button 
                onClick={() => setShowFulfillModal(false)}
                style={{ flex: 1, padding: '14px', background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
                onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
              >
                Cancel
              </button>
              <button 
                onClick={handleResponseSubmit}
                disabled={!selectedProductId || submittingResponse}
                style={{ 
                  flex: 2, padding: '14px', 
                  background: (!selectedProductId || submittingResponse) ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: (!selectedProductId || submittingResponse) ? '#64748b' : '#000',
                  border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 800, cursor: (!selectedProductId || submittingResponse) ? 'not-allowed' : 'pointer',
                  boxShadow: (!selectedProductId || submittingResponse) ? 'none' : '0 4px 16px rgba(245,158,11,0.25)',
                  transition: 'all 0.2s'
                }}
              >
                {submittingResponse ? "Submitting..." : "Submit Offer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
