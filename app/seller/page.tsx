/**
 * app/seller/page.tsx
 * Seller Dashboard Overview — stats, quick links, recent activity placeholder.
 */

import React from "react";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";
import Order from "@/models/Order";
import "@/models/Auction"; // ensure Auction schema is registered (referenced via Order population)

const QUICK_LINKS = [
  { href: "/seller/add-product", icon: "➕", label: "Add Product", desc: "List a new item for sale" },
  { href: "/seller/products", icon: "📦", label: "My Listings", desc: "View & manage your items" },
  { href: "/seller/orders", icon: "🛒", label: "Orders", desc: "Track buyer orders" },
  { href: "/seller/earnings", icon: "💰", label: "Earnings", desc: "See your revenue summary" },
];

export default async function SellerDashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  await connectToDatabase();
  const sellerId = session.user.id;
  const firstName = session.user.name?.split(" ")[0] ?? "Seller";

  const [totalProducts, pendingOrders, allOrders, recentOrders, topProduct] = await Promise.all([
    Product.countDocuments({ sellerId }),
    Order.countDocuments({ sellerId, status: "pending" }),
    Order.find({ sellerId }).lean(),
    Order.find({ sellerId }).sort({ createdAt: -1 }).limit(3).populate("itemId", "title").populate("buyerId", "name").lean(),
    Product.findOne({ sellerId }).sort({ expectedPrice: -1 }).lean()
  ]);

  const totalEarnings = allOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalOrders = allOrders.length;

  // Simple weekly order distribution chart
  const weeklyOrders = [0, 0, 0, 0, 0, 0, 0];
  const now = new Date();
  allOrders.forEach((o) => {
    const d = new Date(o.createdAt);
    const diffTime = Math.abs(now.getTime() - d.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    if (diffDays <= 7) {
      const dayIndex = (d.getDay() + 6) % 7; // Mon=0, Sun=6
      weeklyOrders[dayIndex]++;
    }
  });

  const STATS = [
    { label: "Total Earnings", value: `₹${totalEarnings.toLocaleString("en-IN")}`, icon: "💰", color: "#f59e0b", trend: "Lifetime" },
    { label: "Total Orders", value: totalOrders.toString(), icon: "🛒", color: "#10b981", trend: "All time" },
    { label: "Total Products", value: totalProducts.toString(), icon: "📦", color: "#3b82f6", trend: "Listed" },
    { label: "Pending Orders", value: pendingOrders.toString(), icon: "⏳", color: "#ef4444", trend: "Needs action" },
  ];

  return (
    <div style={s.page}>

      {/* Welcome Banner */}
      <div style={s.banner}>
        <div>
          <h1 style={s.bannerTitle}>Welcome back, {firstName} 👋</h1>
          <p style={s.bannerSub}>
            Here&apos;s a snapshot of your seller activity. Start by listing your first item!
          </p>
        </div>
        <Link href="/seller/add-product" style={s.bannerBtn}>
          + List New Item
        </Link>
      </div>

      {/* Stats Grid */}
      <div style={s.statsGrid}>
        {STATS.map(({ label, value, icon, color, trend }) => (
          <div key={label} style={s.statCard}>
            <div style={{ ...s.statIcon, backgroundColor: color + "1a", color }}>
              {icon}
            </div>
            <div style={{ flex: 1 }}>
              <p style={s.statValue}>{value}</p>
              <p style={s.statLabel}>{label}</p>
              <span style={{ ...s.trendBadge, backgroundColor: color + "18", color }}>
                {trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Row: Top Product + Mini Chart */}
      <div style={s.analyticsRow}>
        {/* Top Product Card */}
        <div style={s.analyticsCard}>
          <div style={s.analyticsHeader}>
            <span style={s.analyticsTitle}>🏆 Highest Valued Product</span>
            <span style={s.analyticsBadge}>Premium</span>
          </div>
          {topProduct ? (
            <div style={{ padding: "1rem 0", display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: "60px", height: "60px", borderRadius: "10px", backgroundColor: "#1f1f1f", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>
                {topProduct.image?.url ? <img src={topProduct.image.url} alt="Top Product" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "📦"}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#f8fafc" }}>{topProduct.title}</p>
                <p style={{ margin: "0.2rem 0 0", fontSize: "1.1rem", fontWeight: 800, color: "#f59e0b" }}>₹{topProduct.expectedPrice.toLocaleString("en-IN")}</p>
              </div>
            </div>
          ) : (
            <div style={s.topProductEmpty}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📦</div>
              <p style={s.analyticsEmptyText}>No products listed yet</p>
              <p style={s.analyticsEmptyHint}>Your highest valued item will appear here</p>
            </div>
          )}
        </div>

        {/* Orders This Week Mini Chart */}
        <div style={s.analyticsCard}>
          <div style={s.analyticsHeader}>
            <span style={s.analyticsTitle}>📈 Orders This Week</span>
            <span style={s.analyticsBadge}>Weekly</span>
          </div>
          <div style={s.chartPlaceholder}>
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
              <div key={day} style={s.barGroup}>
                <div style={{ ...s.bar, height: `${weeklyOrders[i] * 5 + 4}px`, backgroundColor: weeklyOrders[i] > 0 ? "#f59e0b" : "rgba(245,158,11,0.25)" }} />
                <span style={s.barLabel}>{day}</span>
              </div>
            ))}
          </div>
          <p style={s.analyticsFooter}>{weeklyOrders.reduce((a, b) => a + b, 0)} orders this week</p>
        </div>
      </div>

      {/* Quick Actions */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>Quick Actions</h2>
        <div style={s.quickGrid}>
          {QUICK_LINKS.map(({ href, icon, label, desc }) => (
            <Link key={href} href={href} style={s.quickCard}>
              <span style={s.quickIcon}>{icon}</span>
              <div>
                <p style={s.quickLabel}>{label}</p>
                <p style={s.quickDesc}>{desc}</p>
              </div>
              <span style={s.quickArrow}>→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>Recent Activity</h2>
        {recentOrders.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {recentOrders.map((order: any) => (
              <div key={order._id.toString()} style={{ backgroundColor: "#121212", border: "1px solid #1f1f1f", borderRadius: "12px", padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", color: "#3b82f6" }}>
                    🛒
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: "#f8fafc" }}>
                      New order for {order.itemId?.title || "an item"}
                    </p>
                    <p style={{ margin: "0.15rem 0 0", fontSize: "0.75rem", color: "#64748b" }}>
                      Placed by {order.buyerId?.name || "a user"} • {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "1rem", fontWeight: 800, color: "#10b981", display: "block" }}>+₹{order.totalAmount}</span>
                  <span style={{ fontSize: "0.7rem", color: order.status === "completed" ? "#10b981" : "#f59e0b", fontWeight: 700, textTransform: "uppercase" }}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={s.emptyCard}>
            <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>📭</div>
            <p style={s.emptyTitle}>No activity yet</p>
            <p style={s.emptyDesc}>
              Once you list your first item and receive orders, your activity will show up here.
            </p>
            <Link href="/seller/add-product" style={s.emptyBtn}>
              List Your First Item
            </Link>
          </div>
        )}
      </section>
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
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
  },
  statCard: {
    backgroundColor: "#121212",
    border: "1px solid #1f1f1f",
    borderRadius: "14px",
    padding: "1.25rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    transition: "border-color 0.2s",
  },
  statIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.4rem",
    flexShrink: 0,
  },
  statValue: {
    fontSize: "1.6rem",
    fontWeight: 800,
    color: "#f8fafc",
    lineHeight: 1,
    margin: "0 0 0.25rem",
  },
  statLabel: {
    fontSize: "0.775rem",
    color: "#64748b",
    fontWeight: 500,
    margin: 0,
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  sectionTitle: {
    fontSize: "1rem",
    fontWeight: 700,
    color: "#e2e8f0",
  },
  quickGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "0.75rem",
  },
  quickCard: {
    backgroundColor: "#121212",
    border: "1px solid #1f1f1f",
    borderRadius: "12px",
    padding: "1.1rem 1.25rem",
    display: "flex",
    alignItems: "center",
    gap: "0.9rem",
    textDecoration: "none",
    transition: "border-color 0.2s, background-color 0.2s",
  },
  quickIcon: {
    fontSize: "1.4rem",
    flexShrink: 0,
  },
  quickLabel: {
    fontSize: "0.875rem",
    fontWeight: 700,
    color: "#f8fafc",
    margin: 0,
  },
  quickDesc: {
    fontSize: "0.75rem",
    color: "#64748b",
    margin: "0.1rem 0 0",
  },
  quickArrow: {
    marginLeft: "auto",
    color: "#374151",
    fontSize: "1.1rem",
  },
  emptyCard: {
    backgroundColor: "#121212",
    border: "1px dashed #2a2a2a",
    borderRadius: "14px",
    padding: "3rem 2rem",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: "1rem",
    fontWeight: 700,
    color: "#f8fafc",
    margin: "0 0 0.35rem",
  },
  emptyDesc: {
    fontSize: "0.85rem",
    color: "#64748b",
    maxWidth: "300px",
    margin: "0 auto 1.5rem",
  },
  emptyBtn: {
    padding: "0.6rem 1.5rem",
    backgroundColor: "#f59e0b",
    color: "#000",
    borderRadius: "8px",
    fontWeight: 700,
    fontSize: "0.85rem",
    textDecoration: "none",
  },
  trendBadge: {
    display: "inline-block",
    marginTop: "0.35rem",
    fontSize: "0.68rem",
    fontWeight: 700,
    borderRadius: "4px",
    padding: "1px 6px",
    letterSpacing: "0.02em",
  },
  analyticsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1rem",
  },
  analyticsCard: {
    backgroundColor: "#121212",
    border: "1px solid #1f1f1f",
    borderRadius: "14px",
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  analyticsHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  analyticsTitle: {
    fontSize: "0.875rem",
    fontWeight: 700,
    color: "#e2e8f0",
  },
  analyticsBadge: {
    fontSize: "0.65rem",
    fontWeight: 700,
    padding: "2px 8px",
    backgroundColor: "rgba(245,158,11,0.12)",
    color: "#f59e0b",
    borderRadius: "20px",
    border: "1px solid rgba(245,158,11,0.2)",
  },
  topProductEmpty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "1.5rem 0",
    textAlign: "center",
  },
  analyticsEmptyText: {
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "#94a3b8",
    margin: "0 0 0.2rem",
  },
  analyticsEmptyHint: {
    fontSize: "0.75rem",
    color: "#374151",
    margin: 0,
  },
  chartPlaceholder: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: "80px",
    padding: "0 0.25rem",
    gap: "0.25rem",
  },
  barGroup: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.3rem",
    flex: 1,
  },
  bar: {
    width: "100%",
    maxWidth: "24px",
    backgroundColor: "rgba(245,158,11,0.25)",
    borderRadius: "4px 4px 0 0",
    minHeight: "4px",
    transition: "height 0.3s ease",
  },
  barLabel: {
    fontSize: "0.6rem",
    color: "#4b5563",
    fontWeight: 500,
  },
  analyticsFooter: {
    fontSize: "0.75rem",
    color: "#4b5563",
    borderTop: "1px solid #1f1f1f",
    paddingTop: "0.75rem",
    margin: 0,
  },
};
