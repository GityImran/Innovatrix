import React from "react";
import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import Auction from "@/models/Auction";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function getSellerAuctions(userId: string) {
  await connectToDatabase();
  const auctions = await Auction.find({ sellerId: userId })
    .sort({ createdAt: -1 })
    .lean();
  return JSON.parse(JSON.stringify(auctions));
}

export default async function SellerAuctionsPage() {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/login");
  }

  const auctions = await getSellerAuctions(session.user.id);
  const activeAuctions = auctions.filter((a: any) => a.status === "active");
  const endedAuctions = auctions.filter((a: any) => a.status === "ended");

  return (
    <div style={s.page}>
      
      {/* Header Banner */}
      <div style={s.banner}>
        <div>
          <h1 style={s.bannerTitle}>My Auctions</h1>
          <p style={s.bannerSub}>Manage your active listings, track bids, and view ended auctions.</p>
        </div>
        <Link href="/seller/auctions/create" style={s.bannerBtn}>
          + Create Auction
        </Link>
      </div>

      <main style={s.mainContent}>
        {/* Active Auctions */}
        <section style={s.section}>
          <div style={s.sectionHeader}>
            <h2 style={s.sectionTitle}>Active Listings</h2>
            <div style={s.badgeGreen}>
              <span style={s.dotPulse} />
              <span>{activeAuctions.length} Live</span>
            </div>
          </div>
          
          {activeAuctions.length === 0 ? (
            <div style={s.emptyCard}>
              <div style={s.emptyIcon}>📡</div>
              <h3 style={s.emptyTitle}>No Active Auctions</h3>
              <p style={s.emptyDesc}>List an item to start receiving bids from the campus community.</p>
              <Link href="/seller/auctions/create" style={s.emptyLink}>
                Start Selling →
              </Link>
            </div>
          ) : (
            <div style={s.grid}>
              {activeAuctions.map((auction: any) => (
                <SellerAuctionCard key={auction._id} auction={auction} />
              ))}
            </div>
          )}
        </section>

        {/* Ended Auctions */}
        <section style={s.section}>
          <div style={s.sectionHeader}>
            <h2 style={s.sectionTitle}>Ended Auctions</h2>
            <span style={s.badgeGray}>
              {endedAuctions.length} Total
            </span>
          </div>
          
          {endedAuctions.length === 0 ? (
            <div style={s.emptyCardSmall}>
              You have no past auctions.
            </div>
          ) : (
            <div style={s.grid}>
              {endedAuctions.map((auction: any) => (
                <SellerAuctionCard key={auction._id} auction={auction} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function SellerAuctionCard({ auction }: { auction: any }) {
  const isActive = auction.status === "active";
  
  return (
    <div style={{ ...s.card, opacity: isActive ? 1 : 0.7, filter: isActive ? "none" : "grayscale(100%)" }}>
      {/* Image Container */}
      <div style={s.cardImageContainer}>
        {auction.images?.[0] ? (
          <img
            src={auction.images[0]}
            alt={auction.productTitle}
            style={s.cardImage}
          />
        ) : (
          <div style={s.cardImageFallback}>📦</div>
        )}
        
        {/* Status Badge */}
        <div style={s.cardStatusContainer}>
          <span style={isActive ? s.statusActive : s.statusEnded}>
            {auction.status}
          </span>
        </div>
      </div>

      {/* Content Container */}
      <div style={s.cardContent}>
        <h3 style={s.cardTitle}>
          {auction.productTitle}
        </h3>
        
        <div style={s.cardFooter}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={s.cardBidLabel}>
              {isActive ? "Current Bid" : "Final Bid"}
            </span>
            <span style={isActive ? s.cardBidValueActive : s.cardBidValue}>
              ₹{auction.currentBid || auction.startingPrice}
            </span>
          </div>
          
          <Link href={`/auction/${auction._id}`} style={s.viewBtn}>
            View →
          </Link>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
    maxWidth: "1100px",
    margin: "0 auto",
  },
  banner: {
    background: "linear-gradient(135deg, #1a1000 0%, #2a1800 100%)",
    border: "1px solid rgba(245,158,11,0.2)",
    borderRadius: "16px",
    padding: "2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "1rem",
  },
  bannerTitle: {
    fontSize: "1.5rem",
    fontWeight: 800,
    color: "#f8fafc",
    marginBottom: "0.35rem",
  },
  bannerSub: {
    color: "#94a3b8",
    fontSize: "0.9rem",
    margin: 0,
  },
  bannerBtn: {
    padding: "0.65rem 1.5rem",
    backgroundColor: "#f59e0b",
    color: "#000",
    borderRadius: "10px",
    fontWeight: 700,
    fontSize: "0.875rem",
    textDecoration: "none",
    whiteSpace: "nowrap",
  },
  mainContent: {
    display: "flex",
    flexDirection: "column",
    gap: "3rem",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    flexWrap: "wrap",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "1.25rem",
    fontWeight: 800,
    color: "#e2e8f0",
  },
  badgeGreen: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.25rem 0.75rem",
    borderRadius: "999px",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    border: "1px solid rgba(16, 185, 129, 0.2)",
    color: "#10b981",
    fontSize: "0.75rem",
    fontWeight: 700,
    textTransform: "uppercase",
  },
  dotPulse: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "#10b981",
  },
  badgeGray: {
    padding: "0.25rem 0.75rem",
    borderRadius: "999px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#94a3b8",
    fontSize: "0.75rem",
    fontWeight: 700,
    textTransform: "uppercase",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "1.5rem",
  },
  emptyCard: {
    backgroundColor: "#121212",
    border: "1px dashed #2a2a2a",
    borderRadius: "14px",
    padding: "4rem 2rem",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  emptyIcon: {
    fontSize: "3rem",
    marginBottom: "1rem",
  },
  emptyTitle: {
    color: "#f8fafc",
    fontSize: "1.25rem",
    fontWeight: 700,
    margin: "0 0 0.5rem",
  },
  emptyDesc: {
    color: "#64748b",
    fontSize: "0.9rem",
    maxWidth: "350px",
    margin: "0 0 1.5rem",
  },
  emptyLink: {
    color: "#f59e0b",
    fontWeight: 700,
    textDecoration: "none",
    fontSize: "0.9rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  emptyCardSmall: {
    backgroundColor: "#121212",
    border: "1px dashed #2a2a2a",
    borderRadius: "14px",
    padding: "2rem",
    textAlign: "center",
    color: "#64748b",
    fontSize: "0.9rem",
  },
  card: {
    backgroundColor: "#121212",
    border: "1px solid #1f1f1f",
    borderRadius: "12px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    transition: "border-color 0.2s, transform 0.2s",
  },
  cardImageContainer: {
    aspectRatio: "4/3",
    position: "relative",
    backgroundColor: "#1a1a1a",
    borderBottom: "1px solid #1f1f1f",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  cardImageFallback: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2.5rem",
    opacity: 0.5,
  },
  cardStatusContainer: {
    position: "absolute",
    top: "0.75rem",
    right: "0.75rem",
    zIndex: 10,
  },
  statusActive: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    color: "#10b981",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    padding: "0.25rem 0.5rem",
    borderRadius: "999px",
    fontSize: "0.65rem",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    backdropFilter: "blur(4px)",
  },
  statusEnded: {
    backgroundColor: "rgba(20, 20, 20, 0.8)",
    color: "#94a3b8",
    border: "1px solid #333",
    padding: "0.25rem 0.5rem",
    borderRadius: "999px",
    fontSize: "0.65rem",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  cardContent: {
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
  },
  cardTitle: {
    margin: "0 0 1rem",
    fontSize: "1rem",
    fontWeight: 700,
    color: "#f8fafc",
    lineHeight: 1.4,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  cardFooter: {
    marginTop: "auto",
    paddingTop: "1rem",
    borderTop: "1px solid #1f1f1f",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  cardBidLabel: {
    fontSize: "0.65rem",
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "0.25rem",
  },
  cardBidValueActive: {
    fontSize: "1.25rem",
    fontWeight: 800,
    color: "#f59e0b",
    lineHeight: 1,
  },
  cardBidValue: {
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "#94a3b8",
    lineHeight: 1,
  },
  viewBtn: {
    padding: "0.4rem 0.75rem",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "6px",
    color: "#f8fafc",
    fontSize: "0.75rem",
    fontWeight: 700,
    textDecoration: "none",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    transition: "background-color 0.2s, color 0.2s",
  },
};
