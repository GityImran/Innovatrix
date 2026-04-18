"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface ProductActionsProps {
  productId: string;
  type: "sell" | "rent";
  sellerId: string;
  sellerEmail: string;
  price: number;
  status: string;
  title: string;
  image: string;
}

export function ProductActions({
  productId,
  type,
  sellerId,
  sellerEmail,
  price,
  status,
  title,
  image,
}: ProductActionsProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [actionLoading, setActionLoading] = useState(false);
  const [cartState, setCartState] = useState<"idle" | "loading" | "success">("idle");

  const isSoldOut   = status !== "active";
  const isOwnProduct = session?.user?.id === sellerId;

  /* ── Buy / Rent ─────────────────────────── */
  const handleAction = async () => {
    if (!session) { router.push("/login"); return; }
    setActionLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: productId,
          itemModel: type === "sell" ? "Product" : "RentItem",
          sellerId,
          totalAmount: price,
          orderType: type === "sell" ? "buy" : "rent",
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      alert(type === "sell" ? "Order placed!" : "Rental requested!");
      router.push("/dashboard");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Add to Cart ─────────────────────────── */
  const handleAddToCart = async () => {
    if (!session) {
      alert("Please sign in to add items to your cart");
      router.push("/login");
      return;
    }

    setCartState("loading");
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: productId,
          itemModel: type === "sell" ? "Product" : "RentItem",
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to add to cart");
      }

      window.dispatchEvent(new Event("cartUpdated"));
      setCartState("success");
      setTimeout(() => setCartState("idle"), 2500);
    } catch (err: any) {
      alert(err.message);
      setCartState("idle");
    }
  };

  /* ── Own listing ─────────────────────────── */
  if (isOwnProduct) {
    return (
      <div style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "16px", padding: "18px 24px", textAlign: "center" }}>
        <span style={{ fontSize: "13px", fontWeight: 600, color: "#60a5fa" }}>📌 This is your own listing</span>
      </div>
    );
  }

  /* ── Sold out ────────────────────────────── */
  if (isSoldOut) {
    return (
      <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)", borderRadius: "16px", padding: "18px 24px", textAlign: "center" }}>
        <span style={{ fontSize: "14px", fontWeight: 700, color: "#f87171" }}>❌ Already {type === "sell" ? "Sold" : "Rented"}</span>
        <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#64748b" }}>This item is no longer available.</p>
      </div>
    );
  }

  /* ── Active listing ──────────────────────── */
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

      {/* Success toast */}
      {cartState === "success" && (
        <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: "12px", padding: "12px 18px", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1rem" }}>✨</span>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#34d399" }}>Added to cart successfully!</span>
        </div>
      )}

      {/* Primary row */}
      <div style={{ display: "flex", gap: "10px" }}>
        {/* Buy / Rent */}
        <button
          onClick={handleAction}
          disabled={actionLoading}
          style={{
            flex: 1,
            padding: "16px 24px",
            borderRadius: "14px",
            border: "none",
            cursor: actionLoading ? "not-allowed" : "pointer",
            fontWeight: 800,
            fontSize: "15px",
            letterSpacing: "0.02em",
            background: actionLoading
              ? "rgba(245,158,11,0.4)"
              : "linear-gradient(135deg,#f59e0b,#d97706)",
            color: "#000",
            boxShadow: "0 4px 20px rgba(245,158,11,0.25)",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          onMouseEnter={e => { if (!actionLoading) { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 30px rgba(245,158,11,0.4)"; }}}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(245,158,11,0.25)"; }}
        >
          {actionLoading ? "Processing…" : type === "sell" ? "⚡ Buy Now" : "📅 Request Rental"}
        </button>

        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          disabled={cartState === "loading"}
          style={{
            flex: 1,
            padding: "16px 24px",
            borderRadius: "14px",
            fontWeight: 700,
            fontSize: "15px",
            cursor: "pointer",
            background: cartState === "success"
              ? "rgba(16,185,129,0.12)"
              : "rgba(255,255,255,0.04)",
            color: cartState === "success" ? "#34d399" : "#e2e8f0",
            border: cartState === "success"
              ? "1px solid rgba(16,185,129,0.3)"
              : "1px solid rgba(255,255,255,0.1)",
            transition: "background 0.2s, border-color 0.2s, transform 0.15s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.background = cartState === "success" ? "rgba(16,185,129,0.18)" : "rgba(255,255,255,0.08)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.background = cartState === "success" ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.04)"; }}
        >
          {cartState === "success" ? "✓ In Cart" : "🛒 Add to Cart"}
        </button>
      </div>

      {/* Secondary — Email seller */}
      <a
        href={`mailto:${sellerEmail}?subject=Interested in: ${encodeURIComponent(title)}`}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          padding: "13px 24px",
          borderRadius: "14px",
          border: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(255,255,255,0.02)",
          color: "#64748b",
          fontSize: "13px",
          fontWeight: 600,
          textDecoration: "none",
          transition: "color 0.2s, background 0.2s",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#94a3b8"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#64748b"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"; }}
      >
        ✉️ Email the seller
      </a>

    </div>
  );
}
