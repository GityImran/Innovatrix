"use client";

import React, { useEffect, useState, useCallback } from "react";

type OrderStatus = "pending" | "out_for_delivery" | "paid" | "completed" | "cancelled";

export interface Order {
  _id: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  itemModel: "Product" | "RentItem";
  orderType: "purchase" | "rent";
  paymentLinkId?: string | null;
  razorpayPaymentId?: string | null;
  buyerId: { name: string; email: string };
  item?: { title: string; category: string };
}

const STATUS_META: Record<OrderStatus, { color: string; bg: string; border: string; icon: string; label: string }> = {
  pending:          { label: "Pending",          color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)",  icon: "⏳" },
  out_for_delivery: { label: "Out for Delivery", color: "#818cf8", bg: "rgba(129,140,248,0.1)", border: "rgba(129,140,248,0.25)", icon: "🚚" },
  paid:             { label: "Paid",             color: "#34d399", bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.25)",  icon: "💳" },
  completed:        { label: "Completed",        color: "#10b981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)",  icon: "✅" },
  cancelled:        { label: "Cancelled",        color: "#ef4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)",   icon: "❌" },
};

const AVATAR_COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#14b8a6"];
type FilterTab = "All" | OrderStatus;

type PaymentLinkModal = { orderId: string; shortUrl: string; amount: number } | null;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<FilterTab>("All");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<PaymentLinkModal>(null);
  const [pollingId, setPollingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/seller/orders");
      if (res.ok) setOrders(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  /* ── Poll order status while payment modal is open ── */
  useEffect(() => {
    if (!pollingId) return;
    const interval = setInterval(async () => {
      const res = await fetch(`/api/order-status/${pollingId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.status === "paid") {
        setModal(null);
        setPollingId(null);
        showToast("✅ Payment confirmed! You can now complete the order.");
        fetchOrders();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [pollingId, fetchOrders]);

  /* ── Start Delivery ── */
  const handleStartDelivery = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/orders/${id}/start-delivery`, { method: "PATCH" });
      if (res.ok) { showToast("🚚 Delivery started!"); fetchOrders(); }
      else { const d = await res.json(); showToast("❌ " + (d.error || "Failed")); }
    } finally { setProcessingId(null); }
  };

  /* ── Generate Payment Link (idempotent — safe to call multiple times) ── */
  const handleGenerateLink = async (id: string) => {
    console.log("🛒 Initiating Payment for order:", id);
    setProcessingId(id);
    try {
      const res = await fetch(`/api/orders/${id}/generate-payment-link`, { method: "POST" });
      const data = await res.json();
      console.log("📥 Payment API Response:", data);

      if (res.ok && data.short_url) {
        console.log("💳 QR Link generated:", data.short_url);
        setModal({ orderId: id, shortUrl: data.short_url, amount: data.amount });
        setPollingId(id);
        fetchOrders();
      } else if (res.ok && data.paymentLinkId) {
        // Already generated — short_url not re-returned, show copy prompt
        console.log("ℹ️ Payment link already exists:", data.paymentLinkId);
        showToast("⚠️ Payment link already exists. Ask buyer to check their previous QR.");
      } else {
        console.error("❌ Failed to generate link:", data.error);
        showToast("❌ " + (data.error || "Failed to generate link"));
      }
    } catch (err) {
      console.error("❌ Network or Parsing error:", err);
    } finally {
      setProcessingId(null);
    }
  };

  /* ── Complete Order ── */
  const handleComplete = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/orders/${id}/complete`, { method: "PATCH" });
      if (res.ok) { showToast("🎉 Order completed!"); fetchOrders(); }
      else { const d = await res.json(); showToast("❌ " + (d.error || "Cannot complete")); }
    } finally { setProcessingId(null); }
  };

  const countFor = (tab: FilterTab) =>
    tab === "All" ? orders.length : orders.filter((o) => o.status === tab).length;
  const filtered = filter === "All" ? orders : orders.filter((o) => o.status === filter);

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    out_for_delivery: orders.filter((o) => o.status === "out_for_delivery").length,
    paid: orders.filter((o) => o.status === "paid").length,
    completed: orders.filter((o) => o.status === "completed").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
      <p style={{ color: "#64748b" }}>Loading orders…</p>
    </div>
  );

  return (
    <div style={s.page}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        .order-row:hover { background: rgba(255,255,255,0.03) !important; }
        .action-btn:hover:not(:disabled) { filter: brightness(1.15); transform: translateY(-1px); }
      `}</style>

      {/* ── Toast ── */}
      {toast && (
        <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 9999, background: "#1a1a1a", border: "1px solid #333", borderRadius: "12px", padding: "12px 20px", color: "#f1f5f9", fontSize: "0.85rem", fontWeight: 600, animation: "fadeIn 0.3s ease", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
          {toast}
        </div>
      )}

      {/* ── Payment Link Modal ── */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: "20px", padding: "32px", maxWidth: "420px", width: "100%", animation: "fadeIn 0.25s ease", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>📱</div>
            <h2 style={{ margin: "0 0 6px", color: "#f1f5f9", fontWeight: 800, fontSize: "1.2rem" }}>Show QR to Buyer</h2>
            <p style={{ margin: "0 0 20px", color: "#64748b", fontSize: "0.85rem" }}>
              Buyer scans this link to pay ₹{modal.amount?.toLocaleString("en-IN")} via UPI
            </p>

            {/* QR placeholder using Google Charts */}
            <div style={{ background: "#fff", borderRadius: "12px", padding: "12px", display: "inline-block", marginBottom: "16px" }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(modal.shortUrl)}`}
                alt="Payment QR"
                width={180}
                height={180}
                style={{ display: "block" }}
              />
            </div>

            <div style={{ background: "#1a1a1a", borderRadius: "10px", padding: "10px 14px", marginBottom: "20px", wordBreak: "break-all", fontSize: "0.75rem", color: "#818cf8", fontFamily: "monospace" }}>
              {modal.shortUrl}
            </div>

            {/* Polling indicator */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "20px" }}>
              <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: "#34d399", animation: "pulse 1.5s ease infinite" }} />
              <span style={{ fontSize: "0.78rem", color: "#64748b" }}>Waiting for payment confirmation…</span>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => { navigator.clipboard.writeText(modal.shortUrl); showToast("🔗 Link copied!"); }}
                style={{ flex: 1, padding: "11px", borderRadius: "10px", background: "rgba(129,140,248,0.1)", border: "1px solid rgba(129,140,248,0.25)", color: "#818cf8", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}
              >
                Copy Link
              </button>
              <button
                onClick={() => { setModal(null); setPollingId(null); }}
                style={{ flex: 1, padding: "11px", borderRadius: "10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#64748b", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div>
        <h1 style={s.title}>Orders</h1>
        <p style={s.subtitle}>Manage buyer orders — deliver, collect payment, complete</p>
      </div>

      {/* ── Summary Cards ── */}
      <div style={s.summaryGrid}>
        {[
          { label: "Total",       value: stats.total,            icon: "📋", color: "#3b82f6" },
          { label: "Pending",     value: stats.pending,          icon: "⏳", color: "#f59e0b" },
          { label: "Delivering",  value: stats.out_for_delivery, icon: "🚚", color: "#818cf8" },
          { label: "Paid",        value: stats.paid,             icon: "💳", color: "#34d399" },
          { label: "Completed",   value: stats.completed,        icon: "✅", color: "#10b981" },
          { label: "Cancelled",   value: stats.cancelled,        icon: "❌", color: "#ef4444" },
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
        {(["All", "pending", "out_for_delivery", "paid", "completed", "cancelled"] as const).map((tab) => (
          <button
            key={tab}
            style={{ ...s.tab, ...(filter === tab ? s.tabActive : s.tabInactive) }}
            onClick={() => setFilter(tab)}
          >
            {tab !== "All" && STATUS_META[tab].icon + " "}
            {tab === "All" ? "All" : STATUS_META[tab].label}
            <span style={{ ...s.tabBadge, ...(filter === tab ? { backgroundColor: "#f59e0b", color: "#000" } : { backgroundColor: "#1f1f1f", color: "#64748b" }) }}>
              {countFor(tab)}
            </span>
          </button>
        ))}
      </div>

      {/* ── Empty ── */}
      {filtered.length === 0 && (
        <div style={s.empty}>
          <div style={{ fontSize: "3.5rem", marginBottom: "0.75rem" }}>📭</div>
          <p style={s.emptyTitle}>{filter === "All" ? "No orders yet" : `No ${STATUS_META[filter as OrderStatus]?.label ?? filter} orders`}</p>
          <p style={s.emptyDesc}>When buyers place orders on your listings, they will appear here.</p>
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
            <span style={{ ...s.col, flex: 1.8, textAlign: "right" }}>Actions</span>
          </div>

          {filtered.map((order, idx) => {
            const meta = STATUS_META[order.status];
            const buyerName = order.buyerId?.name || "Unknown";
            const avatarColor = AVATAR_COLORS[buyerName.charCodeAt(0) % AVATAR_COLORS.length];
            const isProc = processingId === order._id;

            return (
              <div key={order._id} className="order-row" style={{ ...s.row, ...(idx % 2 === 0 ? {} : { backgroundColor: "#0d0d0d" }) }}>
                {/* Product + Buyer */}
                <div style={{ ...s.col, flex: 2.5, display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={s.categoryDot}>
                    {order.item?.category === "Books" ? "📚" : order.item?.category === "Electronics" ? "⚡" : order.item?.category === "Furniture" ? "🪑" : "📦"}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={s.productName}>{order.item?.title || "Deleted Item"}</p>
                    <div style={s.buyerRow}>
                      <div style={{ ...s.avatar, backgroundColor: avatarColor }}>{buyerName.charAt(0).toUpperCase()}</div>
                      <span style={s.buyerName}>{buyerName}</span>
                    </div>
                  </div>
                </div>

                {/* ID */}
                <span style={{ ...s.col, flex: 1.2 }}>
                  <span style={s.orderId}>{order._id.slice(-8)}</span>
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

                {/* Actions */}
                <div style={{ ...s.col, flex: 1.8, justifyContent: "flex-end", display: "flex", gap: "8px" }}>
                  {/* Step 1: pending → start delivery */}
                  {order.status === "pending" && (
                    <button
                      className="action-btn"
                      disabled={isProc}
                      onClick={() => handleStartDelivery(order._id)}
                      style={{ ...s.btn, background: "rgba(129,140,248,0.15)", color: "#818cf8", border: "1px solid rgba(129,140,248,0.3)" }}
                    >
                      {isProc ? <><span style={s.spinner} /> Starting…</> : "🚚 Start Delivery"}
                    </button>
                  )}

                  {/* Step 2: out_for_delivery → generate QR */}
                  {order.status === "out_for_delivery" && (
                    <button
                      className="action-btn"
                      disabled={isProc}
                      onClick={() => handleGenerateLink(order._id)}
                      style={{ ...s.btn, background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)" }}
                    >
                      {isProc ? <><span style={s.spinner} /> Generating…</> : order.paymentLinkId ? "📱 Show QR Again" : "📱 Generate QR"}
                    </button>
                  )}

                  {/* Step 3: paid → complete */}
                  {order.status === "paid" && (
                    <button
                      className="action-btn"
                      disabled={isProc}
                      onClick={() => handleComplete(order._id)}
                      style={{ ...s.btn, background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)" }}
                    >
                      {isProc ? <><span style={s.spinner} /> Completing…</> : "✅ Complete Order"}
                    </button>
                  )}

                  {(order.status === "completed" || order.status === "cancelled") && (
                    <span style={{ fontSize: "0.75rem", color: order.status === "cancelled" ? "#ef4444" : "#10b981", fontWeight: 600 }}>
                      {order.status === "cancelled" ? "Cancelled" : "Done ✓"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Flow Guide ── */}
      <div style={{ background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.12)", borderRadius: "14px", padding: "16px 20px" }}>
        <p style={{ margin: "0 0 10px", fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em" }}>Payment Flow</p>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", fontSize: "0.8rem", color: "#475569" }}>
          {["⏳ Pending", "→", "🚚 Start Delivery", "→", "📱 Generate QR (buyer pays UPI)", "→", "💳 Paid (auto via webhook)", "→", "✅ Complete"].map((step, i) => (
            <span key={i} style={{ color: step === "→" ? "#1e293b" : "#94a3b8", fontWeight: step === "→" ? 400 : 600 }}>{step}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page:         { display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "1200px", margin: "0 auto" },
  title:        { fontSize: "1.5rem", fontWeight: 800, color: "#f8fafc", letterSpacing: "-0.02em" },
  subtitle:     { fontSize: "0.8rem", color: "#64748b", marginTop: "0.2rem" },
  summaryGrid:  { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem" },
  summaryCard:  { backgroundColor: "#121212", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "1rem 1.1rem", display: "flex", alignItems: "center", gap: "0.75rem" },
  summaryIcon:  { width: "38px", height: "38px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 },
  summaryValue: { fontSize: "1.4rem", fontWeight: 800, color: "#f8fafc", lineHeight: 1, margin: "0 0 0.15rem" },
  summaryLabel: { fontSize: "0.68rem", color: "#64748b", fontWeight: 500, margin: 0 },
  tabRow:       { display: "flex", gap: "0.4rem", flexWrap: "wrap" },
  tab:          { display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.4rem 0.9rem", borderRadius: "20px", border: "1px solid transparent", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600, fontFamily: "inherit", transition: "all 0.2s", background: "none" },
  tabActive:    { backgroundColor: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b" },
  tabInactive:  { backgroundColor: "#121212", border: "1px solid #1f1f1f", color: "#64748b" },
  tabBadge:     { display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: "18px", height: "16px", padding: "0 5px", borderRadius: "9px", fontSize: "0.6rem", fontWeight: 700 },
  empty:        { textAlign: "center", padding: "4rem 2rem", backgroundColor: "#121212", border: "1px dashed #2a2a2a", borderRadius: "16px", display: "flex", flexDirection: "column", alignItems: "center" },
  emptyTitle:   { fontSize: "1rem", fontWeight: 700, color: "#f8fafc", margin: "0 0 0.35rem" },
  emptyDesc:    { fontSize: "0.85rem", color: "#64748b", maxWidth: "320px", margin: "0 auto" },
  tableWrap:    { backgroundColor: "#121212", border: "1px solid #1f1f1f", borderRadius: "14px", overflow: "hidden", overflowX: "auto" },
  tableHead:    { display: "flex", alignItems: "center", padding: "0.75rem 1.25rem", backgroundColor: "#0a0a0a", borderBottom: "1px solid #1f1f1f", gap: "1rem", minWidth: "800px" },
  row:          { display: "flex", alignItems: "center", padding: "1rem 1.25rem", borderBottom: "1px solid #1a1a1a", gap: "1rem", minWidth: "800px", transition: "background 0.15s" },
  col:          { display: "flex", alignItems: "center", fontSize: "0.78rem", color: "#94a3b8", fontWeight: 600, letterSpacing: "0.03em", textTransform: "uppercase", overflow: "hidden" },
  categoryDot:  { width: "34px", height: "34px", borderRadius: "8px", backgroundColor: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 },
  productName:  { fontSize: "0.85rem", fontWeight: 700, color: "#f8fafc", margin: "0 0 0.2rem", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", maxWidth: "220px" },
  buyerRow:     { display: "flex", alignItems: "center", gap: "0.4rem" },
  avatar:       { width: "18px", height: "18px", borderRadius: "5px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: 800, color: "#000", flexShrink: 0 },
  buyerName:    { fontSize: "0.72rem", color: "#94a3b8", fontWeight: 600, textTransform: "none", letterSpacing: 0 },
  orderId:      { fontFamily: "monospace", fontSize: "0.72rem", color: "#64748b", backgroundColor: "#1a1a1a", padding: "2px 7px", borderRadius: "5px", fontWeight: 600, textTransform: "none", letterSpacing: 0 },
  statusBadge:  { fontSize: "0.7rem", fontWeight: 700, borderRadius: "20px", padding: "3px 9px", whiteSpace: "nowrap", textTransform: "none", letterSpacing: 0 },
  btn:          { padding: "0.4rem 0.85rem", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "0.3rem", textTransform: "none", letterSpacing: 0 },
  spinner:      { display: "inline-block", width: "10px", height: "10px", border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite", flexShrink: 0 },
};
