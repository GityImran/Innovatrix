"use client";

import React, { useEffect, useState } from "react";

interface AnalyticsData {
  activeUsers: number;
  newSellers: number;
  totalListings: number;
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((stats) => {
        setData({
          activeUsers: stats.activeUsers,
          newSellers: stats.pendingRequests,
          totalListings: stats.totalListings,
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={s.loading}>Loading analytics...</div>;

  return (
    <div>
      <h1 style={s.title}>Analytics</h1>
      <div style={s.grid}>
        <div style={s.card}>
          <div style={s.cardLabel}>Active Users</div>
          <div style={s.cardValue}>{data?.activeUsers || 0}</div>
        </div>
        <div style={s.card}>
          <div style={s.cardLabel}>New Seller Requests</div>
          <div style={s.cardValue}>{data?.newSellers || 0}</div>
        </div>
        <div style={s.card}>
          <div style={s.cardLabel}>Total Listings</div>
          <div style={s.cardValue}>{data?.totalListings || 0}</div>
        </div>
      </div>
      
      <div style={s.chartPlaceholder}>
        <p>User Growth Chart Placeholder</p>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  title: {
    fontSize: "1.875rem",
    fontWeight: 700,
    color: "#f8fafc",
    marginBottom: "2rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "1.5rem",
    marginBottom: "2rem",
  },
  card: {
    backgroundColor: "#0a0a0a",
    border: "1px solid #1f1f1f",
    padding: "1.5rem",
    borderRadius: "12px",
  },
  cardLabel: {
    color: "#94a3b8",
    fontSize: "0.875rem",
    marginBottom: "0.5rem",
  },
  cardValue: {
    color: "#f59e0b",
    fontSize: "2rem",
    fontWeight: 700,
  },
  chartPlaceholder: {
    height: "300px",
    backgroundColor: "#0a0a0a",
    border: "1px solid #1f1f1f",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#475569",
    fontSize: "1.1rem",
  },
  loading: {
    color: "#94a3b8",
    textAlign: "center",
    marginTop: "4rem",
  },
};
