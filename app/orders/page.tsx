"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type OrderStatus = "pending" | "out_for_delivery" | "paid" | "completed" | "cancelled";

export interface Order {
  _id: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  itemModel: "Product" | "RentItem" | "Auction";
  itemId: string;
  orderType: "purchase" | "rent";
  sellerId: { name: string; email: string };
  item?: { title: string; category: string; image?: { url: string } };
}

const STATUS_META: Record<OrderStatus, { color: string; bg: string; border: string; icon: string; label: string }> = {
  pending:          { label: "Pending",          color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)",  icon: "⏳" },
  out_for_delivery: { label: "Out for Delivery", color: "#818cf8", bg: "rgba(129,140,248,0.1)", border: "rgba(129,140,248,0.25)", icon: "🚚" },
  paid:             { label: "Paid",             color: "#34d399", bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.25)",  icon: "💳" },
  completed:        { label: "Completed",        color: "#10b981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)",  icon: "✅" },
  cancelled:        { label: "Cancelled",        color: "#ef4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)",   icon: "❌" },
};

type FilterTab = "All" | OrderStatus;

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<FilterTab>("All");
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      if (res.ok) setOrders(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const countFor = (tab: FilterTab) =>
    tab === "All" ? orders.length : orders.filter((o) => o.status === tab).length;
  const filtered = filter === "All" ? orders : orders.filter((o) => o.status === filter);

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "80px", minHeight: "60vh" }}>
      <div style={{ width: "40px", height: "40px", border: "3px solid rgba(245,158,11,0.1)", borderTopColor: "#f59e0b", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
    </div>
  );

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .order-card:hover { 
          transform: translateY(-4px); 
          border-color: rgba(245,158,11,0.2) !important;
          background: rgba(255,255,255,0.025) !important;
          box-shadow: 0 12px 40px rgba(0,0,0,0.3);
        }
        .action-btn:hover {
          filter: brightness(1.2);
          transform: scale(1.02);
        }
        .tab-btn:hover {
          background: rgba(255,255,255,0.05) !important;
        }
      `}</style>
      {/* Header Section */}
      <div style={{ marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "20px" }}>
        <div>
          <h1 style={{ fontSize: "36px", fontWeight: 900, color: "#f8fafc", letterSpacing: "-0.04em", margin: "0 0 8px 0" }}>
            Orders <span style={{ color: "#f59e0b" }}>&</span> Returns
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "16px", fontWeight: 500 }}>Track, manage, and review your campus purchases</p>
        </div>
        
        <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "10px", padding: "12px 20px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", color: "#cbd5e1", fontSize: "14px", fontWeight: 700, transition: "all 0.2s" }}>
          <span>←</span> Back to Market
        </Link>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "10px", marginBottom: "32px", scrollbarWidth: "none" }}>
        {(["All", "pending", "out_for_delivery", "paid", "completed", "cancelled"] as const).map((tab) => {
          const isActive = filter === tab;
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className="tab-btn"
              style={{
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                borderRadius: "100px",
                border: isActive ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(255,255,255,0.05)",
                background: isActive ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.02)",
                color: isActive ? "#f59e0b" : "#94a3b8",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {tab !== "All" && <span>{STATUS_META[tab].icon}</span>}
              {tab === "All" ? "All History" : STATUS_META[tab].label}
              <span style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                justifyContent: "center", 
                minWidth: "22px", 
                height: "18px", 
                padding: "0 6px", 
                borderRadius: "10px", 
                fontSize: "11px", 
                fontWeight: 800,
                background: isActive ? "#f59e0b" : "rgba(255,255,255,0.05)",
                color: isActive ? "#000" : "#64748b",
                marginLeft: "4px"
              }}>
                {countFor(tab)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div style={{ 
          background: "linear-gradient(145deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)", 
          border: "1px dashed rgba(255,255,255,0.08)", 
          borderRadius: "24px", 
          padding: "80px 20px", 
          textAlign: "center" 
        }}>
          <div style={{ fontSize: "64px", marginBottom: "24px", filter: "grayscale(0.5)" }}>📦</div>
          <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#f1f5f9", margin: "0 0 8px 0" }}>
            {filter === "All" ? "No orders yet" : `No ${STATUS_META[filter as OrderStatus]?.label?.toLowerCase()} orders`}
          </h3>
          <p style={{ color: "#64748b", maxWidth: "340px", margin: "0 auto 32px", fontSize: "15px", lineHeight: "1.6" }}>
            Your transaction history will appear here once you make a purchase.
          </p>
          <Link href="/" style={{ 
            display: "inline-block",
            padding: "14px 32px", 
            background: "#f59e0b", 
            color: "#000", 
            fontWeight: 800, 
            borderRadius: "14px", 
            textDecoration: "none",
            boxShadow: "0 8px 20px rgba(245,158,11,0.2)"
          }}>
            Browse Listings
          </Link>
        </div>
      )}

      {/* Orders List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {filtered.map((order) => {
          const meta = STATUS_META[order.status];
          const sellerName = order.sellerId?.name || "Unknown Seller";
          const imageUrl = order.item?.image?.url;

          return (
            <div key={order._id} className="order-card" style={{ 
              background: "rgba(255,255,255,0.015)", 
              border: "1px solid rgba(255,255,255,0.05)", 
              borderRadius: "22px", 
              overflow: "hidden",
              transition: "transform 0.2s, border-color 0.2s, box-shadow 0.2s",
              position: "relative"
            }}>
              
              {/* Card Header */}
              <div style={{ 
                background: "rgba(255,255,255,0.03)", 
                padding: "16px 24px", 
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px"
              }}>
                <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
                  <div>
                    <p style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>Order Placed</p>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "#e2e8f0" }}>{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>Amount Paid</p>
                    <p style={{ fontSize: "14px", fontWeight: 800, color: "#f59e0b" }}>₹{order.totalAmount.toLocaleString("en-IN")}</p>
                  </div>
                  <div style={{ display: "none", WebkitAppRegion: "none" } as any /* Hidden on mobile basically */}>
                    <p style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>Campus Seller</p>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "#818cf8" }}>{sellerName}</p>
                  </div>
                </div>
                
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>ID: #{order._id.slice(-8).toUpperCase()}</p>
                  <div style={{ 
                    display: "inline-flex", 
                    alignItems: "center", 
                    gap: "6px", 
                    padding: "6px 14px", 
                    borderRadius: "100px", 
                    fontSize: "12px", 
                    fontWeight: 800, 
                    background: meta.bg, 
                    color: meta.color, 
                    border: `1px solid ${meta.border}` 
                  }}>
                    <span>{meta.icon}</span> {meta.label}
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: "24px", display: "flex", gap: "24px", flexWrap: "wrap" }}>
                {/* Image Container */}
                <div style={{ 
                  width: "120px", 
                  height: "120px", 
                  background: "rgba(0,0,0,0.2)", 
                  borderRadius: "16px", 
                  overflow: "hidden", 
                  border: "1px solid rgba(255,255,255,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  {imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt="Product" 
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ fontSize: "40px" }}>
                      {order.item?.category === "Books" ? "📚" : order.item?.category === "Electronics" ? "⚡" : order.item?.category === "Furniture" ? "🪑" : "📦"}
                    </div>
                  )}
                </div>

                {/* Info Section */}
                <div style={{ flex: 1, minWidth: "260px" }}>
                  <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#f8fafc", margin: "0 0 6px 0" }}>{order.item?.title || "Product Listing"}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#94a3b8", background: "rgba(255,255,255,0.04)", padding: "3px 10px", borderRadius: "6px" }}>
                      {order.item?.category}
                    </span>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#64748b" }}>•</span>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#64748b" }}>Seller: {sellerName}</span>
                  </div>

                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <Link href={`/product/${order.itemId}`} className="action-btn" style={{ 
                      textDecoration: "none",
                      padding: "10px 20px", 
                      borderRadius: "12px", 
                      background: "rgba(245,158,11,0.1)", 
                      color: "#f59e0b", 
                      fontSize: "13px", 
                      fontWeight: 700, 
                      border: "1px solid rgba(245,158,11,0.2)",
                      transition: "all 0.2s"
                    }}>
                      View Product
                    </Link>
                    
                    {order.status === "completed" && (
                      <button className="action-btn" style={{ 
                        padding: "10px 20px", 
                        borderRadius: "12px", 
                        background: "rgba(255,255,255,0.03)", 
                        color: "#f1f5f9", 
                        fontSize: "13px", 
                        fontWeight: 700, 
                        border: "1px solid rgba(255,255,255,0.08)",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}>
                        Initiate Return
                      </button>
                    )}

                    {order.status === "pending" && (
                      <button className="action-btn" style={{ 
                        padding: "10px 20px", 
                        borderRadius: "12px", 
                        background: "rgba(239,68,68,0.08)", 
                        color: "#ef4444", 
                        fontSize: "13px", 
                        fontWeight: 700, 
                        border: "1px solid rgba(239,68,68,0.2)",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}>
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>

                {/* Right side - Re-order or Status specifics */}
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "8px", borderLeft: "1px solid rgba(255,255,255,0.05)", paddingLeft: "24px" }}>
                  <button style={{ 
                    width: "44px", 
                    height: "44px", 
                    borderRadius: "12px", 
                    background: "rgba(255,255,255,0.03)", 
                    border: "1px solid rgba(255,255,255,0.08)", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    fontSize: "18px",
                    cursor: "pointer",
                    color: "#94a3b8"
                  }} title="Message Seller">
                    💬
                  </button>
                  <button style={{ 
                    width: "44px", 
                    height: "44px", 
                    borderRadius: "12px", 
                    background: "rgba(255,255,255,0.03)", 
                    border: "1px solid rgba(255,255,255,0.08)", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    fontSize: "18px",
                    cursor: "pointer",
                    color: "#94a3b8"
                  }} title="Download Invoice">
                    📄
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>
      
      {/* Footer Info */}
      <div style={{ marginTop: "60px", textAlign: "center", color: "#64748b", fontSize: "14px" }}>
        <p>Need help with an order? <Link href="/contact" style={{ color: "#f59e0b", textDecoration: "none", fontWeight: 600 }}>Contact Support</Link></p>
      </div>
    </div>
  );
}
