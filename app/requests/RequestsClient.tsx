"use client";

import React, { useState, useEffect } from "react";
import RequestsList from "./RequestsList";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function RequestsClient({ 
  initialRequests, 
  currentUserId,
  session,
  unreadNotifications = 0
}: { 
  initialRequests: any[], 
  currentUserId?: string,
  session: any,
  unreadNotifications?: number
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoSelectProductId = searchParams.get("autoSelect");
  const requestIdFromUrl = searchParams.get("requestId");

  const myRequests = currentUserId 
    ? initialRequests.filter((r: any) => r.userId?._id?.toString() === currentUserId || r.userId?.toString() === currentUserId)
    : [];
  
  const otherRequests = currentUserId
    ? initialRequests.filter((r: any) => r.userId?._id?.toString() !== currentUserId && r.userId?.toString() !== currentUserId)
    : initialRequests;

  useEffect(() => {
    if (autoSelectProductId && requestIdFromUrl) {
      // If autoSelect is present, we redirect to the details page which will handle the fulfillment
      router.push(`/requests/${requestIdFromUrl}?autoSelect=${autoSelectProductId}`);
    }
  }, [autoSelectProductId, requestIdFromUrl, router]);

  const handleFulfillClick = async (requestId: string) => {
    if (!session) {
      router.push("/login");
      return;
    }

    try {
      // Check seller status
      const sellerRes = await fetch("/api/seller/register");
      const sellerData = await sellerRes.json();

      if (sellerData.status !== "approved") {
        router.push("/seller/register");
        return;
      }

      // If verified, go to details page to fulfill
      router.push(`/requests/${requestId}?fulfill=true`);
    } catch (err) {
      console.error("Error checking seller status:", err);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#080808', color: '#e2e8f0' }}>
      <style>{`.rq-post-btn:hover { transform: translateY(-2px) !important; box-shadow: 0 12px 24px rgba(245,158,11,0.35) !important; }`}</style>
      
      <main style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', padding: '32px 24px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 8px 0', background: 'linear-gradient(135deg, #fff 60%, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              📢 Community Requests
            </h1>
            <p style={{ margin: 0, fontSize: '15px', color: '#64748b' }}>
              See what students are looking for
            </p>
          </div>
          <Link 
            href="/requests/new" 
            className="rq-post-btn"
            style={{ 
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#000',
              fontWeight: 800,
              padding: '12px 24px',
              borderRadius: '12px',
              textDecoration: 'none',
              boxShadow: '0 8px 20px rgba(245,158,11,0.25)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              display: 'inline-block'
            }}
          >
            + Post Request
          </Link>
        </div>

        {unreadNotifications > 0 && (
          <div style={{ 
            background: 'rgba(245,158,11,0.1)', 
            border: '1px solid rgba(245,158,11,0.2)', 
            borderRadius: '12px', 
            padding: '16px 24px', 
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '20px' }}>🔔</span>
            <p style={{ margin: 0, color: '#fbbf24', fontWeight: 600 }}>
              You have {unreadNotifications} new offer{unreadNotifications > 1 ? 's' : ''} for your requests! Check "My Requests" below.
            </p>
          </div>
        )}

        {initialRequests.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '80px 20px', 
            background: 'linear-gradient(145deg, rgba(15,15,15,0.95), rgba(10,10,10,0.95))',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.3)'
          }}>
            <span style={{ fontSize: '4rem', display: 'block', marginBottom: '20px', opacity: 0.5 }}>📭</span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 8px 0', color: '#f1f5f9' }}>No requests yet</h2>
            <p style={{ margin: 0, color: '#64748b' }}>Be the first to post a request!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            {myRequests.length > 0 && (
              <section>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  📌 My Requests
                  <span style={{ fontSize: '12px', background: 'rgba(245,158,11,0.1)', color: '#fbbf24', padding: '4px 10px', borderRadius: '999px', border: '1px solid rgba(245,158,11,0.2)' }}>{myRequests.length}</span>
                </h2>
                <RequestsList requests={JSON.parse(JSON.stringify(myRequests))} isOwnSection />
              </section>
            )}

            <section>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '12px' }}>
                🔥 Requests from Other Students
                <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', padding: '4px 10px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.1)' }}>{otherRequests.length}</span>
              </h2>
              {otherRequests.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <p style={{ margin: 0, color: '#64748b' }}>No requests from other students at the moment.</p>
                </div>
              ) : (
                <RequestsList 
                  requests={JSON.parse(JSON.stringify(otherRequests))} 
                  onFulfillClick={handleFulfillClick}
                />
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
