"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, ShoppingBag, ArrowRight, CreditCard, CheckCircle, ChevronRight, Banknote, Wallet, Smartphone } from "lucide-react";

type CartItem = {
  _id: string;
  itemModel: string;
  itemId: {
    _id: string;
    title: string;
    productTitle?: string; // For Auction model
    expectedPrice?: number;
    currentBid?: number; // For Auction model
    pricing?: { day?: number };
    image?: { url: string };
    images?: string[]; // For Auction model
    category?: string;
    sellerDomain?: string;
  } | null;
};

type CheckoutStep = "cart" | "payment" | "review" | "success";
type PaymentMethod = "cod" | "upi" | "card" | null;

const STEPS = ["Cart", "Payment", "Review", "Done"];

const globalStyles = `
  @keyframes fadeUp {from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
  @keyframes scaleIn {from{transform:scale(0.6);opacity:0}to{transform:scale(1);opacity:1}}
  @keyframes shimmer {0%{background-position:-600px 0}100%{background-position:600px 0}}
  .shimmer{background:linear-gradient(90deg,#111 25%,#1c1c1c 50%,#111 75%);background-size:1200px 100%;animation:shimmer 1.6s infinite}
  .fade-item{animation:fadeUp 0.3s ease both}
  .remove-btn:hover{color:#f87171 !important;background:rgba(239,68,68,0.1) !important}
  .item-link:hover{color:#fbbf24 !important}
  .action-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 10px 32px rgba(245,158,11,0.45) !important}
  .pay-card{transition:border-color 0.2s, background 0.2s, box-shadow 0.2s;}
  .pay-card:hover{border-color:rgba(245,158,11,0.4) !important;background:rgba(245,158,11,0.04) !important}
`;

