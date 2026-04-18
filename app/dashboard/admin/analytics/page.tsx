"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { 
  Users, TrendingUp, Zap, AlertCircle, ShoppingBag, 
  MessageSquare, BarChart2, Clock 
} from "lucide-react";

interface AnalyticsData {
  activeUsers: number;
  newSellers: number;
  totalListings: number;
}

const userData = [
  { day: "Mon", users: 30 },
  { day: "Tue", users: 50 },
  { day: "Wed", users: 70 },
  { day: "Thu", users: 65 },
  { day: "Fri", users: 85 },
  { day: "Sat", users: 110 },
  { day: "Sun", users: 95 },
];

const categoryData = [
  { name: "Books", value: 40 },
  { name: "Electronics", value: 25 },
  { name: "Hostel", value: 35 },
];

const CATEGORY_COLORS = ["#22c55e", "#3b82f6", "#f59e0b"];

// Framer Motion variant for cards
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const AnimatedCard = ({ children, style = {}, delay = 0, className = "" }: any) => (
  <motion.div
    variants={cardVariants}
    initial="hidden"
    animate="visible"
    transition={{ delay }}
    style={{ ...s.card, ...style }}
    className={className}
    whileHover={{ translateY: -3, boxShadow: "0 12px 40px rgba(0,0,0,0.5)" }}
  >
    {children}
  </motion.div>
);

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("Last 7 days");

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

  if (loading) return (
    <div style={s.loadingContainer}>
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        style={s.spinner}
      />
      <p style={s.loadingText}>Loading Analytics...</p>
    </div>
  );

  return (
    <div style={s.pageWrapper}>
      <header style={s.header}>
        <div>
          <h1 style={s.title}>Platform <span style={{ color: "#3b82f6" }}>Analytics</span></h1>
          <p style={s.subtitle}>Deep dive into platform trends and user engagement</p>
        </div>
        <div style={s.headerActions}>
          <select 
            style={s.selectFilter} 
            value={timeFilter} 
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>This Year</option>
          </select>
        </div>
      </header>

      {/* KPI Cards */}
      <div style={s.kpiGrid}>
        <AnimatedCard delay={0.1} style={{ borderLeft: "4px solid #22c55e" }}>
          <div style={s.kpiHeader}>
            <p style={s.kpiLabel}>Active Users</p>
            <Users size={18} color="#22c55e" />
          </div>
          <h2 style={s.kpiValue}>{data?.activeUsers || 0}</h2>
          <p style={{ ...s.kpiTrend, color: "#22c55e" }}><TrendingUp size={14} /> +12% vs last period</p>
        </AnimatedCard>

        <AnimatedCard delay={0.2} style={{ borderLeft: "4px solid #f59e0b" }}>
          <div style={s.kpiHeader}>
            <p style={s.kpiLabel}>New Seller Requests</p>
            <Clock size={18} color="#f59e0b" />
          </div>
          <h2 style={s.kpiValue}>{data?.newSellers || 0}</h2>
          <p style={{ ...s.kpiTrend, color: "#64748b" }}>Action required</p>
        </AnimatedCard>

        <AnimatedCard delay={0.3} style={{ borderLeft: "4px solid #3b82f6" }}>
          <div style={s.kpiHeader}>
            <p style={s.kpiLabel}>Total Listings</p>
            <ShoppingBag size={18} color="#3b82f6" />
          </div>
          <h2 style={s.kpiValue}>{data?.totalListings || 0}</h2>
          <p style={{ ...s.kpiTrend, color: "#22c55e" }}><TrendingUp size={14} /> +5% vs last period</p>
        </AnimatedCard>
      </div>

      <div style={s.mainGrid}>
        {/* User Growth Chart */}
        <AnimatedCard delay={0.4} style={s.chartCard}>
          <h3 style={s.panelTitle}><TrendingUp size={18} color="#22c55e" /> User Growth ({timeFilter})</h3>
          <div style={{ height: "300px", width: "100%", marginTop: "1rem" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <XAxis dataKey="day" stroke="#94a3b8" axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                  itemStyle={{ color: "#22c55e" }}
                />
                <Line type="monotone" dataKey="users" stroke="#22c55e" strokeWidth={3} dot={{ fill: "#22c55e", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </AnimatedCard>

        {/* Category Breakdown */}
        <AnimatedCard delay={0.5}>
          <h3 style={s.panelTitle}><BarChart2 size={18} color="#3b82f6" /> Category Breakdown</h3>
          <div style={{ height: "250px", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={categoryData} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={90} 
                  innerRadius={60}
                  paddingAngle={5}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </AnimatedCard>

        {/* Sustainability Impact */}
        <AnimatedCard delay={0.6} style={{ borderTop: "4px solid #10b981" }}>
          <h3 style={s.panelTitle}>🌱 Sustainability Impact (USP)</h3>
          <div style={s.listGroup}>
            <div style={s.listItem}>
              <span style={s.listLabel}>Items Reused</span>
              <span style={{ ...s.listValue, color: "#10b981" }}>1,240</span>
            </div>
            <div style={s.listItem}>
              <span style={s.listLabel}>Waste Reduced</span>
              <span style={{ ...s.listValue, color: "#f59e0b" }}>320kg</span>
            </div>
            <div style={s.listItem}>
              <span style={s.listLabel}>CO₂ Saved</span>
              <span style={{ ...s.listValue, color: "#3b82f6" }}>1.8 tons</span>
            </div>
          </div>
        </AnimatedCard>

        {/* Smart Insights Panel */}
        <AnimatedCard delay={0.7}>
          <h3 style={s.panelTitle}><Zap size={18} color="#f59e0b" /> Smart Insights</h3>
          <ul style={s.insightList}>
            <li style={s.insightItem}>
              <span style={s.insightIcon}>📈</span> 
              <span>Users increased by <strong style={{ color: "#22c55e" }}>20%</strong> this week. Focus on onboarding.</span>
            </li>
            <li style={s.insightItem}>
              <span style={s.insightIcon}>🔥</span> 
              <span><strong style={{ color: "#3b82f6" }}>Electronics</strong> are currently trending in searches!</span>
            </li>
            <li style={s.insightItem}>
              <span style={s.insightIcon}>⚠</span> 
              <span><strong style={{ color: "#ef4444" }}>10 items</strong> unsold {">"} 30 days. Consider sending price drop suggestions.</span>
            </li>
          </ul>
        </AnimatedCard>

        {/* Top Performing Listings */}
        <AnimatedCard delay={0.8}>
          <h3 style={s.panelTitle}><ShoppingBag size={18} color="#8b5cf6" /> Top Listings</h3>
          <div style={s.highlightList}>
            <div style={s.highlightItem}>
              <div>
                <p style={s.highlightTitle}>Casio fx-991EX Calculator</p>
                <p style={s.highlightSub}>Electronics</p>
              </div>
              <div style={s.highlightScore}>25 sales</div>
            </div>
            <div style={s.highlightItem}>
              <div>
                <p style={s.highlightTitle}>Data Structures & Algorithms</p>
                <p style={s.highlightSub}>Books</p>
              </div>
              <div style={s.highlightScore}>18 sales</div>
            </div>
          </div>
        </AnimatedCard>

        {/* User Engagement */}
        <AnimatedCard delay={0.9}>
          <h3 style={s.panelTitle}><MessageSquare size={18} color="#ec4899" /> User Engagement</h3>
          <div style={s.listGroup}>
            <div style={s.listItem}>
              <span style={s.listLabel}>Avg messages per user</span>
              <span style={s.listValue}>14.5</span>
            </div>
            <div style={s.listItem}>
              <span style={s.listLabel}>Chats initiated today</span>
              <span style={s.listValue}>89</span>
            </div>
            <div style={s.listItem}>
              <span style={s.listLabel}>Conversion rate (chat → sale)</span>
              <span style={{ ...s.listValue, color: "#22c55e" }}>32%</span>
            </div>
          </div>
        </AnimatedCard>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  pageWrapper: {
    minHeight: "100vh",
    backgroundColor: "#000",
    backgroundImage: "radial-gradient(circle at top right, #3b82f615, transparent 40%), radial-gradient(circle at bottom left, #22c55e10, transparent 40%)",
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
    color: "#94a3b8",
    fontSize: "0.95rem",
  },
  headerActions: {
    display: "flex",
    gap: "1rem",
  },
  selectFilter: {
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#f8fafc",
    padding: "0.6rem 2.5rem 0.6rem 1rem",
    borderRadius: "8px",
    fontSize: "0.875rem",
    cursor: "pointer",
    outline: "none",
    appearance: "none",
    backgroundImage: "url(\"data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 0.7rem top 50%",
    backgroundSize: "0.65rem auto",
    transition: "all 0.2s ease",
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1.5rem",
    marginBottom: "2rem",
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gridAutoRows: "minmax(250px, auto)",
    gap: "1.5rem",
  },
  chartCard: {
    gridColumn: "span 2",
  },
  card: {
    background: "rgba(17, 25, 40, 0.6)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "16px",
    padding: "1.5rem",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
    display: "flex",
    flexDirection: "column",
  },
  kpiHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  kpiLabel: {
    color: "#94a3b8",
    fontSize: "0.875rem",
    fontWeight: 500,
  },
  kpiValue: {
    fontSize: "2.5rem",
    fontWeight: 800,
    color: "#fff",
    marginBottom: "0.5rem",
  },
  kpiTrend: {
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
    fontSize: "0.8rem",
    fontWeight: 500,
  },
  panelTitle: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#f1f5f9",
    marginBottom: "1.25rem",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
    paddingBottom: "0.75rem",
  },
  listGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    flex: 1,
    justifyContent: "center",
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.75rem 1rem",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: "8px",
  },
  listLabel: {
    color: "#94a3b8",
    fontSize: "0.9rem",
    fontWeight: 500,
  },
  listValue: {
    fontSize: "1.2rem",
    fontWeight: 700,
    color: "#f8fafc",
  },
  insightList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  insightItem: {
    display: "flex",
    gap: "1rem",
    alignItems: "flex-start",
    fontSize: "0.95rem",
    color: "#cbd5e1",
    lineHeight: 1.5,
    padding: "0.75rem",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderRadius: "8px",
    border: "1px solid rgba(255, 255, 255, 0.05)",
  },
  insightIcon: {
    fontSize: "1.25rem",
  },
  highlightList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  highlightItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: "10px",
    borderLeft: "3px solid #8b5cf6",
  },
  highlightTitle: {
    color: "#f8fafc",
    fontWeight: 600,
    fontSize: "0.95rem",
    marginBottom: "0.25rem",
  },
  highlightSub: {
    color: "#64748b",
    fontSize: "0.8rem",
  },
  highlightScore: {
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    color: "#a78bfa",
    padding: "0.25rem 0.75rem",
    borderRadius: "999px",
    fontSize: "0.8rem",
    fontWeight: 600,
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
    border: "3px solid rgba(59, 130, 246, 0.1)",
    borderTop: "3px solid #3b82f6",
    borderRadius: "50%",
  },
  loadingText: {
    marginTop: "1.5rem",
    color: "#94a3b8",
    fontSize: "0.9rem",
    letterSpacing: "0.05em",
  },
};
