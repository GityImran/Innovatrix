import React from "react";
import Link from "next/link";
import Header from "@/app/components/Header/Header";
import CategoriesNav from "@/app/components/CategoriesNav/CategoriesNav";
import RequestDetails from "./RequestDetails";
import { connectToDatabase } from "@/lib/mongodb";
import Request from "@/models/Request";
import RequestResponse from "@/models/RequestResponse";
import { auth } from "@/lib/auth";

export default async function RequestDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectToDatabase();
  const session = await auth();

  const request = await Request.findById(id).populate("userId", "name").lean();
  if (!request) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#080808', color: '#e2e8f0' }}>
        <Header />
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <p style={{ color: '#64748b' }}>Request not found</p>
        </div>
      </div>
    );
  }

  const responses = await RequestResponse.find({ requestId: id })
    .populate("productId")
    .populate("sellerId", "name")
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#080808', color: '#e2e8f0' }}>
      <Header />
      <CategoriesNav />

      <main style={{ flex: 1, maxWidth: '1000px', margin: '0 auto', padding: '32px 24px', width: '100%' }}>
        <nav style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link href="/requests" style={{ fontSize: '13px', color: '#64748b', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>←</span> Requests
          </Link>
          <span style={{ color: '#1e293b', fontSize: '13px' }}>/</span>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>
            {request.category}
          </span>
          <span style={{ color: '#1e293b', fontSize: '13px' }}>/</span>
          <span style={{ fontSize: '13px', color: '#e2e8f0', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {request.title}
          </span>
        </nav>

        <RequestDetails 
          request={JSON.parse(JSON.stringify(request))} 
          initialResponses={JSON.parse(JSON.stringify(responses))}
          session={session}
        />
      </main>
    </div>
  );
}