export default function CartClient() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [step, setStep] = useState<CheckoutStep>("cart");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [placedOrders, setPlacedOrders] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => { fetchCart(); }, []);

  /* ── Backend (unchanged) ────────────────────── */
  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) setItems(await res.json());
    } catch (err) { console.error("Failed to fetch cart", err); }
    finally { setLoading(false); }
  };

  const removeItem = async (cartItemId: string) => {
    try {
      const res = await fetch(`/api/cart?id=${cartItemId}`, { method: "DELETE" });
      if (res.ok) setItems(items.filter((item) => item._id !== cartItemId));
    } catch (err) { console.error("Failed to remove item", err); }
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/cart/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: paymentMethod ?? "cod" }),
      });
      if (res.ok) {
        const data = await res.json();
        setPlacedOrders(data.orders || []);
        setStep("success");
      } else {
        const d = await res.json();
        alert(d.error || "Checkout failed");
      }
    } catch (err) {
      console.error("Checkout failed", err);
      alert("An unexpected error occurred during checkout");
    } finally { setCheckoutLoading(false); }
  };

  const subtotal = items.reduce((acc, item) => {
    let price = 0;
    if (item.itemModel === "Product") {
      price = item.itemId?.expectedPrice || 0;
    } else if (item.itemModel === "RentItem") {
      price = item.itemId?.pricing?.day || 0;
    } else if (item.itemModel === "Auction") {
      price = item.itemId?.currentBid || 0;
    }
    return acc + price;
  }, 0);

  /* ── Shared: Step Progress Bar ──────────────── */
  const stepIndex = { cart: 0, payment: 1, review: 2, success: 3 }[step];
  const StepBar = () => (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "40px" }}>
      {STEPS.map((s, i) => (
        <React.Fragment key={s}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{
              width: "24px", height: "24px", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "11px", fontWeight: 800,
              background: i <= stepIndex
                ? "linear-gradient(135deg,#f59e0b,#d97706)"
                : "rgba(255,255,255,0.05)",
              color: i <= stepIndex ? "#000" : "#334155",
              boxShadow: i === stepIndex ? "0 0 12px rgba(245,158,11,0.4)" : "none",
              transition: "all 0.3s",
            }}>
              {i < stepIndex ? "✓" : i + 1}
            </div>
            <span style={{ fontSize: "12px", fontWeight: 600, color: i <= stepIndex ? "#f59e0b" : "#1e293b", display: "flex" as const }}>
              {s}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{ flex: 1, height: "1px", background: i < stepIndex ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.06)", transition: "background 0.3s", minWidth: "20px" }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  /* ── Shared: Back + Title header ─────────────── */
  const PageHeader = ({ title, subtitle, onBack }: { title: string; subtitle: string; onBack?: () => void }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
      {onBack && (
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#64748b", borderRadius: "10px", padding: "8px 14px", fontSize: "13px", cursor: "pointer", fontWeight: 600, flexShrink: 0 }}>
          ← Back
        </button>
      )}
      <div>
        <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 900, letterSpacing: "-0.02em", background: "linear-gradient(135deg,#fff,#94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          {title}
        </h1>
        <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#475569" }}>{subtitle}</p>
      </div>
    </div>
  );

  /* ── Skeleton ─────────────────────────────────── */
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#080808", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{globalStyles}</style>
        <div style={{ maxWidth: "900px", width: "100%", padding: "48px 24px" }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="shimmer" style={{ height: "104px", borderRadius: "18px", marginBottom: "14px" }} />
          ))}
        </div>
      </div>
    );
  }

  /* ── Empty Cart ───────────────────────────────── */
  if (items.length === 0 && step === "cart") {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#080808", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <style>{globalStyles}</style>
        <div style={{ textAlign: "center", maxWidth: "400px" }}>
          <div style={{ fontSize: "5rem", marginBottom: "24px", opacity: 0.5 }}>🛒</div>
          <h2 style={{ margin: "0 0 12px", fontSize: "1.75rem", fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.02em" }}>Your cart is empty</h2>
          <p style={{ margin: "0 0 32px", fontSize: "14px", color: "#475569", lineHeight: 1.7 }}>
            Explore the campus marketplace to find amazing deals!
          </p>
          <Link href="/search" style={{ textDecoration: "none" }}>
            <button style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "14px 28px", borderRadius: "14px", background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#000", fontWeight: 800, fontSize: "15px", border: "none", cursor: "pointer", boxShadow: "0 4px 20px rgba(245,158,11,0.3)" }}>
              Start Shopping <ArrowRight size={18} />
            </button>
          </Link>
        </div>
      </div>
    );
  }

  /* ── SUCCESS ──────────────────────────────────── */
  if (step === "success") {
    const methodLabel = "Pay on Delivery (Cash / UPI)";
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#080808", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <style>{globalStyles}</style>
        <div style={{ textAlign: "center", maxWidth: "500px", width: "100%" }}>
          <div style={{ width: "90px", height: "90px", borderRadius: "50%", background: "rgba(16,185,129,0.1)", border: "2px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px", animation: "scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }}>
            <CheckCircle size={44} color="#10b981" />
          </div>
          <h1 style={{ margin: "0 0 10px", fontSize: "2rem", fontWeight: 900, color: "#f1f5f9", letterSpacing: "-0.02em", animation: "fadeUp 0.4s 0.2s both" }}>
            Order Placed! 🎉
          </h1>
          <p style={{ margin: "0 0 6px", fontSize: "15px", color: "#64748b", animation: "fadeUp 0.4s 0.3s both" }}>
            {placedOrders.length} {placedOrders.length === 1 ? "order" : "orders"} confirmed
          </p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 14px", borderRadius: "999px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", marginBottom: "28px", animation: "fadeUp 0.4s 0.35s both" }}>
            <span style={{ fontSize: "12px", color: "#f59e0b", fontWeight: 700 }}>💳 {methodLabel}</span>
          </div>

          {placedOrders.length > 0 && (
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "20px", marginBottom: "28px", animation: "fadeUp 0.4s 0.4s both", textAlign: "left" }}>
              <p style={{ margin: "0 0 12px", fontSize: "11px", fontWeight: 700, color: "#334155", letterSpacing: "0.15em", textTransform: "uppercase" }}>Order References</p>
              {placedOrders.map((o: any, i: number) => (
                <p key={i} style={{ margin: "0 0 6px", fontSize: "12px", color: "#475569", fontFamily: "monospace" }}>
                  <span style={{ color: "#64748b" }}>#{i + 1}</span>{" "}
                  <span style={{ color: "#94a3b8" }}>{o._id || `order-${i + 1}`}</span>
                </p>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", animation: "fadeUp 0.4s 0.5s both" }}>
            <button onClick={() => router.push("/dashboard")} style={{ padding: "14px 28px", borderRadius: "14px", background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#000", fontWeight: 800, fontSize: "14px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 20px rgba(245,158,11,0.3)" }}>
              View Orders <ArrowRight size={16} />
            </button>
            <button onClick={() => router.push("/search")} style={{ padding: "14px 24px", borderRadius: "14px", background: "rgba(255,255,255,0.04)", color: "#64748b", fontWeight: 600, fontSize: "14px", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer" }}>
              Keep Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── PAYMENT STEP ──────────────────────────────── */
  if (step === "payment") {
    const payOptions = [
      {
        id: "cod" as PaymentMethod,
        icon: <Banknote size={28} color="#10b981" />,
        title: "Pay on Delivery (Cash / UPI)",
        subtitle: "Pay the seller directly when you receive the item. The seller will generate a secure Razorpay QR code for UPI/Card, or you can pay in cash.",
        badge: "Recommended",
        badgeColor: "#10b981",
        accentColor: "rgba(16,185,129,0.15)",
        borderColor: "rgba(16,185,129,0.35)",
      }
    ];

    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#080808", color: "#e2e8f0" }}>
        <style>{globalStyles}</style>
        <div style={{ maxWidth: "680px", margin: "0 auto", padding: "48px 24px" }}>
          <StepBar />
          <PageHeader
            title="Choose Payment Method"
            subtitle="Select how you'd like to pay for your order"
            onBack={() => setStep("cart")}
          />

          {/* Payment options */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "36px" }}>
            {payOptions.map((opt, idx) => {
              const isSelected = paymentMethod === opt.id;
              return (
                <div
                  key={opt.id}
                  className="pay-card fade-item"
                  onClick={() => setPaymentMethod(opt.id)}
                  style={{
                    animationDelay: `${idx * 80}ms`,
                    display: "flex",
                    alignItems: "center",
                    gap: "18px",
                    padding: "20px 22px",
                    borderRadius: "18px",
                    cursor: "pointer",
                    border: isSelected ? `2px solid ${opt.borderColor}` : "2px solid rgba(255,255,255,0.07)",
                    background: isSelected ? opt.accentColor : "rgba(255,255,255,0.02)",
                    boxShadow: isSelected ? `0 0 24px ${opt.accentColor}` : "none",
                    position: "relative",
                    transition: "all 0.2s",
                  }}
                >
                  {/* Icon */}
                  <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {opt.icon}
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "15px", fontWeight: 700, color: "#f1f5f9" }}>{opt.title}</span>
                      <span style={{ fontSize: "10px", fontWeight: 800, padding: "2px 8px", borderRadius: "999px", background: `rgba(${opt.badgeColor === "#10b981" ? "16,185,129" : opt.badgeColor === "#818cf8" ? "129,140,248" : "245,158,11"},0.15)`, color: opt.badgeColor, border: `1px solid ${opt.badgeColor}40`, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        {opt.badge}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: "13px", color: "#475569", lineHeight: 1.5 }}>{opt.subtitle}</p>
                  </div>

                  {/* Radio indicator */}
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: isSelected ? `2px solid ${opt.borderColor}` : "2px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                    {isSelected && <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: opt.borderColor }} />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Flow Notice */}
          <div className="fade-item" style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: "14px", padding: "14px 18px", marginBottom: "24px", display: "flex", gap: "10px" }}>
            <span style={{ fontSize: "1rem", flexShrink: 0 }}>💡</span>
            <p style={{ margin: 0, fontSize: "12px", color: "#475569", lineHeight: 1.7 }}>
              When the seller delivers your item, they will show you a Razorpay QR code on their phone. You can scan it to pay securely via UPI, or hand them cash.
            </p>
          </div>

          {/* Order total preview */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "16px 20px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#475569" }}>Amount to pay</span>
            <span style={{ fontSize: "1.5rem", fontWeight: 900, color: "#f59e0b", letterSpacing: "-0.02em" }}>₹{subtotal?.toLocaleString("en-IN")}</span>
          </div>

          {/* CTA */}
          <button
            className="action-btn"
            disabled={!paymentMethod}
            onClick={() => setStep("review")}
            style={{
              width: "100%",
              padding: "17px",
              borderRadius: "16px",
              border: "none",
              background: paymentMethod ? "linear-gradient(135deg,#f59e0b,#d97706)" : "rgba(255,255,255,0.05)",
              color: paymentMethod ? "#000" : "#334155",
              fontWeight: 900,
              fontSize: "15px",
              cursor: paymentMethod ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: paymentMethod ? "0 4px 20px rgba(245,158,11,0.25)" : "none",
              transition: "transform 0.15s, box-shadow 0.15s, background 0.2s",
              letterSpacing: "0.01em",
            }}
          >
            {paymentMethod ? (<>Review Order <ArrowRight size={18} /></>) : "Select a payment method to continue"}
          </button>
        </div>
      </div>
    );
  }

  /* ── REVIEW STEP ─────────────────────────────── */
  if (step === "review") {
    const methodMeta: Record<string, { label: string; icon: string; color: string }> = {
      cod:  { label: "Pay on Delivery (Cash / UPI)", icon: "💵", color: "#10b981" },
    };
    const method = paymentMethod ? methodMeta[paymentMethod] : null;

    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#080808", color: "#e2e8f0" }}>
        <style>{globalStyles}</style>
        <div style={{ maxWidth: "760px", margin: "0 auto", padding: "48px 24px" }}>
          <StepBar />
          <PageHeader
            title="Review Your Order"
            subtitle="Confirm items and payment before placing"
            onBack={() => setStep("payment")}
          />

          {/* Items */}
          <p style={{ margin: "0 0 14px", fontSize: "11px", fontWeight: 700, color: "#334155", letterSpacing: "0.15em", textTransform: "uppercase" }}>Items ({items.length})</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}>
            {items.map((item, idx) => {
              const product = item.itemId;
              const isSell = item.itemModel === "Product";
              const isRent = item.itemModel === "RentItem";
              const isAuction = item.itemModel === "Auction";

              let price = 0;
              let title = product?.title || "Unknown Item";
              let imageUrl = product?.image?.url;
              let category = product?.category;

              if (isSell) {
                price = product?.expectedPrice || 0;
              } else if (isRent) {
                price = product?.pricing?.day || 0;
              } else if (isAuction) {
                price = product?.currentBid || 0;
                title = product?.productTitle || "Won Auction";
                imageUrl = product?.images && product.images.length > 0 ? product.images[0] : undefined;
              }

              return (
                <div key={item._id} className="fade-item" style={{ animationDelay: `${idx * 50}ms`, display: "flex", gap: "14px", alignItems: "center", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "14px" }}>
                  <div style={{ width: "62px", height: "62px", borderRadius: "10px", overflow: "hidden", flexShrink: 0, background: "#111" }}>
                    {imageUrl
                      ? <img src={imageUrl} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", opacity: 0.4 }}>
                          {isSell ? "📦" : isRent ? "🔁" : "🔨"}
                        </div>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: isSell ? "#f59e0b" : isRent ? "#a855f7" : "#10b981" }}>
                      {isSell ? "For Sale" : isRent ? "For Rent" : "Auction Won"} {category ? `· ${category}` : ""}
                    </span>
                    <p style={{ margin: "3px 0 0", fontWeight: 700, fontSize: "14px", color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {title}
                    </p>
                    {product?.sellerDomain && <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#334155" }}>{product.sellerDomain}</p>}
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 900, color: "#f59e0b", letterSpacing: "-0.02em" }}>
                      ₹{price?.toLocaleString("en-IN")}
                    </p>
                    {isRent && <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#334155" }}>/day</p>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Payment method selected */}
          {method && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", padding: "14px 18px", marginBottom: "20px" }}>
              <span style={{ fontSize: "13px", color: "#475569" }}>Payment Method</span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span>{method.icon}</span>
                <span style={{ fontSize: "13px", fontWeight: 700, color: method.color }}>{method.label}</span>
                <button onClick={() => setStep("payment")} style={{ fontSize: "11px", color: "#475569", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}>Change</button>
              </div>
            </div>
          )}

          {/* Order total */}
          <div style={{ background: "linear-gradient(145deg,rgba(15,15,15,0.98),rgba(10,10,10,0.98))", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "24px", marginBottom: "20px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "100px", height: "100px", background: "rgba(245,158,11,0.08)", borderRadius: "50%", filter: "blur(40px)", pointerEvents: "none" }} />
            {[
              { label: `Subtotal (${items.length} items)`, value: `₹${subtotal?.toLocaleString("en-IN")}`, color: "#94a3b8" },
              { label: "Platform Fee", value: "FREE", color: "#34d399" },
              { label: "Delivery", value: "Arranged with seller", color: "#334155" },
            ].map(row => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ fontSize: "13px", color: "#475569" }}>{row.label}</span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: row.color }}>{row.value}</span>
              </div>
            ))}
            <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "16px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontWeight: 700, color: "#64748b", fontSize: "14px" }}>Total</span>
              <span style={{ fontSize: "2rem", fontWeight: 900, color: "#f59e0b", letterSpacing: "-0.03em" }}>₹{subtotal?.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Notice */}
          <div style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.12)", borderRadius: "14px", padding: "14px 18px", marginBottom: "24px", display: "flex", gap: "10px" }}>
            <span style={{ fontSize: "1rem", flexShrink: 0 }}>ℹ️</span>
            <p style={{ margin: 0, fontSize: "12px", color: "#475569", lineHeight: 1.7 }}>
              By confirming, sellers will be notified and will coordinate delivery via campus email. Payment via <strong style={{ color: "#94a3b8" }}>{method?.label}</strong>.
            </p>
          </div>

          {/* Confirm CTA */}
          <button
            className="action-btn"
            onClick={handleCheckout}
            disabled={checkoutLoading}
            style={{ width: "100%", padding: "18px", borderRadius: "16px", border: "none", background: checkoutLoading ? "rgba(245,158,11,0.4)" : "linear-gradient(135deg,#f59e0b,#d97706)", color: "#000", fontWeight: 900, fontSize: "16px", cursor: checkoutLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", boxShadow: "0 4px 24px rgba(245,158,11,0.3)", transition: "transform 0.15s, box-shadow 0.15s", letterSpacing: "0.01em" }}
          >
            {checkoutLoading ? "Placing Your Order…" : (<>Confirm & Place Order <ArrowRight size={20} /></>)}
          </button>
        </div>
      </div>
    );
  }

  /* ── CART STEP ────────────────────────────────── */
  return (
    <>
      <style>{globalStyles}</style>
      <div style={{ minHeight: "100vh", backgroundColor: "#080808", color: "#e2e8f0" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 24px" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "40px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShoppingBag size={22} color="#f59e0b" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 900, letterSpacing: "-0.02em", background: "linear-gradient(135deg,#fff 60%,#94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Shopping Cart
              </h1>
              <p style={{ margin: 0, fontSize: "13px", color: "#475569", marginTop: "2px" }}>
                {items.length} {items.length === 1 ? "item" : "items"}
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr min(360px,100%)", gap: "32px", alignItems: "start" }}>

            {/* Item cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {items.map((item, idx) => {
                const product = item.itemId;
                const isSell = item.itemModel === "Product";
                const isRent = item.itemModel === "RentItem";
                const isAuction = item.itemModel === "Auction";

                let price = 0;
                let title = product?.title || "Unknown Item";
                let imageUrl = product?.image?.url;
                let category = product?.category;
                let detailUrl = `/product/${product?._id}`;

                if (isSell) {
                  price = product?.expectedPrice || 0;
                } else if (isRent) {
                  price = product?.pricing?.day || 0;
                } else if (isAuction) {
                  price = product?.currentBid || 0;
                  title = product?.productTitle || "Won Auction";
                  imageUrl = product?.images && product.images.length > 0 ? product.images[0] : undefined;
                  detailUrl = `/auction/${product?._id}`;
                }

                return (
                  <div key={item._id} className="fade-item" style={{ animationDelay: `${idx * 60}ms`, display: "flex", gap: "16px", alignItems: "center", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "18px", padding: "16px" }}>
                    <div style={{ width: "88px", height: "88px", borderRadius: "12px", overflow: "hidden", flexShrink: 0, background: "#111", border: "1px solid rgba(255,255,255,0.05)" }}>
                      {imageUrl
                        ? <img src={imageUrl} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", opacity: 0.4 }}>
                            {isSell ? "📦" : isRent ? "🔁" : "🔨"}
                          </div>
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                        <div style={{ minWidth: 0 }}>
                          <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: isSell ? "#f59e0b" : isRent ? "#a855f7" : "#10b981", display: "block", marginBottom: "4px" }}>
                            {isSell ? "🏷️ For Sale" : isRent ? "🔁 For Rent" : "🔨 Auction Won"} {category ? `· ${category}` : ""}
                          </span>
                          <Link href={detailUrl} style={{ textDecoration: "none" }}>
                            <h3 className="item-link" style={{ margin: 0, fontWeight: 700, fontSize: "1rem", color: "#e2e8f0", transition: "color 0.2s", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {title}
                            </h3>
                          </Link>
                          <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginTop: "10px" }}>
                            <span style={{ fontSize: "1.25rem", fontWeight: 900, color: "#f59e0b", letterSpacing: "-0.02em" }}>₹{price?.toLocaleString("en-IN")}</span>
                            {isRent && <span style={{ fontSize: "12px", color: "#475569" }}>/day</span>}
                          </div>
                        </div>
                        <button className="remove-btn" onClick={() => removeItem(item._id)} style={{ flexShrink: 0, color: "#334155", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "8px", display: "flex", alignItems: "center", cursor: "pointer", transition: "color 0.2s, background 0.2s" }} title="Remove">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary panel */}
            <div style={{ position: "sticky", top: "24px" }}>
              <div style={{ background: "linear-gradient(145deg,rgba(15,15,15,0.98),rgba(10,10,10,0.98))", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "22px", padding: "28px", boxShadow: "0 24px 60px rgba(0,0,0,0.5)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: "-30px", right: "-30px", width: "140px", height: "140px", background: "rgba(245,158,11,0.07)", borderRadius: "50%", filter: "blur(50px)", pointerEvents: "none" }} />
                <h2 style={{ margin: "0 0 22px", fontSize: "15px", fontWeight: 800, color: "#f1f5f9", position: "relative" }}>Order Summary</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "18px", position: "relative" }}>
                  {[
                    { label: `Items (${items.length})`, value: `₹${subtotal?.toLocaleString("en-IN")}`, color: "#94a3b8" },
                    { label: "Platform Fee", value: "FREE", color: "#34d399" },
                    { label: "Delivery", value: "TBD", color: "#1e293b" },
                  ].map(row => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "13px", color: "#475569" }}>{row.label}</span>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: row.color }}>{row.value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ height: "1px", background: "linear-gradient(90deg,rgba(255,255,255,0.07),transparent)", marginBottom: "18px", position: "relative" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "24px", position: "relative" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#64748b" }}>Total</span>
                  <span style={{ fontSize: "2rem", fontWeight: 900, color: "#f59e0b", letterSpacing: "-0.03em" }}>₹{subtotal?.toLocaleString("en-IN")}</span>
                </div>

                <button
                  className="action-btn"
                  onClick={() => { setPaymentMethod(null); setStep("payment"); }}
                  style={{ width: "100%", padding: "16px", borderRadius: "14px", border: "none", background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#000", fontWeight: 900, fontSize: "15px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 4px 20px rgba(245,158,11,0.25)", transition: "transform 0.15s, box-shadow 0.15s", position: "relative", letterSpacing: "0.01em" }}
                >
                  Choose Payment <ArrowRight size={18} />
                </button>

                <div style={{ marginTop: "18px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[
                    { icon: <CreditCard size={13} />, label: "COD / UPI / Card" },
                    { icon: <ShoppingBag size={13} />, label: "Buyer Protection" },
                  ].map(t => (
                    <div key={t.label} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "#1e293b" }}>
                      <span style={{ color: "#1e293b" }}>{t.icon}</span> {t.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
