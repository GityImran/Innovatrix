"use client";

import React, { useEffect, useState } from "react";

interface Stats {
  totalUsers: number;
  activeUsers: number;
  pendingRequests: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={s.loading}>Loading stats...</div>;

  return (
    <div>
      <h1 style={s.title}>Admin Dashboard</h1>
      <div style={s.grid}>
        <div style={s.card}>
          <div style={s.cardLabel}>Total Users</div>
          <div style={s.cardValue}>{stats?.totalUsers || 0}</div>
        </div>
        <div style={s.card}>
          <div style={s.cardLabel}>Active Users</div>
          <div style={s.cardValue}>{stats?.activeUsers || 0}</div>
        </div>
        <div style={s.card}>
          <div style={s.cardLabel}>Pending Seller Requests</div>
          <div style={s.cardValue}>{stats?.pendingRequests || 0}</div>
        </div>
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
    color: "#f8fafc",
    fontSize: "2rem",
    fontWeight: 700,
  },
  loading: {
    color: "#94a3b8",
    textAlign: "center",
    marginTop: "4rem",
  },
};
