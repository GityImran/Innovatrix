"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface Product {
  _id: string;
  category: string;
  title: string;
  description: string;
  condition: "new" | "good" | "used";
  originalPrice?: number;
  expectedPrice: number;
  images: string[];
  isUrgent: boolean;
  isBundle: boolean;
  bundleTitle?: string;
  status: "active" | "draft" | "sold";
  createdAt: string;
}

interface RentItem {
  _id: string;
  category: string;
  title: string;
  description: string;
  condition: "new" | "good" | "used";
  pricing: {
    day: number;
    week?: number;
    month?: number;
  };
  availability: {
    from: string;
    till: string;
  };
  securityDeposit?: number;
  images: string[];
  isUrgent: boolean;
  allowNegotiation: boolean;
  status: "active" | "rented" | "unavailable";
  createdAt: string;
}

/* ─── Metadata maps ─────────────────────────────────────────────────────── */

const CONDITION_META: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: "New", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  good: { label: "Good", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  used: { label: "Used", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
};

const PRODUCT_STATUS_META: Record<Product["status"], { label: string; color: string; bg: string }> = {
  active: { label: "Active", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  draft: { label: "Draft", color: "#94a3b8", bg: "rgba(100,116,139,0.12)" },
  sold: { label: "Sold", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
};

const RENT_STATUS_META: Record<RentItem["status"], { label: string; color: string; bg: string }> = {
  active: { label: "Available", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  rented: { label: "Rented", color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
  unavailable: { label: "Unavailable", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
};

type ViewMode = "sale" | "rent";
type SaleFilter = "all" | Product["status"];
type RentFilter = "all" | RentItem["status"];

/* ─── Page ─────────────────────────────────────────────────────────────────*/

export default function ListedProductsPage() {
  const [view, setView] = useState<ViewMode>("sale");

  const [products, setProducts] = useState<Product[]>([]);
  const [rentItems, setRentItems] = useState<RentItem[]>([]);
  const [saleFilter, setSaleFilter] = useState<SaleFilter>("all");
  const [rentFilter, setRentFilter] = useState<RentFilter>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshAll();
  }, []);

  const refreshAll = async () => {
    setLoading(true);
    try {
      const [pRes, rRes] = await Promise.all([
        fetch("/api/seller/products"),
        fetch("/api/seller/rent-items"),
      ]);
      if (pRes.ok) setProducts(await pRes.json());
      if (rRes.ok) setRentItems(await rRes.json());
    } catch (err) {
      console.error("Failed to refresh:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/seller/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete product");
      refreshAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteRent = async (id: string, title: string) => {
    if (!confirm(`Remove "${title}" from rent listings? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/seller/rent-items/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete item");
      refreshAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredProducts =
    saleFilter === "all" ? products : products.filter((p) => p.status === saleFilter);
  const filteredRentItems =
    rentFilter === "all" ? rentItems : rentItems.filter((r) => r.status === rentFilter);

  const saleCount = (tab: SaleFilter) =>
    tab === "all" ? products.length : products.filter((p) => p.status === tab).length;
  const rentCount = (tab: RentFilter) =>
    tab === "all" ? rentItems.length : rentItems.filter((r) => r.status === tab).length;

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
        <p style={{ color: "#64748b" }}>Loading listings...</p>
      </div>
    );
  }

  return (
    <div style={s.page}>

      {/* ── Top Row ── */}
      <div style={s.topRow}>
        <div>
          <h1 style={s.pageTitle}>My Listings</h1>
          <p style={s.pageSub}>
            {products.length} for sale · {rentItems.length} for rent
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.6rem" }}>
          <Link href="/seller/rent" style={{ ...s.actionBtn, ...s.rentBtn }}>
            🔄 List for Rent
          </Link>
          <Link href="/seller/add-product" style={{ ...s.actionBtn, ...s.saleBtn }}>
            + Add Product
          </Link>
        </div>
      </div>

      {/* ── View Switcher ── */}
      <div style={s.viewSwitcher}>
        <button
          id="lp-view-sale"
          style={{
            ...s.viewBtn,
            ...(view === "sale" ? s.viewBtnActive : s.viewBtnInactive),
          }}
          onClick={() => setView("sale")}
        >
          🏷️ For Sale
          <span style={{ ...s.viewBadge, ...(view === "sale" ? s.viewBadgeActive : {}) }}>
            {products.length}
          </span>
        </button>
        <button
          id="lp-view-rent"
          style={{
            ...s.viewBtn,
            ...(view === "rent" ? s.viewBtnActive : s.viewBtnInactive),
          }}
          onClick={() => setView("rent")}
        >
          🔄 For Rent
          <span style={{ ...s.viewBadge, ...(view === "rent" ? s.viewBadgeActive : {}) }}>
            {rentItems.length}
          </span>
        </button>
      </div>

      {/* ══════════════ FOR SALE VIEW ══════════════ */}
      {view === "sale" && (
        <>
          {/* Status filter tabs */}
          <div style={s.tabRow}>
            {(["all", "active", "draft", "sold"] as const).map((tab) => (
              <button
                key={tab}
                style={{ ...s.tab, ...(saleFilter === tab ? s.tabActive : s.tabInactive) }}
                onClick={() => setSaleFilter(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span
                  style={{
                    ...s.tabBadge,
                    ...(saleFilter === tab
                      ? { backgroundColor: "#f59e0b", color: "#000" }
                      : { backgroundColor: "#1f1f1f", color: "#64748b" }),
                  }}
                >
                  {saleCount(tab)}
                </span>
              </button>
            ))}
          </div>

          {filteredProducts.length === 0 ? (
            <EmptyState
              icon="📭"
              title={saleFilter === "all" ? "No products yet" : `No ${saleFilter} products`}
              desc={
                saleFilter === "all"
                  ? "Add your first item and start selling on campus."
                  : "Switch to another tab to see your other listings."
              }
              action={
                saleFilter === "all"
                  ? { label: "+ List Your First Item", href: "/seller/add-product" }
                  : undefined
              }
            />
          ) : (
            <div style={s.grid}>
              {filteredProducts.map((product) => {
                const cond = CONDITION_META[product.condition] ?? {
                  label: product.condition,
                  color: "#94a3b8",
                  bg: "rgba(148,163,184,0.1)",
                };
                const status = PRODUCT_STATUS_META[product.status];
                return (
                  <div key={product._id} style={s.card}>
                    <div style={s.imgWrap}>
                      {product.images.length > 0 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.images[0]} alt={product.title} style={s.img} />
                      ) : (
                        <div style={s.imgPlaceholder}>
                          <span style={{ fontSize: "3rem" }}>📦</span>
                          <span style={s.imgPlaceholderText}>No image</span>
                        </div>
                      )}
                      <div style={s.overlayTop}>
                        {product.isUrgent && <span style={s.urgentBadge}>🔥 Urgent</span>}
                        {product.isBundle && <span style={s.bundleBadge}>📦 Bundle</span>}
                      </div>
                      <div style={s.overlayBottom}>
                        <span style={{ ...s.statusBadge, backgroundColor: status.bg, color: status.color }}>
                          {status.label}
                        </span>
                      </div>
                    </div>

                    <div style={s.body}>
                      <div style={s.metaRow}>
                        <span style={s.categoryChip}>{product.category}</span>
                        <span style={{ ...s.conditionChip, backgroundColor: cond.bg, color: cond.color }}>
                          {cond.label}
                        </span>
                      </div>
                      <p style={s.cardTitle}>{product.title}</p>
                      {product.isBundle && product.bundleTitle && (
                        <p style={s.bundleSubtitle}>📦 {product.bundleTitle}</p>
                      )}
                      <div style={s.priceRow}>
                        <span style={s.price}>₹{product.expectedPrice.toLocaleString("en-IN")}</span>
                        {product.originalPrice && (
                          <>
                            <span style={s.origPrice}>₹{product.originalPrice.toLocaleString("en-IN")}</span>
                            {product.originalPrice > product.expectedPrice && (
                              <span style={s.savingBadge}>
                                {Math.round((1 - product.expectedPrice / product.originalPrice) * 100)}% off
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      <p style={s.date}>
                        Listed {new Date(product.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </p>
                    </div>

                    <div style={s.cardActions}>
                      <Link href={`/seller/products/${product._id}/edit`} style={s.editBtn}>✏️ Edit</Link>
                      <button style={s.deleteBtn} onClick={() => handleDeleteProduct(product._id, product.title)}>
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ══════════════ FOR RENT VIEW ══════════════ */}
      {view === "rent" && (
        <>
          {/* Status filter tabs */}
          <div style={s.tabRow}>
            {(["all", "active", "rented", "unavailable"] as const).map((tab) => (
              <button
                key={tab}
                style={{ ...s.tab, ...(rentFilter === tab ? s.tabActive : s.tabInactive) }}
                onClick={() => setRentFilter(tab)}
              >
                {tab === "all" ? "All" : RENT_STATUS_META[tab].label}
                <span
                  style={{
                    ...s.tabBadge,
                    ...(rentFilter === tab
                      ? { backgroundColor: "#f59e0b", color: "#000" }
                      : { backgroundColor: "#1f1f1f", color: "#64748b" }),
                  }}
                >
                  {rentCount(tab)}
                </span>
              </button>
            ))}
          </div>

          {filteredRentItems.length === 0 ? (
            <EmptyState
              icon="🔄"
              title={rentFilter === "all" ? "No rent listings yet" : `No ${rentFilter} rent items`}
              desc={
                rentFilter === "all"
                  ? "List your first item for rent and start earning."
                  : "Switch to another tab to see your other rent listings."
              }
              action={
                rentFilter === "all"
                  ? { label: "🔄 List Your First Rent Item", href: "/seller/rent" }
                  : undefined
              }
            />
          ) : (
            <div style={s.grid}>
              {filteredRentItems.map((item) => {
                const cond = CONDITION_META[item.condition] ?? {
                  label: item.condition, color: "#94a3b8", bg: "rgba(148,163,184,0.1)",
                };
                const status = RENT_STATUS_META[item.status];
                return (
                  <div key={item._id} style={s.card}>
                    <div style={s.imgWrap}>
                      {item.images.length > 0 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.images[0]} alt={item.title} style={s.img} />
                      ) : (
                        <div style={s.imgPlaceholder}>
                          <span style={{ fontSize: "3rem" }}>🔄</span>
                          <span style={s.imgPlaceholderText}>No image</span>
                        </div>
                      )}
                      <div style={s.overlayTop}>
                        {item.isUrgent && <span style={s.urgentBadge}>🔥 Urgent</span>}
                        {item.allowNegotiation && <span style={s.negotiateBadge}>🤝 Negotiable</span>}
                      </div>
                      <div style={s.overlayBottom}>
                        <span style={{ ...s.statusBadge, backgroundColor: status.bg, color: status.color }}>
                          {status.label}
                        </span>
                      </div>
                      {/* Rent label */}
                      <div style={s.overlayTopRight}>
                        <span style={s.rentLabel}>FOR RENT</span>
                      </div>
                    </div>

                    <div style={s.body}>
                      <div style={s.metaRow}>
                        <span style={s.categoryChip}>{item.category}</span>
                        <span style={{ ...s.conditionChip, backgroundColor: cond.bg, color: cond.color }}>
                          {cond.label}
                        </span>
                      </div>
                      <p style={s.cardTitle}>{item.title}</p>

                      {/* Rent pricing */}
                      <div style={s.priceRow}>
                        <span style={s.price}>₹{item.pricing.day}/day</span>
                        {item.pricing.week && (
                          <span style={s.priceAlt}>₹{item.pricing.week}/wk</span>
                        )}
                        {item.pricing.month && (
                          <span style={s.priceAlt}>₹{item.pricing.month}/mo</span>
                        )}
                      </div>

                      {/* Availability */}
                      <p style={s.availText}>
                        📅 {new Date(item.availability.from).toLocaleDateString()} → {new Date(item.availability.till).toLocaleDateString()}
                      </p>

                      {item.securityDeposit && (
                        <p style={s.depositText}>
                          🔒 Deposit: ₹{item.securityDeposit.toLocaleString("en-IN")}
                        </p>
                      )}

                      <p style={s.date}>
                        Listed {new Date(item.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </p>
                    </div>

                    <div style={s.cardActions}>
                      <button style={s.deleteBtn} onClick={() => handleDeleteRent(item._id, item.title)}>
                        🗑 Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Empty state helper ────────────────────────────────────────────────── */
function EmptyState({
  icon,
  title,
  desc,
  action,
}: {
  icon: string;
  title: string;
  desc: string;
  action?: { label: string; href: string };
}) {
  return (
    <div style={s.empty}>
      <div style={{ fontSize: "3.5rem", marginBottom: "0.75rem" }}>{icon}</div>
      <p style={s.emptyTitle}>{title}</p>
      <p style={s.emptyDesc}>{desc}</p>
      {action && (
        <Link href={action.href} style={s.emptyBtn}>
          {action.label}
        </Link>
      )}
    </div>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const s: Record<string, React.CSSProperties> = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
    maxWidth: "1100px",
    margin: "0 auto",
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1rem",
  },
  pageTitle: {
    fontSize: "1.5rem",
    fontWeight: 800,
    color: "#f8fafc",
    letterSpacing: "-0.02em",
    margin: 0,
  },
  pageSub: { fontSize: "0.8rem", color: "#64748b", marginTop: "0.2rem" },

  /* action buttons */
  actionBtn: {
    padding: "0.6rem 1.1rem",
    borderRadius: "10px",
    fontWeight: 700,
    fontSize: "0.82rem",
    textDecoration: "none",
    whiteSpace: "nowrap",
  },
  saleBtn: { backgroundColor: "#f59e0b", color: "#000" },
  rentBtn: {
    backgroundColor: "transparent",
    border: "1px solid rgba(245,158,11,0.4)",
    color: "#f59e0b",
  },

  /* view switcher */
  viewSwitcher: {
    display: "flex",
    gap: "0",
    backgroundColor: "#111",
    border: "1px solid #1f1f1f",
    borderRadius: "12px",
    padding: "4px",
    width: "fit-content",
  },
  viewBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.45rem",
    padding: "0.5rem 1.25rem",
    borderRadius: "9px",
    border: "none",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: 700,
    fontFamily: "inherit",
    transition: "all 0.2s",
  },
  viewBtnActive: {
    backgroundColor: "#f59e0b",
    color: "#000",
    boxShadow: "0 2px 8px rgba(245,158,11,0.25)",
  },
  viewBtnInactive: { backgroundColor: "transparent", color: "#64748b" },
  viewBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "20px",
    height: "18px",
    padding: "0 5px",
    borderRadius: "9px",
    fontSize: "0.65rem",
    fontWeight: 700,
    backgroundColor: "#1f1f1f",
    color: "#64748b",
    transition: "all 0.2s",
  },
  viewBadgeActive: { backgroundColor: "rgba(0,0,0,0.25)", color: "#000" },

  /* status filter tabs */
  tabRow: { display: "flex", gap: "0.5rem", flexWrap: "wrap" },
  tab: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    padding: "0.45rem 1rem",
    borderRadius: "20px",
    border: "1px solid transparent",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontWeight: 600,
    fontFamily: "inherit",
    transition: "all 0.2s",
    background: "none",
  },
  tabActive: {
    backgroundColor: "rgba(245,158,11,0.1)",
    border: "1px solid rgba(245,158,11,0.3)",
    color: "#f59e0b",
  },
  tabInactive: { backgroundColor: "#121212", border: "1px solid #1f1f1f", color: "#64748b" },
  tabBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "20px",
    height: "18px",
    padding: "0 5px",
    borderRadius: "9px",
    fontSize: "0.65rem",
    fontWeight: 700,
  },

  /* empty */
  empty: {
    textAlign: "center",
    padding: "4rem 2rem",
    backgroundColor: "#121212",
    border: "1px dashed #2a2a2a",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  emptyTitle: { fontSize: "1.05rem", fontWeight: 700, color: "#f8fafc", margin: "0 0 0.4rem" },
  emptyDesc: { fontSize: "0.85rem", color: "#64748b", maxWidth: "300px", margin: "0 auto 1.5rem" },
  emptyBtn: {
    padding: "0.65rem 1.5rem",
    backgroundColor: "#f59e0b",
    color: "#000",
    borderRadius: "8px",
    fontWeight: 700,
    fontSize: "0.875rem",
    textDecoration: "none",
  },

  /* grid */
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
    gap: "1.1rem",
  },

  /* card */
  card: {
    backgroundColor: "#121212",
    border: "1px solid #1f1f1f",
    borderRadius: "14px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    transition: "border-color 0.2s",
  },

  /* image */
  imgWrap: {
    position: "relative",
    height: "170px",
    backgroundColor: "#0a0a0a",
    overflow: "hidden",
    flexShrink: 0,
  },
  img: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  imgPlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.35rem",
    color: "#374151",
  },
  imgPlaceholderText: { fontSize: "0.7rem", color: "#374151" },

  overlayTop: {
    position: "absolute",
    top: "8px",
    left: "8px",
    display: "flex",
    gap: "0.35rem",
    flexWrap: "wrap",
  },
  overlayTopRight: { position: "absolute", top: "8px", right: "8px" },
  overlayBottom: { position: "absolute", bottom: "8px", right: "8px" },

  urgentBadge: {
    backgroundColor: "rgba(239,68,68,0.92)",
    color: "#fff",
    fontSize: "0.6rem",
    fontWeight: 800,
    borderRadius: "5px",
    padding: "2px 7px",
    backdropFilter: "blur(4px)",
  },
  bundleBadge: {
    backgroundColor: "rgba(59,130,246,0.85)",
    color: "#fff",
    fontSize: "0.6rem",
    fontWeight: 800,
    borderRadius: "5px",
    padding: "2px 7px",
    backdropFilter: "blur(4px)",
  },
  negotiateBadge: {
    backgroundColor: "rgba(16,185,129,0.85)",
    color: "#fff",
    fontSize: "0.6rem",
    fontWeight: 800,
    borderRadius: "5px",
    padding: "2px 7px",
    backdropFilter: "blur(4px)",
  },
  rentLabel: {
    backgroundColor: "rgba(139,92,246,0.9)",
    color: "#fff",
    fontSize: "0.55rem",
    fontWeight: 800,
    letterSpacing: "0.05em",
    borderRadius: "5px",
    padding: "2px 6px",
    backdropFilter: "blur(4px)",
  },
  statusBadge: {
    fontSize: "0.6rem",
    fontWeight: 700,
    borderRadius: "5px",
    padding: "2px 8px",
    backdropFilter: "blur(4px)",
  },

  /* body */
  body: {
    padding: "0.9rem 1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
    flex: 1,
  },
  metaRow: { display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center" },
  categoryChip: {
    fontSize: "0.68rem",
    fontWeight: 700,
    color: "#94a3b8",
    backgroundColor: "rgba(148,163,184,0.1)",
    borderRadius: "5px",
    padding: "1px 7px",
    border: "1px solid rgba(148,163,184,0.15)",
  },
  conditionChip: { fontSize: "0.68rem", fontWeight: 700, borderRadius: "5px", padding: "1px 7px" },
  cardTitle: {
    fontSize: "0.9rem",
    fontWeight: 700,
    color: "#f8fafc",
    margin: 0,
    lineHeight: 1.35,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  bundleSubtitle: {
    fontSize: "0.72rem",
    color: "#64748b",
    margin: 0,
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },
  priceRow: { display: "flex", alignItems: "baseline", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.1rem" },
  price: { fontSize: "1.1rem", fontWeight: 800, color: "#f59e0b", lineHeight: 1 },
  priceAlt: { fontSize: "0.72rem", color: "#6b7280" },
  origPrice: { fontSize: "0.75rem", color: "#4b5563", textDecoration: "line-through" },
  savingBadge: {
    fontSize: "0.62rem",
    fontWeight: 700,
    backgroundColor: "rgba(16,185,129,0.12)",
    color: "#10b981",
    borderRadius: "4px",
    padding: "1px 5px",
  },
  availText: { fontSize: "0.7rem", color: "#6b7280", margin: 0 },
  depositText: { fontSize: "0.7rem", color: "#94a3b8", margin: 0 },
  date: { fontSize: "0.68rem", color: "#374151", margin: 0, marginTop: "0.15rem" },

  /* card actions */
  cardActions: { display: "flex", gap: "0.5rem", padding: "0 0.9rem 0.9rem" },
  editBtn: {
    flex: 1,
    textAlign: "center",
    padding: "0.5rem",
    backgroundColor: "rgba(245,158,11,0.1)",
    color: "#f59e0b",
    border: "1px solid rgba(245,158,11,0.2)",
    borderRadius: "8px",
    fontSize: "0.78rem",
    fontWeight: 700,
    textDecoration: "none",
    transition: "all 0.2s",
    cursor: "pointer",
  },
  deleteBtn: {
    flex: 1,
    padding: "0.5rem",
    backgroundColor: "rgba(239,68,68,0.08)",
    color: "#ef4444",
    border: "1px solid rgba(239,68,68,0.18)",
    borderRadius: "8px",
    fontSize: "0.78rem",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.2s",
  },
};
