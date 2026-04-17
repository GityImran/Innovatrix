/**
 * app/seller/products/page.tsx
 * Listed Products — full grid with image, title, category, condition,
 * price, urgent badge, bundle label, Edit & Delete actions.
 */

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getProducts, deleteProduct, type Product } from "@/lib/productStore";

const CONDITION_META: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  new: { label: "New", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  good: { label: "Good", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  used: { label: "Used", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
};

const STATUS_META: Record<
  Product["status"],
  { label: string; color: string; bg: string }
> = {
  active: { label: "Active", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  draft: { label: "Draft", color: "#94a3b8", bg: "rgba(100,116,139,0.12)" },
  sold: { label: "Sold", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
};

type FilterTab = "all" | Product["status"];

export default function ListedProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setProducts(getProducts());
    setMounted(true);
  }, []);

  const refresh = () => setProducts(getProducts());

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    deleteProduct(id);
    refresh();
  };

  const filtered =
    filter === "all" ? products : products.filter((p) => p.status === filter);

  const countFor = (tab: FilterTab) =>
    tab === "all"
      ? products.length
      : products.filter((p) => p.status === tab).length;

  if (!mounted) return null;

  return (
    <div style={s.page}>

      {/* ── Top Row ── */}
      <div style={s.topRow}>
        <div>
          <h1 style={s.title}>Listed Products</h1>
          <p style={s.subtitle}>
            {products.length} product{products.length !== 1 ? "s" : ""} in your store
          </p>
        </div>
        <Link href="/seller/add-product" style={s.addBtn}>
          + Add Product
        </Link>
      </div>

      {/* ── Filter Tabs ── */}
      <div style={s.tabRow}>
        {(["all", "active", "draft", "sold"] as const).map((tab) => (
          <button
            key={tab}
            style={{ ...s.tab, ...(filter === tab ? s.tabActive : s.tabInactive) }}
            onClick={() => setFilter(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            <span
              style={{
                ...s.tabBadge,
                ...(filter === tab
                  ? { backgroundColor: "#f59e0b", color: "#000" }
                  : { backgroundColor: "#1f1f1f", color: "#64748b" }),
              }}
            >
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
            {filter === "all" ? "No products yet" : `No ${filter} products`}
          </p>
          <p style={s.emptyDesc}>
            {filter === "all"
              ? "Add your first item and start selling on campus."
              : `Switch to another tab to see your other listings.`}
          </p>
          {filter === "all" && (
            <Link href="/seller/add-product" style={s.emptyBtn}>
              + List Your First Item
            </Link>
          )}
        </div>
      )}

      {/* ── Product Grid ── */}
      {filtered.length > 0 && (
        <div style={s.grid}>
          {filtered.map((product) => {
            const cond = CONDITION_META[product.condition] ?? {
              label: product.condition,
              color: "#94a3b8",
              bg: "rgba(148,163,184,0.1)",
            };
            const status = STATUS_META[product.status];

            return (
              <div key={product.id} style={s.card}>

                {/* ── Image ── */}
                <div style={s.imgWrap}>
                  {product.images.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      style={s.img}
                    />
                  ) : (
                    <div style={s.imgPlaceholder}>
                      <span style={{ fontSize: "3rem" }}>📦</span>
                      <span style={s.imgPlaceholderText}>No image</span>
                    </div>
                  )}

                  {/* Overlay badges */}
                  <div style={s.overlayTop}>
                    {product.isUrgent && (
                      <span style={s.urgentBadge}>🔥 Urgent</span>
                    )}
                    {product.isBundle && (
                      <span style={s.bundleBadge}>📦 Bundle</span>
                    )}
                  </div>
                  <div style={s.overlayBottom}>
                    <span
                      style={{
                        ...s.statusBadge,
                        backgroundColor: status.bg,
                        color: status.color,
                      }}
                    >
                      {status.label}
                    </span>
                  </div>
                </div>

                {/* ── Body ── */}
                <div style={s.body}>

                  {/* Category + Condition row */}
                  <div style={s.metaRow}>
                    <span style={s.categoryChip}>{product.category}</span>
                    <span
                      style={{
                        ...s.conditionChip,
                        backgroundColor: cond.bg,
                        color: cond.color,
                      }}
                    >
                      {cond.label}
                    </span>
                  </div>

                  {/* Title */}
                  <p style={s.productTitle}>{product.title}</p>

                  {/* Bundle sub-title */}
                  {product.isBundle && product.bundleTitle && (
                    <p style={s.bundleTitle}>
                      <span style={s.bundleIcon}>📦</span> {product.bundleTitle}
                    </p>
                  )}

                  {/* Price */}
                  <div style={s.priceRow}>
                    <span style={s.price}>₹{product.expectedPrice.toLocaleString("en-IN")}</span>
                    {product.originalPrice && (
                      <>
                        <span style={s.origPrice}>
                          ₹{product.originalPrice.toLocaleString("en-IN")}
                        </span>
                        {product.originalPrice > product.expectedPrice && (
                          <span style={s.savingBadge}>
                            {Math.round(
                              (1 - product.expectedPrice / product.originalPrice) * 100
                            )}
                            % off
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Listed date */}
                  <p style={s.date}>
                    Listed{" "}
                    {new Date(product.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {/* ── Actions ── */}
                <div style={s.actions}>
                  <Link
                    href={`/seller/products/${product.id}/edit`}
                    style={s.editBtn}
                  >
                    ✏️ Edit
                  </Link>
                  <button
                    style={s.deleteBtn}
                    onClick={() => handleDelete(product.id, product.title)}
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Styles ─── */
const s: Record<string, React.CSSProperties> = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
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
  addBtn: {
    padding: "0.65rem 1.25rem",
    backgroundColor: "#f59e0b",
    color: "#000",
    borderRadius: "10px",
    fontWeight: 700,
    fontSize: "0.875rem",
    textDecoration: "none",
    whiteSpace: "nowrap",
  },
  tabRow: {
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap",
  },
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
  tabInactive: {
    backgroundColor: "#121212",
    border: "1px solid #1f1f1f",
    color: "#64748b",
  },
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
  /* Empty */
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
  emptyTitle: {
    fontSize: "1.05rem",
    fontWeight: 700,
    color: "#f8fafc",
    margin: "0 0 0.4rem",
  },
  emptyDesc: {
    fontSize: "0.85rem",
    color: "#64748b",
    maxWidth: "300px",
    margin: "0 auto 1.5rem",
  },
  emptyBtn: {
    padding: "0.65rem 1.5rem",
    backgroundColor: "#f59e0b",
    color: "#000",
    borderRadius: "8px",
    fontWeight: 700,
    fontSize: "0.875rem",
    textDecoration: "none",
  },
  /* Grid */
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
    gap: "1.1rem",
  },
  /* Card */
  card: {
    backgroundColor: "#121212",
    border: "1px solid #1f1f1f",
    borderRadius: "14px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    transition: "border-color 0.2s, transform 0.15s",
  },
  /* Image */
  imgWrap: {
    position: "relative",
    height: "170px",
    backgroundColor: "#0a0a0a",
    overflow: "hidden",
    flexShrink: 0,
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
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
  imgPlaceholderText: {
    fontSize: "0.7rem",
    color: "#374151",
  },
  overlayTop: {
    position: "absolute",
    top: "8px",
    left: "8px",
    display: "flex",
    gap: "0.35rem",
    flexWrap: "wrap",
  },
  overlayBottom: {
    position: "absolute",
    bottom: "8px",
    right: "8px",
  },
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
  statusBadge: {
    fontSize: "0.6rem",
    fontWeight: 700,
    borderRadius: "5px",
    padding: "2px 8px",
    backdropFilter: "blur(4px)",
  },
  /* Body */
  body: {
    padding: "0.9rem 1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
    flex: 1,
  },
  metaRow: {
    display: "flex",
    gap: "0.4rem",
    flexWrap: "wrap",
    alignItems: "center",
  },
  categoryChip: {
    fontSize: "0.68rem",
    fontWeight: 700,
    color: "#94a3b8",
    backgroundColor: "rgba(148,163,184,0.1)",
    borderRadius: "5px",
    padding: "1px 7px",
    border: "1px solid rgba(148,163,184,0.15)",
  },
  conditionChip: {
    fontSize: "0.68rem",
    fontWeight: 700,
    borderRadius: "5px",
    padding: "1px 7px",
  },
  productTitle: {
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
  bundleTitle: {
    fontSize: "0.72rem",
    color: "#64748b",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "0.3rem",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },
  bundleIcon: {
    flexShrink: 0,
  },
  priceRow: {
    display: "flex",
    alignItems: "baseline",
    gap: "0.5rem",
    flexWrap: "wrap",
    marginTop: "0.1rem",
  },
  price: {
    fontSize: "1.15rem",
    fontWeight: 800,
    color: "#f59e0b",
    lineHeight: 1,
  },
  origPrice: {
    fontSize: "0.75rem",
    color: "#4b5563",
    textDecoration: "line-through",
  },
  savingBadge: {
    fontSize: "0.62rem",
    fontWeight: 700,
    backgroundColor: "rgba(16,185,129,0.12)",
    color: "#10b981",
    borderRadius: "4px",
    padding: "1px 5px",
  },
  date: {
    fontSize: "0.68rem",
    color: "#374151",
    margin: 0,
    marginTop: "0.2rem",
  },
  /* Actions */
  actions: {
    display: "flex",
    gap: "0.5rem",
    padding: "0 0.9rem 0.9rem",
  },
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
