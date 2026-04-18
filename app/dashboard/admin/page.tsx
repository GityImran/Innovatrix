"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area
} from "recharts";
import {
  Users, UserCheck, Clock, TrendingUp, Recycle, ShieldAlert, Activity,
  Zap, BarChart3, ChevronRight, AlertCircle, ShoppingBag, ArrowUpRight
} from "lucide-react";

interface Stats {
  totalUsers: number;
  activeUsers: number;
  pendingRequests: number;
}

const mockActivity = [
  { id: 1, type: "seller", msg: "New seller request: Rahul S.", time: "2 mins ago", icon: <UserCheck size={14} /> },
  { id: 2, type: "sale", msg: "Item sold: Engineering Graphics Set", time: "15 mins ago", icon: <ShoppingBag size={14} /> },
  { id: 3, type: "listing", msg: "New listing: Lab Coat (Size L)", time: "1 hour ago", icon: <Zap size={14} /> },
  { id: 4, type: "alert", msg: "Unusual activity detected in Electronics", time: "3 hours ago", icon: <ShieldAlert size={14} /> },
];

const chartData = [
  { day: "Mon", users: 30, revenue: 1200 },
  { day: "Tue", users: 45, revenue: 1800 },
  { day: "Wed", users: 60, revenue: 2400 },
  { day: "Thu", users: 55, revenue: 2100 },
  { day: "Fri", users: 80, revenue: 3200 },
  { day: "Sat", users: 95, revenue: 3800 },
  { day: "Sun", users: 88, revenue: 3500 },
];

