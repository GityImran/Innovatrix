import React from "react";
import Link from "next/link";
import Header from "@/app/components/Header/Header";
import CategoriesNav from "@/app/components/CategoriesNav/CategoriesNav";
import RequestsList from "./RequestsList";
import { connectToDatabase } from "@/lib/mongodb";
import Request from "@/models/Request";

export default async function RequestsPage() {
  await connectToDatabase();
  const requests = await Request.find({ status: "open" })
    .sort({ createdAt: -1 })
    .populate("userId", "name")
    .lean();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#080808', color: '#e2e8f0' }}>
      <style>{`.rq-post-btn:hover { transform: translateY(-2px) !important; box-shadow: 0 12px 24px rgba(245,158,11,0.35) !important; }`}</style>
      <Header />
      <CategoriesNav />
      
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

        {requests.length === 0 ? (
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
          <RequestsList requests={JSON.parse(JSON.stringify(requests))} />
        )}
      </main>
    </div>
  );
}
