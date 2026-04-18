import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";
import mongoose from "mongoose";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default async function EarningsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  await connectToDatabase();
  const sellerId = new mongoose.Types.ObjectId(session.user.id);

  // 1. Total Earnings
  const totalEarningsData = await Order.aggregate([
    { $match: { sellerId, status: "completed" } },
    { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
  ]);

  const total = totalEarningsData[0]?.total || 0;
  const orderCount = totalEarningsData[0]?.count || 0;

  // 2. Monthly Earnings (Last 6 Months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyEarnings = await Order.aggregate([
    { $match: { sellerId, status: "completed", createdAt: { $gte: sixMonthsAgo } } },
    { $group: { _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } }, amount: { $sum: "$totalAmount" } } },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);

  // 3. Recent Transactions
  const recentTransactions = await Order.find({ sellerId, status: "completed" })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("itemId", "title")
    .lean();

  const monthlyChartData = monthlyEarnings.map((m: any) => ({
    label: MONTH_NAMES[m._id.month - 1],
    amount: m.amount,
  }));

  const maxAmount = Math.max(...monthlyChartData.map((d) => d.amount), 1);
  const isEmpty = monthlyChartData.length === 0;
  const avgOrderValue = orderCount > 0 ? total / orderCount : 0;

  return (
    <div style={s.page}>

      {/* ── Header ── */}
      <div>
        <h1 style={s.title}>Earnings</h1>
        <p style={s.subtitle}>Track your revenue from completed orders</p>
      </div>

      {/* ── Top Stats Row ── */}
      <div style={s.statsGrid}>
        {/* Total Earnings — hero card */}
        <div style={s.heroCard}>
          <div style={s.heroIconWrap}>
            <span>💰</span>
          </div>
          <div>
            <p style={s.heroLabel}>Total Earnings</p>
            <p style={s.heroValue}>₹{total.toLocaleString("en-IN")}</p>
            <p style={s.heroHint}>Across all {orderCount} completed orders</p>
          </div>
        </div>

        {/* Orders Completed */}
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, backgroundColor: "rgba(59,130,246,0.12)", color: "#3b82f6" }}>✅</div>
          <div>
            <p style={s.statLabel}>Orders Completed</p>
            <p style={s.statValue}>{orderCount}</p>
            <span style={s.noDataHint}>Lifetime</span>
          </div>
        </div>

        {/* Avg Order Value */}
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, backgroundColor: "rgba(139,92,246,0.12)", color: "#8b5cf6" }}>📊</div>
          <div>
            <p style={s.statLabel}>Avg Order Value</p>
            <p style={s.statValue}>₹{Math.round(avgOrderValue).toLocaleString("en-IN")}</p>
            <span style={s.noDataHint}>Per completed order</span>
          </div>
        </div>
      </div>

      {/* ── Bar Chart Card ── */}
      <div style={s.chartCard}>
        <div style={s.chartHeader}>
          <div>
            <p style={s.chartTitle}>Earnings Overview</p>
            <p style={s.chartSubtitle}>Revenue per month</p>
          </div>
        </div>

        <div style={s.chartArea}>
          {isEmpty ? (
            <div style={s.chartEmpty}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📈</div>
              <p style={s.chartEmptyTitle}>No earnings data yet</p>
              <p style={s.chartEmptyDesc}>Complete your first order to see revenue here.</p>
            </div>
          ) : (
            <div style={s.yAxisLabels}>
              {[1, 0.75, 0.5, 0.25, 0].map((frac) => (
                <span key={frac} style={s.yLabel}>
                  ₹{Math.round(maxAmount * frac).toLocaleString("en-IN")}
                </span>
              ))}
            </div>
          )}

          <div style={s.bars}>
            {monthlyChartData.map((item) => {
              const heightPct = (item.amount / maxAmount) * 100;
              return (
                <div key={item.label} style={s.barGroup}>
                  <div style={s.barTrack}>
                    <div
                      style={{
                        ...s.bar,
                        height: `${Math.max(heightPct, 4)}%`,
                        backgroundColor: "#f59e0b",
                        boxShadow: "0 0 12px rgba(245,158,11,0.3)",
                      }}
                      title={`₹${item.amount.toLocaleString("en-IN")}`}
                    />
                  </div>
                  <span style={s.barLabel}>{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Recent Transactions ── */}
      <div style={s.transCard}>
        <div style={s.chartHeader}>
          <div>
            <p style={s.chartTitle}>Recent Transactions</p>
            <p style={s.chartSubtitle}>Payments from completed orders</p>
          </div>
        </div>
        {recentTransactions.length === 0 ? (
          <div style={s.transEmpty}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.6rem" }}>🧾</div>
            <p style={s.chartEmptyTitle}>No transactions yet</p>
            <p style={s.chartEmptyDesc}>Completed order payments will be listed here.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {recentTransactions.map((tx: any) => (
              <div key={tx._id.toString()} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", backgroundColor: "#0a0a0a", borderRadius: "8px", border: "1px solid #1a1a1a" }}>
                <div>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "#f8fafc", fontWeight: 600 }}>{tx.itemId?.title || "Unknown Item"}</p>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b", marginTop: "0.2rem" }}>
                    {new Date(tx.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })} • {tx.paymentMethod.toUpperCase()}
                  </p>
                </div>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#10b981" }}>
                  +₹{tx.totalAmount.toLocaleString("en-IN")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Payout Info banner ── */}
      <div style={s.payoutBanner}>
        <div style={{ fontSize: "1.5rem" }}>🏦</div>
        <div style={{ flex: 1 }}>
          <p style={s.payoutTitle}>Payout Information</p>
          <p style={s.payoutDesc}>
            Connect your bank account or UPI to receive payouts once backend integration is complete.
          </p>
        </div>
        <button style={s.payoutBtn} disabled>Set Up Payout</button>
      </div>

    </div>
  );
}

/* ── Styles ── */
const s: Record<string, React.CSSProperties> = {
  page:       { display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "1100px", margin: "0 auto" },
  title:      { fontSize: "1.5rem", fontWeight: 800, color: "#f8fafc", letterSpacing: "-0.02em" },
  subtitle:   { fontSize: "0.8rem", color: "#64748b", marginTop: "0.2rem" },
  statsGrid:  { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" },
  heroCard:   {
    backgroundColor: "#1a1000", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "16px",
    padding: "1.5rem", display: "flex", alignItems: "center", gap: "1.1rem",
  },
  heroIconWrap: {
    width: "56px", height: "56px", borderRadius: "14px", backgroundColor: "rgba(245,158,11,0.15)",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem", flexShrink: 0,
  },
  heroLabel:  { fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600, margin: "0 0 0.2rem", textTransform: "uppercase", letterSpacing: "0.05em" },
  heroValue:  { fontSize: "2rem", fontWeight: 900, color: "#f59e0b", lineHeight: 1, margin: "0 0 0.3rem", letterSpacing: "-0.03em" },
  heroHint:   { fontSize: "0.72rem", color: "#4b5563", margin: 0 },
  statCard:   { backgroundColor: "#121212", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "1.25rem", display: "flex", alignItems: "center", gap: "1rem" },
  statIconWrap: { width: "46px", height: "46px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 },
  statLabel:  { fontSize: "0.72rem", color: "#64748b", fontWeight: 600, margin: "0 0 0.25rem", textTransform: "uppercase", letterSpacing: "0.04em" },
  statValue:  { fontSize: "1.5rem", fontWeight: 800, color: "#f8fafc", lineHeight: 1, margin: "0 0 0.3rem" },
  noDataHint: { fontSize: "0.7rem", color: "#374151", display: "inline-block" },
  chartCard:  { backgroundColor: "#121212", border: "1px solid #1f1f1f", borderRadius: "16px", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" },
  chartHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" },
  chartTitle: { fontSize: "0.95rem", fontWeight: 700, color: "#e2e8f0", margin: 0 },
  chartSubtitle: { fontSize: "0.75rem", color: "#4b5563", marginTop: "0.2rem", marginBottom: 0 },
  chartArea:  { position: "relative", height: "200px", display: "flex", flexDirection: "column" },
  chartEmpty: { position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 1, pointerEvents: "none" },
  chartEmptyTitle: { fontSize: "0.9rem", fontWeight: 700, color: "#475569", margin: "0 0 0.25rem" },
  chartEmptyDesc:  { fontSize: "0.78rem", color: "#374151", margin: 0, textAlign: "center", maxWidth: "220px" },
  yAxisLabels: { position: "absolute", left: 0, top: 0, bottom: "1.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between", width: "60px" },
  yLabel:     { fontSize: "0.65rem", color: "#374151" },
  bars:       { display: "flex", alignItems: "flex-end", justifyContent: "space-around", height: "100%", paddingBottom: "1.5rem", gap: "0.5rem", paddingLeft: "4px" },
  barGroup:   { display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem", flex: 1, height: "100%" },
  barTrack:   { flex: 1, width: "100%", display: "flex", alignItems: "flex-end", borderBottom: "1px solid #1f1f1f" },
  bar:        { width: "100%", maxWidth: "40px", margin: "0 auto", borderRadius: "5px 5px 0 0", transition: "height 0.4s ease", minHeight: "4px" },
  barLabel:   { fontSize: "0.65rem", color: "#4b5563", fontWeight: 600, flexShrink: 0 },
  transCard:  { backgroundColor: "#121212", border: "1px solid #1f1f1f", borderRadius: "16px", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" },
  transEmpty: { display: "flex", flexDirection: "column", alignItems: "center", padding: "2.5rem 1rem", textAlign: "center" },
  payoutBanner: { display: "flex", alignItems: "center", gap: "1rem", padding: "1.25rem 1.5rem", backgroundColor: "#0d1117", border: "1px solid #1f2937", borderRadius: "14px", flexWrap: "wrap" },
  payoutTitle: { fontSize: "0.9rem", fontWeight: 700, color: "#e2e8f0", margin: "0 0 0.2rem" },
  payoutDesc:  { fontSize: "0.78rem", color: "#4b5563", margin: 0 },
  payoutBtn:   { padding: "0.6rem 1.25rem", backgroundColor: "#1f2937", color: "#4b5563", border: "1px solid #2a3441", borderRadius: "8px", fontSize: "0.825rem", fontWeight: 700, cursor: "not-allowed", fontFamily: "inherit", whiteSpace: "nowrap", flexShrink: 0 },
};
