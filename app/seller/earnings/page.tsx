/**
 * app/seller/earnings/page.tsx
 * Earnings page — real zeroed stats, bar chart placeholder, ready for API.
 */

"use client";

import React, { useState } from "react";

// ── Replace with real API data when backend is ready ──
const TOTAL_EARNINGS = 0;
const THIS_WEEK_EARNINGS = 0;
const LAST_WEEK_EARNINGS = 0;
const TOTAL_ORDERS_COMPLETED = 0;
const AVG_ORDER_VALUE = 0;

const WEEKLY_CHART_DATA = [
  { day: "Mon", amount: 0 },
  { day: "Tue", amount: 0 },
  { day: "Wed", amount: 0 },
  { day: "Thu", amount: 0 },
  { day: "Fri", amount: 0 },
  { day: "Sat", amount: 0 },
  { day: "Sun", amount: 0 },
];

const MONTHLY_CHART_DATA = [
  { month: "Nov", amount: 0 },
  { month: "Dec", amount: 0 },
  { month: "Jan", amount: 0 },
  { month: "Feb", amount: 0 },
  { month: "Mar", amount: 0 },
  { month: "Apr", amount: 0 },
];

type ChartView = "weekly" | "monthly";

export default function EarningsPage() {
  const [chartView, setChartView] = useState<ChartView>("weekly");

  const chartData =
    chartView === "weekly" ? WEEKLY_CHART_DATA : MONTHLY_CHART_DATA;

  const maxAmount = Math.max(...chartData.map((d) => d.amount), 1);
  const isEmpty = chartData.every((d) => d.amount === 0);

  const weekChange =
    LAST_WEEK_EARNINGS > 0
      ? (((THIS_WEEK_EARNINGS - LAST_WEEK_EARNINGS) / LAST_WEEK_EARNINGS) * 100).toFixed(1)
      : null;

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
            <span style={s.heroIcon}>💰</span>
          </div>
          <div>
            <p style={s.heroLabel}>Total Earnings</p>
            <p style={s.heroValue}>
              ₹{TOTAL_EARNINGS.toLocaleString("en-IN")}
            </p>
            <p style={s.heroHint}>Across all completed orders</p>
          </div>
        </div>

        {/* Weekly */}
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, backgroundColor: "rgba(16,185,129,0.12)", color: "#10b981" }}>
            📅
          </div>
          <div>
            <p style={s.statLabel}>This Week</p>
            <p style={s.statValue}>₹{THIS_WEEK_EARNINGS.toLocaleString("en-IN")}</p>
            {weekChange !== null ? (
              <span style={{
                ...s.changeBadge,
                backgroundColor: Number(weekChange) >= 0 ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                color: Number(weekChange) >= 0 ? "#10b981" : "#ef4444",
              }}>
                {Number(weekChange) >= 0 ? "↑" : "↓"} {Math.abs(Number(weekChange))}% vs last week
              </span>
            ) : (
              <span style={s.noDataHint}>No data yet</span>
            )}
          </div>
        </div>

        {/* Completed Orders */}
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, backgroundColor: "rgba(59,130,246,0.12)", color: "#3b82f6" }}>
            ✅
          </div>
          <div>
            <p style={s.statLabel}>Orders Completed</p>
            <p style={s.statValue}>{TOTAL_ORDERS_COMPLETED}</p>
            <span style={s.noDataHint}>Lifetime</span>
          </div>
        </div>

        {/* Avg Order Value */}
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, backgroundColor: "rgba(139,92,246,0.12)", color: "#8b5cf6" }}>
            📊
          </div>
          <div>
            <p style={s.statLabel}>Avg Order Value</p>
            <p style={s.statValue}>₹{AVG_ORDER_VALUE.toLocaleString("en-IN")}</p>
            <span style={s.noDataHint}>Per completed order</span>
          </div>
        </div>
      </div>

      {/* ── Bar Chart Card ── */}
      <div style={s.chartCard}>
        {/* Chart header */}
        <div style={s.chartHeader}>
          <div>
            <p style={s.chartTitle}>Earnings Overview</p>
            <p style={s.chartSubtitle}>
              {chartView === "weekly"
                ? "Revenue per day this week"
                : "Revenue per month (last 6 months)"}
            </p>
          </div>
          {/* Toggle */}
          <div style={s.toggleGroup}>
            <button
              style={{ ...s.toggleBtn, ...(chartView === "weekly" ? s.toggleBtnActive : {}) }}
              onClick={() => setChartView("weekly")}
            >
              Weekly
            </button>
            <button
              style={{ ...s.toggleBtn, ...(chartView === "monthly" ? s.toggleBtnActive : {}) }}
              onClick={() => setChartView("monthly")}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Chart area */}
        <div style={s.chartArea}>
          {isEmpty ? (
            /* Empty state overlay */
            <div style={s.chartEmpty}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📈</div>
              <p style={s.chartEmptyTitle}>No earnings data yet</p>
              <p style={s.chartEmptyDesc}>
                Complete your first order to see revenue here.
              </p>
            </div>
          ) : (
            /* Y-axis labels */
            <div style={s.yAxisLabels}>
              {[1, 0.75, 0.5, 0.25, 0].map((frac) => (
                <span key={frac} style={s.yLabel}>
                  ₹{Math.round(maxAmount * frac).toLocaleString("en-IN")}
                </span>
              ))}
            </div>
          )}

          {/* Bars */}
          <div style={s.bars}>
            {chartData.map((item) => {
              const heightPct = isEmpty ? 0 : (item.amount / maxAmount) * 100;
              const label = "day" in item
                ? (item as { day: string; amount: number }).day
                : (item as { month: string; amount: number }).month;

              return (
                <div key={label} style={s.barGroup}>
                  <div style={s.barTrack}>
                    <div
                      style={{
                        ...s.bar,
                        height: `${Math.max(heightPct, isEmpty ? 8 : 4)}%`,
                        backgroundColor: isEmpty
                          ? "rgba(245,158,11,0.12)"
                          : "#f59e0b",
                        boxShadow: isEmpty
                          ? "none"
                          : "0 0 12px rgba(245,158,11,0.3)",
                      }}
                      title={item.amount > 0 ? `₹${item.amount.toLocaleString("en-IN")}` : "₹0"}
                    />
                  </div>
                  <span style={s.barLabel}>{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Recent Transactions placeholder ── */}
      <div style={s.transCard}>
        <div style={s.chartHeader}>
          <div>
            <p style={s.chartTitle}>Recent Transactions</p>
            <p style={s.chartSubtitle}>Payments from completed orders</p>
          </div>
        </div>

        <div style={s.transEmpty}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.6rem" }}>🧾</div>
          <p style={s.chartEmptyTitle}>No transactions yet</p>
          <p style={s.chartEmptyDesc}>
            Completed order payments will be listed here.
          </p>
        </div>
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
        <button style={s.payoutBtn} disabled>
          Set Up Payout
        </button>
      </div>

    </div>
  );
}

/* ── Styles ── */
const s: Record<string, React.CSSProperties> = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    maxWidth: "1100px",
    margin: "0 auto",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: 800,
    color: "#f8fafc",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    fontSize: "0.8rem",
    color: "#64748b",
    marginTop: "0.2rem",
  },
  /* Stats grid */
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
  },
  heroCard: {
    backgroundColor: "#1a1000",
    border: "1px solid rgba(245,158,11,0.2)",
    borderRadius: "16px",
    padding: "1.5rem",
    display: "flex",
    alignItems: "center",
    gap: "1.1rem",
    gridColumn: "span 1",
  },
  heroIconWrap: {
    width: "56px",
    height: "56px",
    borderRadius: "14px",
    backgroundColor: "rgba(245,158,11,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.75rem",
    flexShrink: 0,
  },
  heroIcon: {},
  heroLabel: {
    fontSize: "0.75rem",
    color: "#94a3b8",
    fontWeight: 600,
    margin: "0 0 0.2rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  heroValue: {
    fontSize: "2rem",
    fontWeight: 900,
    color: "#f59e0b",
    lineHeight: 1,
    margin: "0 0 0.3rem",
    letterSpacing: "-0.03em",
  },
  heroHint: {
    fontSize: "0.72rem",
    color: "#4b5563",
    margin: 0,
  },
  statCard: {
    backgroundColor: "#121212",
    border: "1px solid #1f1f1f",
    borderRadius: "14px",
    padding: "1.25rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  statIconWrap: {
    width: "46px",
    height: "46px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.3rem",
    flexShrink: 0,
  },
  statLabel: {
    fontSize: "0.72rem",
    color: "#64748b",
    fontWeight: 600,
    margin: "0 0 0.25rem",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  statValue: {
    fontSize: "1.5rem",
    fontWeight: 800,
    color: "#f8fafc",
    lineHeight: 1,
    margin: "0 0 0.3rem",
  },
  changeBadge: {
    display: "inline-block",
    fontSize: "0.68rem",
    fontWeight: 700,
    borderRadius: "6px",
    padding: "2px 7px",
  },
  noDataHint: {
    fontSize: "0.7rem",
    color: "#374151",
    display: "inline-block",
  },
  /* Chart */
  chartCard: {
    backgroundColor: "#121212",
    border: "1px solid #1f1f1f",
    borderRadius: "16px",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  chartHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "0.75rem",
  },
  chartTitle: {
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "#e2e8f0",
    margin: 0,
  },
  chartSubtitle: {
    fontSize: "0.75rem",
    color: "#4b5563",
    marginTop: "0.2rem",
    marginBottom: 0,
  },
  toggleGroup: {
    display: "flex",
    backgroundColor: "#0a0a0a",
    borderRadius: "8px",
    padding: "3px",
    gap: "2px",
    border: "1px solid #1f1f1f",
  },
  toggleBtn: {
    padding: "0.35rem 0.85rem",
    borderRadius: "6px",
    border: "none",
    fontSize: "0.75rem",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    backgroundColor: "transparent",
    color: "#4b5563",
    transition: "all 0.2s",
  },
  toggleBtnActive: {
    backgroundColor: "#f59e0b",
    color: "#000",
  },
  chartArea: {
    position: "relative",
    height: "200px",
    display: "flex",
    flexDirection: "column",
  },
  chartEmpty: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    pointerEvents: "none",
  },
  chartEmptyTitle: {
    fontSize: "0.9rem",
    fontWeight: 700,
    color: "#475569",
    margin: "0 0 0.25rem",
  },
  chartEmptyDesc: {
    fontSize: "0.78rem",
    color: "#374151",
    margin: 0,
    textAlign: "center",
    maxWidth: "220px",
  },
  yAxisLabels: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: "1.5rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    width: "60px",
  },
  yLabel: {
    fontSize: "0.65rem",
    color: "#374151",
  },
  bars: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-around",
    height: "100%",
    paddingBottom: "1.5rem",
    gap: "0.5rem",
    paddingLeft: "4px",
  },
  barGroup: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.4rem",
    flex: 1,
    height: "100%",
  },
  barTrack: {
    flex: 1,
    width: "100%",
    display: "flex",
    alignItems: "flex-end",
    borderBottom: "1px solid #1f1f1f",
  },
  bar: {
    width: "100%",
    maxWidth: "40px",
    margin: "0 auto",
    borderRadius: "5px 5px 0 0",
    transition: "height 0.4s ease",
    minHeight: "4px",
  },
  barLabel: {
    fontSize: "0.65rem",
    color: "#4b5563",
    fontWeight: 600,
    flexShrink: 0,
  },
  /* Transactions */
  transCard: {
    backgroundColor: "#121212",
    border: "1px solid #1f1f1f",
    borderRadius: "16px",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  transEmpty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "2.5rem 1rem",
    textAlign: "center",
  },
  /* Payout banner */
  payoutBanner: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "1.25rem 1.5rem",
    backgroundColor: "#0d1117",
    border: "1px solid #1f2937",
    borderRadius: "14px",
    flexWrap: "wrap",
  },
  payoutTitle: {
    fontSize: "0.9rem",
    fontWeight: 700,
    color: "#e2e8f0",
    margin: "0 0 0.2rem",
  },
  payoutDesc: {
    fontSize: "0.78rem",
    color: "#4b5563",
    margin: 0,
  },
  payoutBtn: {
    padding: "0.6rem 1.25rem",
    backgroundColor: "#1f2937",
    color: "#4b5563",
    border: "1px solid #2a3441",
    borderRadius: "8px",
    fontSize: "0.825rem",
    fontWeight: 700,
    cursor: "not-allowed",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
};