const StatCard = ({ label, value, color, icon: Icon, delay }: any) => (
  <motion.div
    whileHover={{ scale: 1.03, translateY: -5 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    style={{ ...s.card, borderLeft: `4px solid ${color}` }}
  >
    <div style={s.cardHeader}>
      <p style={s.cardLabel}>{label}</p>
      <div style={{ ...s.iconWrapper, backgroundColor: `${color}20`, color }}>
        <Icon size={20} />
      </div>
    </div>
    <h2 style={s.cardValue}>{value}</h2>
    <div style={s.cardFooter}>
      <span style={{ color: "#22c55e", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "2px" }}>
        <ArrowUpRight size={12} /> +12%
      </span>
      <span style={{ color: "#64748b", fontSize: "0.75rem" }}>since last week</span>
    </div>
  </motion.div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingSellers, setPendingSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/stats").then(res => res.json()),
      fetch("/api/admin/verification").then(res => res.json())
    ])
      .then(([statsData, verificationData]) => {
        setStats(statsData);
        setPendingSellers(verificationData.slice(0, 4)); // Show up to 4 on dashboard
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div style={s.loadingContainer}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        style={s.spinner}
      />
      <p style={s.loadingText}>Loading Admin Insights...</p>
    </div>
  );

  return (
    <div style={s.pageWrapper}>
      <header style={s.header}>
        <div>
          <h1 style={s.title}>Admin <span style={{ color: "#22c55e" }}>Intelligence</span></h1>
          <p style={s.subtitle}>Overview of Circular Campus Exchange Ecosystem</p>
        </div>
        <div style={s.headerActions}>
          <button style={s.refreshBtn} onClick={() => window.location.reload()}>
            <Activity size={16} /> Refresh Data
          </button>
        </div>
      </header>

      <div style={s.mainGrid}>
        {/* Left Column - 2fr */}
        <section style={s.contentColumn}>
          {/* KPI Cards */}
          <div style={s.statsGrid}>
            <StatCard
              label="Total Residents"
              value={stats?.totalUsers || 0}
              color="#3b82f6"
              icon={Users}
              delay={0.1}
            />
            <StatCard
              label="Active Exchange"
              value={stats?.activeUsers || 142}
              color="#22c55e"
              icon={BarChart3}
              delay={0.2}
            />
            <StatCard
              label="Pending Verifications"
              value={stats?.pendingRequests || 0}
              color="#f59e0b"
              icon={Clock}
              delay={0.3}
            />
          </div>

          {/* Main Chart Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={s.card}
          >
            <div style={s.chartHeader}>
              <h3 style={s.panelTitle}><TrendingUp size={18} style={{ color: "#22c55e" }} /> Platform Growth</h3>
              <div style={s.chartLegend}>
                <span style={{ color: "#22c55e" }}>● Active Users</span>
              </div>
            </div>
            <div style={{ height: 350, marginTop: "1rem" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#475569" axisLine={false} tickLine={false} />
                  <YAxis stroke="#475569" axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                    itemStyle={{ color: "#22c55e" }}
                  />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <Area type="monotone" dataKey="users" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Sustainability and Bottom Panels */}
          <div style={s.bottomRows}>
            <motion.div
              style={s.card}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 style={s.panelTitle}><Recycle size={18} style={{ color: "#22c55e" }} /> 🌱 Circular Impact</h3>
              <div style={s.impactGrid}>
                <div style={s.impactItem}>
                  <p style={s.impactLabel}>Items Reused</p>
                  <p style={s.impactValue}>1,240</p>
                </div>
                <div style={s.impactItem}>
                  <p style={s.impactLabel}>Waste Saved</p>
                  <p style={s.impactValue}>320kg</p>
                </div>
                <div style={s.impactItem}>
                  <p style={s.impactLabel}>CO₂ Reduced</p>
                  <p style={s.impactValue}>1.8 tons</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              style={s.card}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h3 style={s.panelTitle}><Zap size={18} style={{ color: "#f59e0b" }} /> Quick Actions</h3>
              <div style={s.actionGrid}>
                <button style={s.actBtn} onClick={() => window.location.href = '/dashboard/admin/seller-verification'}>
                  Approve Sellers <span style={s.badge}>{stats?.pendingRequests || 0} Pending</span>
                </button>
                <button style={s.actBtn} onClick={() => window.location.href = '/dashboard/admin/active-sellers'}>
                  Manage Listings <ChevronRight size={14} />
                </button>
                <button style={s.actBtn} onClick={() => window.location.href = '/dashboard/admin/analytics'}>
                  View Reports <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          </div>

          {/* Pending Verifications In-Dashboard View */}
          <motion.div
            style={{ ...s.card, marginTop: "1.5rem" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div style={s.chartHeader}>
              <h3 style={s.panelTitle}><UserCheck size={18} style={{ color: "#f59e0b" }} /> Action Required: Seller Verifications</h3>
              <button 
                style={s.viewAllBtn} 
                onClick={() => window.location.href = '/dashboard/admin/seller-verification'}
              >
                View full list <ChevronRight size={14} />
              </button>
            </div>
            
            {pendingSellers.length > 0 ? (
              <div style={s.sellerList}>
                {pendingSellers.map((seller) => (
                  <div key={seller._id} style={s.sellerRow}>
                    <div style={s.sellerInfo}>
                      <p style={s.sellerName}>{seller.fullName}</p>
                      <p style={s.sellerSub}>{seller.email} • {seller.collegeName}</p>
                    </div>
                    <div style={s.sellerActions}>
                       <span style={{ ...s.statusBadge, backgroundColor: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
                         {seller.status}
                       </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#64748b", fontSize: "0.875rem", padding: "1rem 0" }}>No pending verifications at the moment.</p>
            )}
          </motion.div>
        </section>

        {/* Right Column - 1fr */}
        <aside style={s.sidebarColumn}>
          <motion.div
            style={s.card}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 style={s.panelTitle}><Activity size={18} style={{ color: "#3b82f6" }} /> Recent Activity</h3>
            <div style={s.activityList}>
              {mockActivity.map((act) => (
                <div key={act.id} style={s.activityItem}>
                  <div style={s.activityIcon}>{act.icon}</div>
                  <div style={s.activityContent}>
                    <p style={s.activityMsg}>{act.msg}</p>
                    <p style={s.activityTime}>{act.time}</p>
                  </div>
                  <ChevronRight size={14} style={{ color: "#475569" }} />
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            style={{ ...s.card, marginTop: "1.5rem" }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 style={s.panelTitle}><AlertCircle size={18} style={{ color: "#ef4444" }} /> Smart Alerts</h3>
            <div style={s.alertList}>
              <div style={s.alertItem}>
                <div style={{ ...s.alertDot, backgroundColor: "#ef4444" }} />
                <p style={s.alertText}>{stats?.pendingRequests || 0} pending seller requests</p>
              </div>
              <div style={s.alertItem}>
                <div style={{ ...s.alertDot, backgroundColor: "#f59e0b" }} />
                <p style={s.alertText}>10 items unsold {">"} 30 days</p>
              </div>
              <div style={s.alertItem}>
                <div style={{ ...s.alertDot, backgroundColor: "#3b82f6" }} />
                <p style={s.alertText}>Platform policy update pending</p>
              </div>
            </div>
          </motion.div>
        </aside>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  pageWrapper: {
    minHeight: "100vh",
    backgroundColor: "#000",
    backgroundImage: "radial-gradient(circle at top left, #22c55e15, transparent 40%), radial-gradient(circle at bottom right, #3b82f615, transparent 40%)",
    padding: "2rem",
    fontFamily: "'Inter', system-ui, sans-serif",
    color: "#f8fafc",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "2.5rem",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    marginBottom: "0.25rem",
  },
  subtitle: {
    color: "#64748b",
    fontSize: "0.95rem",
  },
  headerActions: {
    display: "flex",
    gap: "1rem",
  },
  refreshBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#f8fafc",
    padding: "0.6rem 1.2rem",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.875rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "3fr 1.2fr",
    gap: "1.5rem",
  },
  contentColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  sidebarColumn: {
    display: "flex",
    flexDirection: "column",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1rem",
  },
  card: {
    background: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "20px",
    padding: "1.5rem",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
    transition: "all 0.3s ease",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  cardLabel: {
    color: "#94a3b8",
    fontSize: "0.85rem",
    fontWeight: 500,
  },
  iconWrapper: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cardValue: {
    fontSize: "2.25rem",
    fontWeight: 800,
    color: "#fff",
    marginBottom: "0.75rem",
  },
  cardFooter: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  panelTitle: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#f1f5f9",
    marginBottom: "1.25rem",
  },
  chartHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chartLegend: {
    fontSize: "0.75rem",
    fontWeight: 500,
  },
  bottomRows: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1.5rem",
  },
  impactGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1rem",
  },
  impactItem: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    padding: "1rem",
    borderRadius: "12px",
    textAlign: "center",
  },
  impactLabel: {
    fontSize: "0.7rem",
    color: "#64748b",
    marginBottom: "0.25rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  impactValue: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#22c55e",
  },
  actionGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  actBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#e2e8f0",
    padding: "0.75rem",
    borderRadius: "10px",
    fontSize: "0.875rem",
    fontWeight: 500,
    cursor: "pointer",
    textAlign: "left",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "all 0.2s ease",
  },
  activityList: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  activityItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  activityIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#f8fafc",
  },
  activityContent: {
    flex: 1,
  },
  activityMsg: {
    fontSize: "0.875rem",
    fontWeight: 500,
    margin: 0,
  },
  activityTime: {
    fontSize: "0.75rem",
    color: "#64748b",
  },
  alertList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  alertItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.75rem",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: "10px",
  },
  alertDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
  },
  alertText: {
    fontSize: "0.875rem",
    color: "#cbd5e1",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#000",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid rgba(34, 197, 94, 0.1)",
    borderTop: "3px solid #22c55e",
    borderRadius: "50%",
  },
  loadingText: {
    marginTop: "1.5rem",
    color: "#64748b",
    fontSize: "0.9rem",
    letterSpacing: "0.05em",
  },
  badge: {
    backgroundColor: "rgba(245,158,11,0.2)",
    color: "#f59e0b",
    padding: "0.15rem 0.5rem",
    borderRadius: "99px",
    fontSize: "0.75rem",
    fontWeight: 600,
  },
  viewAllBtn: {
    backgroundColor: "transparent",
    border: "none",
    color: "#3b82f6",
    fontSize: "0.875rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
    fontWeight: 500,
  },
  sellerList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    marginTop: "1rem",
  },
  sellerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.875rem",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: "10px",
    border: "1px solid rgba(255, 255, 255, 0.05)",
  },
  sellerInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  sellerName: {
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "#f8fafc",
    margin: 0,
  },
  sellerSub: {
    fontSize: "0.75rem",
    color: "#94a3b8",
    margin: 0,
  },
  sellerActions: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  statusBadge: {
    padding: "0.25rem 0.6rem",
    borderRadius: "99px",
    fontSize: "0.75rem",
    fontWeight: 600,
    textTransform: "capitalize",
    border: "1px solid rgba(245,158,11,0.2)",
  },
};
