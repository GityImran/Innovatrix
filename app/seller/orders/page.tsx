"use client";

import React, { useEffect, useState } from "react";

type OrderStatus = "pending" | "completed" | "cancelled";

export interface Order {
  _id: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  itemModel: "Product" | "RentItem";
  orderType: "purchase" | "rent";
  buyerId: {
    name: string;
    email: string;
  };
  item?: {
    title: string;
    category: string;
    images: string[];
  };
}

const STATUS_META: Record<
  OrderStatus,
  { color: string; bg: string; border: string; icon: string; label: string }
> = {
  pending:   { label: "Pending",   color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)",  icon: "⏳" },
  completed: { label: "Completed", color: "#10b981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)",  icon: "✅" },
  cancelled: { label: "Cancelled", color: "#ef4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)",   icon: "❌" },
};

const AVATAR_COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#14b8a6"];

type FilterTab = "All" | OrderStatus;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<FilterTab>("All");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/seller/orders");
      if (res.ok) setOrders(await res.json());
    } catch (err) {
      console.error("Fetch orders failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const countFor = (tab: FilterTab) =>
    tab === "All" ? orders.length : orders.filter((o) => o.status === tab).length;

  const filtered =
    filter === "All" ? orders : orders.filter((o) => o.status === filter);

  const handleProcess = async (id: string, currentStatus: OrderStatus) => {
    if (currentStatus !== "pending") return;

    setProcessingId(id);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });
      if (res.ok) fetchOrders();
    } catch (err) {
      console.error("Failed to complete order:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const stats = {
    total:     orders.length,
    pending:   orders.filter((o) => o.status === "pending").length,
    completed: orders.filter((o) => o.status === "completed").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
        <p style={{ color: "#64748b" }}>Loading orders…</p>
      </div>
    );
  }

  return (
    <div style={s.page}>

      {/* ── Header ── */}
      <div>
        <h1 style={s.title}>Orders</h1>
        <p style={s.subtitle}>Track and manage buyer orders for your listings</p>
      </div>

      {/* ── Summary Cards ── */}
      <div style={s.summaryGrid}>
        {[
          { label: "Total Orders", value: stats.total,     icon: "📋", color: "#3b82f6" },
          { label: "Pending",      value: stats.pending,   icon: "⏳", color: "#f59e0b" },
          { label: "Completed",    value: stats.completed, icon: "✅", color: "#10b981" },
          { label: "Cancelled",    value: stats.cancelled, icon: "❌", color: "#ef4444" },
        ].map(({ label, value, icon, color }) => (
          <div key={label} style={s.summaryCard}>
            <div style={{ ...s.summaryIcon, backgroundColor: color + "18", color }}>{icon}</div>
            <div>
              <p style={s.summaryValue}>{value}</p>
              <p style={s.summaryLabel}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter Tabs ── */}
      <div style={s.tabRow}>
        {(["All", "pending", "completed", "cancelled"] as const).map((tab) => (
          <button
            key={tab}
            style={{ ...s.tab, ...(filter === tab ? s.tabActive : s.tabInactive) }}
            onClick={() => setFilter(tab)}
          >
            {tab !== "All" && STATUS_META[tab].icon + " "}
            {tab === "All" ? "All" : STATUS_META[tab].label}
            <span style={{
              ...s.tabBadge,
              ...(filter === tab
                ? { backgroundColor: "#f59e0b", color: "#000" }
                : { backgroundColor: "#1f1f1f", color: "#64748b" }),
            }}>
              {countFor(tab)}
            </span>
          </button>
        ))}
      </div>

      {/* ── Empty State ── */}
      {filtered.length === 0 && (
        <div style={s.empty}>
          <div style={{ fontSize: "3.5rem", marginBottom: "0.75rem" }}>📭</div>
          <p style={s.emptyTitle}>
            {filter === "All" ? "No orders yet" : `No ${STATUS_META[filter as OrderStatus]?.label ?? filter} orders`}
          </p>
          <p style={s.emptyDesc}>
            {filter === "All"
              ? "When buyers place orders on your listings, they will appear here."
              : `You have no orders with this status right now.`}
          </p>
        </div>
      )}

      {/* ── Orders Table ── */}
      {filtered.length > 0 && (
        <div style={s.tableWrap}>
          <div style={s.tableHead}>
            <span style={{ ...s.col, flex: 2.5 }}>Product / Buyer</span>
            <span style={{ ...s.col, flex: 1.2 }}>Order ID</span>
            <span style={{ ...s.col, flex: 0.8 }}>Amount</span>
            <span style={{ ...s.col, flex: 0.8 }}>Date</span>
            <span style={{ ...s.col, flex: 1.2 }}>Status</span>
            <span style={{ ...s.col, flex: 1, textAlign: "right" }}>Action</span>
          </div>

          {filtered.map((order, idx) => {
            const meta = STATUS_META[order.status];
            const buyerName = order.buyerId?.name || "Unknown Buyer";
            const avatarColor = AVATAR_COLORS[buyerName.charCodeAt(0) % AVATAR_COLORS.length];
            const isProc = processingId === order._id;
            const canProcess = order.status === "pending";

            return (
              <div
                key={order._id}
                style={{ ...s.row, ...(idx % 2 === 0 ? {} : { backgroundColor: "#0d0d0d" }) }}
              >
                {/* Product + Buyer */}
                <div style={{ ...s.col, flex: 2.5, gap: "0.75rem", display: "flex", alignItems: "center" }}>
                  <div style={s.categoryDot}>
                    {order.item?.category === "Books" ? "📚"
                      : order.item?.category === "Electronics" ? "⚡"
                      : order.item?.category === "Furniture" ? "🪑"
                      : order.item?.category === "Lab Equipment" ? "🔬"
                      : order.item?.category === "Hostel Supplies" ? "🏠"
                      : "📦"}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={s.productName}>{order.item?.title || "Deleted Item"}</p>
                    <div style={s.buyerRow}>
                      <div style={{ ...s.avatar, backgroundColor: avatarColor }}>
                        {buyerName.charAt(0).toUpperCase()}
                      </div>
                      <span style={s.buyerName}>{buyerName}</span>
                    </div>
                  </div>
                </div>

                {/* ID */}
                <span style={{ ...s.col, flex: 1.2 }}>
                  <span style={s.orderId}>{order._id}</span>
                </span>

                {/* Amount */}
                <span style={{ ...s.col, flex: 0.8, color: "#f59e0b", fontWeight: 700 }}>
                  ₹{order.totalAmount.toLocaleString("en-IN")}
                </span>

                {/* Date */}
                <span style={{ ...s.col, flex: 0.8, color: "#64748b", fontSize: "0.78rem" }}>
                  {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>

                {/* Status */}
                <span style={{ ...s.col, flex: 1.2 }}>
                  <span style={{ ...s.statusBadge, backgroundColor: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}>
                    {meta.icon} {meta.label}
                  </span>
                </span>

                {/* Action */}
                <div style={{ ...s.col, flex: 1, justifyContent: "flex-end", display: "flex" }}>
                  {canProcess ? (
                    <button
                      style={{ ...s.processBtn, ...(isProc ? s.processBtnLoading : {}) }}
                      onClick={() => handleProcess(order._id, order.status)}
                      disabled={isProc}
                    >
                      {isProc ? (
                        <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <span style={s.spinner} /> Completing…
                        </span>
                      ) : "✓ Complete"}
                    </button>
                  ) : (
                    <span style={{ fontSize: "0.75rem", color: order.status === "cancelled" ? "#ef4444" : "#10b981", fontWeight: 600 }}>
                      {order.status === "cancelled" ? "Cancelled" : "Completed ✓"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Styles ── */
const s: Record<string, React.CSSProperties> = {
  page:           { display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "1100px", margin: "0 auto" },
  title:          { fontSize: "1.5rem", fontWeight: 800, color: "#f8fafc", letterSpacing: "-0.02em" },
  subtitle:       { fontSize: "0.8rem", color: "#64748b", marginTop: "0.2rem" },
  summaryGrid:    { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" },
  summaryCard:    { backgroundColor: "#121212", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "1.1rem 1.25rem", display: "flex", alignItems: "center", gap: "0.9rem" },
  summaryIcon:    { width: "44px", height: "44px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 },
  summaryValue:   { fontSize: "1.6rem", fontWeight: 800, color: "#f8fafc", lineHeight: 1, margin: "0 0 0.2rem" },
  summaryLabel:   { fontSize: "0.72rem", color: "#64748b", fontWeight: 500, margin: 0 },
  tabRow:         { display: "flex", gap: "0.5rem", flexWrap: "wrap" },
  tab:            { display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.45rem 1rem", borderRadius: "20px", border: "1px solid transparent", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, fontFamily: "inherit", transition: "all 0.2s", background: "none" },
  tabActive:      { backgroundColor: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b" },
  tabInactive:    { backgroundColor: "#121212", border: "1px solid #1f1f1f", color: "#64748b" },
  tabBadge:       { display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: "20px", height: "18px", padding: "0 5px", borderRadius: "9px", fontSize: "0.65rem", fontWeight: 700 },
  empty:          { textAlign: "center", padding: "4rem 2rem", backgroundColor: "#121212", border: "1px dashed #2a2a2a", borderRadius: "16px", display: "flex", flexDirection: "column", alignItems: "center" },
  emptyTitle:     { fontSize: "1rem", fontWeight: 700, color: "#f8fafc", margin: "0 0 0.35rem" },
  emptyDesc:      { fontSize: "0.85rem", color: "#64748b", maxWidth: "320px", margin: "0 auto" },
  tableWrap:      { backgroundColor: "#121212", border: "1px solid #1f1f1f", borderRadius: "14px", overflow: "hidden", overflowX: "auto" },
  tableHead:      { display: "flex", alignItems: "center", padding: "0.75rem 1.25rem", backgroundColor: "#0a0a0a", borderBottom: "1px solid #1f1f1f", gap: "1rem", minWidth: "700px" },
  row:            { display: "flex", alignItems: "center", padding: "1rem 1.25rem", borderBottom: "1px solid #1a1a1a", gap: "1rem", minWidth: "700px", transition: "background-color 0.15s" },
  col:            { display: "flex", alignItems: "center", fontSize: "0.78rem", color: "#94a3b8", fontWeight: 600, letterSpacing: "0.03em", textTransform: "uppercase", overflow: "hidden" },
  categoryDot:    { width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 },
  productName:    { fontSize: "0.85rem", fontWeight: 700, color: "#f8fafc", margin: "0 0 0.25rem", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", maxWidth: "280px" },
  buyerRow:       { display: "flex", alignItems: "center", gap: "0.4rem" },
  avatar:         { width: "20px", height: "20px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 800, color: "#000", flexShrink: 0 },
  buyerName:      { fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600, textTransform: "none", letterSpacing: 0 },
  orderId:        { fontFamily: "monospace", fontSize: "0.72rem", color: "#64748b", backgroundColor: "#1a1a1a", padding: "2px 7px", borderRadius: "5px", fontWeight: 600, textTransform: "none", letterSpacing: 0 },
  statusBadge:    { fontSize: "0.72rem", fontWeight: 700, borderRadius: "20px", padding: "3px 10px", whiteSpace: "nowrap", textTransform: "none", letterSpacing: 0 },
  processBtn:     { padding: "0.45rem 1rem", backgroundColor: "#f59e0b", color: "#000", border: "none", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "0.35rem", textTransform: "none", letterSpacing: 0 },
  processBtnLoading: { backgroundColor: "#374151", color: "#94a3b8", cursor: "not-allowed" },
  spinner:        { display: "inline-block", width: "12px", height: "12px", border: "2px solid #94a3b8", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" },
};
