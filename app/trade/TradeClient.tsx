"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";

// ─── Types ─────────────────────────────────────────────────────────────────────

type TradeStatus = "pending" | "accepted" | "rejected" | "scheduled" | "completed";
type MeetingStatus = "pending" | "accepted" | "rejected";

interface PopulatedProduct {
  _id: string;
  title: string;
  image?: { url: string };
  expectedPrice?: number;
  category?: string;
  isTradeEnabled?: boolean;
  tradePreferences?: string[];
}

interface PopulatedUser {
  _id: string;
  name: string;
  email: string;
}

interface MeetingDetails {
  proposedBy: string;
  place: string;
  time: string;
  status: MeetingStatus;
  acceptedBy: string[];
}

interface Trade {
  _id: string;
  requesterId: PopulatedUser;
  ownerId: PopulatedUser;
  requestedProductId: PopulatedProduct;
  offeredProductIds: PopulatedProduct[];
  cashOffered: number;
  status: TradeStatus;
  meetingDetails?: MeetingDetails;
  createdAt: string;
}

interface TradeableProduct extends PopulatedProduct {
  sellerId?: { _id: string; name: string };
}

interface MyProduct {
  _id: string;
  title: string;
  image?: { url: string };
  expectedPrice?: number;
}

// ─── Status meta ─────────────────────────────────────────────────────────────

const STATUS_META: Record<TradeStatus, { label: string; color: string; bg: string; border: string; icon: string }> = {
  pending:   { label: "Pending",   color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)",  icon: "⏳" },
  accepted:  { label: "Accepted",  color: "#34d399", bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.25)",  icon: "🎉" },
  rejected:  { label: "Rejected",  color: "#ef4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)",   icon: "❌" },
  scheduled: { label: "Scheduled", color: "#818cf8", bg: "rgba(129,140,248,0.1)", border: "rgba(129,140,248,0.25)", icon: "📍" },
  completed: { label: "Completed", color: "#10b981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)",  icon: "✅" },
};

// ─── Global CSS ───────────────────────────────────────────────────────────────

const globalStyles = `
  @keyframes fadeUp   { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
  @keyframes scaleIn  { from { transform: scale(0.92); opacity: 0; }       to { transform: scale(1);   opacity: 1; } }
  @keyframes spin     { to   { transform: rotate(360deg); } }
  @keyframes shimmer  { 0%   { background-position: -800px 0; } 100% { background-position: 800px 0; } }
  @keyframes slideDown{ from { opacity: 0; transform: translateY(-8px); }  to { opacity: 1; transform: none; } }
  .fade-up  { animation: fadeUp  0.35s ease both; }
  .shimmer-box { background: linear-gradient(90deg,#111 25%,#1c1c1c 50%,#111 75%); background-size: 1600px 100%; animation: shimmer 1.8s infinite; }
  .trade-card:hover      { border-color: rgba(245,158,11,0.18) !important; transform: translateY(-3px); box-shadow: 0 16px 40px rgba(0,0,0,0.5) !important; }
  .trade-card            { transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s; }
  .action-btn:hover:not(:disabled) { filter: brightness(1.15); transform: translateY(-1px); }
  .action-btn            { transition: filter 0.15s, transform 0.15s; }
  .product-check:hover   { border-color: rgba(245,158,11,0.4) !important; }
  .meeting-slide         { animation: slideDown 0.25s ease; }
`;

// ─── Micro-components ─────────────────────────────────────────────────────────

const Spinner = ({ size = 16 }: { size?: number }) => (
  <span style={{ display: "inline-block", width: size, height: size, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite", flexShrink: 0 }} />
);

const ProductThumb = ({ product, size = 56 }: { product: PopulatedProduct; size?: number }) => (
  <div style={{ width: size, height: size, borderRadius: 10, overflow: "hidden", background: "#111", border: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
    {product.image?.url
      ? <img src={product.image.url} alt={product.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.4, opacity: 0.4 }}>🔁</div>
    }
  </div>
);

const StatusBadge = ({ status }: { status: TradeStatus }) => {
  const m = STATUS_META[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 800, background: m.bg, color: m.color, border: `1px solid ${m.border}`, whiteSpace: "nowrap" }}>
      {m.icon} {m.label}
    </span>
  );
};

function EmptyState({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", background: "rgba(255,255,255,0.015)", border: "1px dashed rgba(255,255,255,0.07)", borderRadius: 20 }}>
      <div style={{ fontSize: "3rem", marginBottom: 14, opacity: 0.5 }}>{icon}</div>
      <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#f1f5f9", margin: "0 0 8px" }}>{title}</h3>
      <p style={{ color: "#475569", fontSize: 14, maxWidth: 320, margin: "0 auto" }}>{desc}</p>
    </div>
  );
}

// ─── Meeting Section ─────────────────────────────────────────────────────────

interface MeetingSectionProps {
  trade: Trade;
  meId: string;
  onProposeMeeting: (tradeId: string, place: string, time: string) => Promise<void>;
  onAcceptMeeting:  (tradeId: string) => Promise<void>;
  onRejectMeeting:  (tradeId: string) => Promise<void>;
  processingId: string | null;
}

function MeetingSection({ trade, meId, onProposeMeeting, onAcceptMeeting, onRejectMeeting, processingId }: MeetingSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [proposePlace, setProposePlace] = useState("");
  const [proposeTime, setProposeTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const d = trade.meetingDetails;
  const isProc = processingId === trade._id;

  const iAmProposer   = d?.proposedBy === meId;
  const iHaveAccepted = d?.acceptedBy?.includes(meId) ?? false;
  const isConfirmed   = d?.status === "accepted";
  const isPending     = d?.status === "pending";
  const isRejected    = d?.status === "rejected";
  const hasProposal   = !!d && !!d.place;

  const otherUser = trade.requesterId._id === meId ? trade.ownerId : trade.requesterId;

  const openForm = (counter = false) => {
    if (counter && d) {
      setProposePlace(d.place);
      setProposeTime(d.time);
    } else {
      setProposePlace("");
      setProposeTime("");
    }
    setFormError("");
    setShowForm(true);
  };

  const submitProposal = async () => {
    if (!proposePlace.trim() || !proposeTime.trim()) {
      setFormError("Both place and time are required.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      await onProposeMeeting(trade._id, proposePlace, proposeTime);
      setShowForm(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to propose meeting");
    } finally { setSubmitting(false); }
  };

  // ── Case A: Meeting mutually confirmed ───────────────────────────────────
  if (isConfirmed && hasProposal) {
    return (
      <div className="meeting-slide" style={{ marginTop: 16, padding: "16px 18px", background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: "1.2rem" }}>✅</span>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "#10b981" }}>Meeting Confirmed by Both Parties</p>
        </div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, color: "#64748b" }}>📌 <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{d!.place}</span></span>
          <span style={{ fontSize: 13, color: "#64748b" }}>🕐 <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{d!.time}</span></span>
        </div>
      </div>
    );
  }

  // ── Case B: Pending proposal ──────────────────────────────────────────────
  if (isPending && hasProposal) {
    return (
      <div className="meeting-slide" style={{ marginTop: 16, padding: "16px 18px", background: "rgba(129,140,248,0.06)", border: "1px solid rgba(129,140,248,0.2)", borderRadius: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "1rem" }}>📍</span>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Meeting Proposal</p>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: "rgba(129,140,248,0.12)", color: "#a5b4fc" }}>
            {iAmProposer ? "Proposed by You" : `Proposed by ${d!.proposedBy === trade.requesterId._id ? trade.requesterId.name : trade.ownerId.name}`}
          </span>
        </div>

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 14 }}>
          <span style={{ fontSize: 13, color: "#64748b" }}>📌 <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{d!.place}</span></span>
          <span style={{ fontSize: 13, color: "#64748b" }}>🕐 <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{d!.time}</span></span>
        </div>

        {iAmProposer ? (
          // I proposed — waiting
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: 10 }}>
            <Spinner size={13} />
            <p style={{ margin: 0, fontSize: 12, color: "#64748b", fontWeight: 600 }}>Waiting for {otherUser.name} to respond…</p>
          </div>
        ) : (
          // Other proposed — I need to respond
          !showForm && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="action-btn" disabled={isProc || iHaveAccepted} onClick={() => onAcceptMeeting(trade._id)} style={{ padding: "8px 18px", borderRadius: 10, background: iHaveAccepted ? "rgba(16,185,129,0.06)" : "rgba(52,211,153,0.15)", border: `1px solid ${iHaveAccepted ? "rgba(16,185,129,0.15)" : "rgba(52,211,153,0.3)"}`, color: iHaveAccepted ? "#334155" : "#34d399", fontWeight: 700, fontSize: 13, cursor: isProc || iHaveAccepted ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
                {isProc ? <Spinner size={13} /> : "✓"} {iHaveAccepted ? "Accepted" : "Accept"}
              </button>
              <button className="action-btn" disabled={isProc} onClick={() => onRejectMeeting(trade._id)} style={{ padding: "8px 18px", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444", fontWeight: 700, fontSize: 13, cursor: isProc ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
                {isProc ? <Spinner size={13} /> : "✕"} Reject
              </button>
              <button className="action-btn" disabled={isProc} onClick={() => openForm(true)} style={{ padding: "8px 18px", borderRadius: 10, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", color: "#f59e0b", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                🔁 Counter Propose
              </button>
            </div>
          )
        )}

        {/* Counter / New proposal form */}
        {showForm && (
          <div style={{ marginTop: 14, animation: "slideDown 0.25s ease" }}>
            <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 800, color: "#f59e0b" }}>
              {iAmProposer ? "📝 Update Your Proposal" : "🔁 Counter Proposal"}
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
              <input value={proposePlace} onChange={(e) => setProposePlace(e.target.value)} placeholder="Meeting place" style={inputStyle} />
              <input value={proposeTime} onChange={(e) => setProposeTime(e.target.value)} placeholder="Date & time (e.g. Tomorrow 5 PM)" style={inputStyle} />
            </div>
            {formError && <p style={{ margin: "0 0 8px", fontSize: 12, color: "#ef4444", fontWeight: 600 }}>⚠️ {formError}</p>}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowForm(false)} style={{ ...cancelBtnStyle }}>Cancel</button>
              <button onClick={submitProposal} disabled={submitting} style={{ ...submitBtnStyle }}>
                {submitting ? <><Spinner size={13} /> Sending…</> : "Send Proposal"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Case C: Rejected or no proposal — anyone can propose ─────────────────
  return (
    <div className="meeting-slide" style={{ marginTop: 16 }}>
      {isRejected && hasProposal && (
        <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <span>❌</span>
          <p style={{ margin: 0, fontSize: 12, color: "#ef4444", fontWeight: 700 }}>
            Proposal rejected — either party can suggest a new meeting time.
          </p>
        </div>
      )}

      {!showForm ? (
        <button className="action-btn" onClick={() => openForm(false)} style={{ padding: "9px 20px", borderRadius: 10, background: "rgba(129,140,248,0.15)", border: "1px solid rgba(129,140,248,0.3)", color: "#818cf8", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
          📍 {hasProposal ? "Propose a New Meeting Time" : "Propose Meeting"}
        </button>
      ) : (
        <div style={{ padding: "16px 18px", background: "rgba(129,140,248,0.06)", border: "1px solid rgba(129,140,248,0.2)", borderRadius: 14, animation: "slideDown 0.25s ease" }}>
          <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 800, color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.1em" }}>📍 Propose Exchange Meeting</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
            <input value={proposePlace} onChange={(e) => setProposePlace(e.target.value)} placeholder="Meeting place (e.g. Library entrance)" style={inputStyle} />
            <input value={proposeTime} onChange={(e) => setProposeTime(e.target.value)} placeholder="Date & time (e.g. Tomorrow 5 PM)" style={inputStyle} />
          </div>
          {formError && <p style={{ margin: "0 0 8px", fontSize: 12, color: "#ef4444", fontWeight: 600 }}>⚠️ {formError}</p>}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setShowForm(false)} style={{ ...cancelBtnStyle }}>Cancel</button>
            <button onClick={submitProposal} disabled={submitting} style={{ ...submitBtnStyle }}>
              {submitting ? <><Spinner size={13} /> Sending…</> : "Send Proposal"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Shared inline styles for form inputs/buttons
const inputStyle: React.CSSProperties = {
  flex: 1, minWidth: 160, padding: "10px 14px",
  background: "#0a0a0a", border: "1px solid #2a2a2a",
  borderRadius: 10, color: "#f8fafc", fontSize: 13,
  outline: "none", fontFamily: "inherit",
};
const cancelBtnStyle: React.CSSProperties = {
  padding: "9px 18px", borderRadius: 10,
  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
  color: "#64748b", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
};
const submitBtnStyle: React.CSSProperties = {
  padding: "9px 22px", borderRadius: 10,
  background: "linear-gradient(135deg,#818cf8,#6366f1)",
  color: "#fff", fontWeight: 800, fontSize: 13,
  border: "none", cursor: "pointer", fontFamily: "inherit",
  display: "flex", alignItems: "center", gap: 6,
};

// ─── Trade Card ───────────────────────────────────────────────────────────────

interface TradeCardProps {
  trade: Trade;
  meId: string;
  idx: number;
  onRespond?: (tradeId: string, action: "accept" | "reject") => Promise<void>;
  onProposeMeeting: (tradeId: string, place: string, time: string) => Promise<void>;
  onAcceptMeeting:  (tradeId: string) => Promise<void>;
  onRejectMeeting:  (tradeId: string) => Promise<void>;
  onComplete: (tradeId: string) => Promise<void>;
  processingId: string | null;
}

function TradeCard({ trade, meId, idx, onRespond, onProposeMeeting, onAcceptMeeting, onRejectMeeting, onComplete, processingId }: TradeCardProps) {
  const isProc = processingId === trade._id;
  const requested = trade.requestedProductId as PopulatedProduct;
  const offered   = trade.offeredProductIds  as PopulatedProduct[];
  const viewAs    = trade.requesterId._id === meId ? "requester" : "owner";

  const meetingConfirmed = trade.meetingDetails?.status === "accepted";
  const showMeetingSection = trade.status === "accepted" || trade.status === "scheduled";

  return (
    <div className="fade-up" style={{ animationDelay: `${idx * 0.04}s`, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 18, padding: "20px 22px" }}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {/* Left: items summary */}
        <div style={{ flex: 1, minWidth: 260 }}>
          {/* Status row */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            <StatusBadge status={trade.status} />
            <span style={{ fontSize: 11, color: "#334155" }}>•</span>
            <span style={{ fontSize: 12, color: "#64748b" }}>
              {viewAs === "owner" ? `from ${trade.requesterId?.name}` : `to ${trade.ownerId?.name}`}
            </span>
            <span style={{ fontSize: 11, color: "#334155" }}>•</span>
            <span style={{ fontSize: 11, color: "#334155" }}>{new Date(trade.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
          </div>

          {/* Item exchange row */}
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {viewAs === "owner" ? "They Offer" : "You Offered"}
              </p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                {offered.map((p) => (
                  <div key={p._id} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "5px 9px" }}>
                    <ProductThumb product={p} size={28} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#cbd5e1", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</span>
                  </div>
                ))}
                {trade.cashOffered > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 8, padding: "5px 10px" }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: "#f59e0b" }}>+ ₹{trade.cashOffered.toLocaleString("en-IN")}</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ color: "#334155", fontSize: "1.2rem", paddingTop: 22, flexShrink: 0 }}>⇄</div>

            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {viewAs === "owner" ? "They Want" : "You Want"}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "5px 9px" }}>
                <ProductThumb product={requested} size={28} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#cbd5e1", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{requested?.title}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: trade-level actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, justifyContent: "center", alignItems: "flex-end", minWidth: 160 }}>
          {/* Owner: accept / reject pending trade */}
          {viewAs === "owner" && trade.status === "pending" && onRespond && (
            <>
              <button className="action-btn" disabled={isProc} onClick={() => onRespond(trade._id, "accept")} style={{ padding: "9px 20px", borderRadius: 10, background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.3)", color: "#34d399", fontWeight: 700, fontSize: 13, cursor: isProc ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
                {isProc ? <Spinner /> : "✓"} Accept Trade
              </button>
              <button className="action-btn" disabled={isProc} onClick={() => onRespond(trade._id, "reject")} style={{ padding: "9px 20px", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444", fontWeight: 700, fontSize: 13, cursor: isProc ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
                {isProc ? <Spinner /> : "✕"} Reject Trade
              </button>
            </>
          )}

          {/* Mark complete — only after meeting confirmed */}
          {trade.status === "scheduled" && meetingConfirmed && (
            <button className="action-btn" disabled={isProc} onClick={() => onComplete(trade._id)} style={{ padding: "9px 20px", borderRadius: 10, background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981", fontWeight: 700, fontSize: 13, cursor: isProc ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
              {isProc ? <Spinner /> : "✅"} Mark Complete
            </button>
          )}

          {/* Waiting pill */}
          {trade.status === "pending" && viewAs === "requester" && (
            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600, textAlign: "right" }}>⏳ Waiting for owner&apos;s response</span>
          )}
          {trade.status === "completed" && (
            <span style={{ fontSize: 12, color: "#10b981", fontWeight: 700 }}>✅ Exchange Done</span>
          )}
          {trade.status === "rejected" && (
            <span style={{ fontSize: 12, color: "#ef4444", fontWeight: 700 }}>❌ Declined</span>
          )}
        </div>
      </div>

      {/* Meeting negotiation section */}
      {showMeetingSection && (
        <MeetingSection
          trade={trade}
          meId={meId}
          onProposeMeeting={onProposeMeeting}
          onAcceptMeeting={onAcceptMeeting}
          onRejectMeeting={onRejectMeeting}
          processingId={processingId}
        />
      )}
    </div>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────────

export default function TradeClient() {
  const [section, setSection] = useState<"browse" | "sent" | "received" | "completed">("browse");
  const [tradeableProducts, setTradeableProducts] = useState<TradeableProduct[]>([]);
  const [myTrades, setMyTrades] = useState<Trade[]>([]);
  const [myProducts, setMyProducts] = useState<MyProduct[]>([]);
  const [meId, setMeId] = useState<string>("");
  const [browsePage, setBrowsePage] = useState(0);
  const BROWSE_PER_PAGE = 9;

  // Propose modal
  const [proposeTarget, setProposeTarget] = useState<TradeableProduct | null>(null);
  const [selectedOfferIds, setSelectedOfferIds] = useState<string[]>([]);
  const [cashOffered, setCashOffered] = useState<string>("0");
  const [proposing, setProposing] = useState(false);
  const [proposeError, setProposeError] = useState("");

  const [loadingTrades, setLoadingTrades] = useState(true);
  const [loadingBrowse, setLoadingBrowse] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetchers ─────────────────────────────────────────────────────────────

  const fetchTradeable = useCallback(async () => {
    setLoadingBrowse(true);
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const all = await res.json();
        setTradeableProducts((all as TradeableProduct[]).filter((p) => p.isTradeEnabled));
      }
    } catch { /* ignore */ }
    finally { setLoadingBrowse(false); }
  }, []);

  const fetchMyTrades = useCallback(async () => {
    setLoadingTrades(true);
    try {
      const res = await fetch("/api/trade");
      if (res.ok) setMyTrades(await res.json());
      else if (res.status === 401) setMyTrades([]);
    } catch { /* ignore */ }
    finally { setLoadingTrades(false); }
  }, []);

  const fetchMyProducts = useCallback(async () => {
    try {
      const [prodRes, sessionRes] = await Promise.all([
        fetch("/api/trade/my-products"),
        fetch("/api/auth/session"),
      ]);
      if (prodRes.ok) setMyProducts(await prodRes.json());
      if (sessionRes.ok) {
        const s = await sessionRes.json();
        if (s?.user?.id) setMeId(s.user.id);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchTradeable();
    fetchMyTrades();
    fetchMyProducts();
  }, [fetchTradeable, fetchMyTrades, fetchMyProducts]);

  // ── Trade proposal ────────────────────────────────────────────────────────

  const handlePropose = async () => {
    if (!proposeTarget) return;
    if (selectedOfferIds.length === 0) { setProposeError("Select at least one product to offer."); return; }
    setProposeError("");
    setProposing(true);
    try {
      const res = await fetch("/api/trade/create", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestedProductId: proposeTarget._id, offeredProductIds: selectedOfferIds, cashOffered: Number(cashOffered) || 0 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send trade offer");
      showToast("🔁 Trade offer sent!");
      setProposeTarget(null); setSelectedOfferIds([]); setCashOffered("0");
      fetchMyTrades();
    } catch (err: unknown) { setProposeError(err instanceof Error ? err.message : "Error"); }
    finally { setProposing(false); }
  };

  // ── Trade accept/reject ───────────────────────────────────────────────────

  const handleRespond = async (tradeId: string, action: "accept" | "reject") => {
    setProcessingId(tradeId);
    try {
      const res = await fetch("/api/trade/respond", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tradeId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(action === "accept" ? "🎉 Trade accepted!" : "❌ Trade rejected");
      fetchMyTrades();
    } catch (err: unknown) { showToast("❌ " + (err instanceof Error ? err.message : "Error")); }
    finally { setProcessingId(null); }
  };

  // ── Meeting actions ───────────────────────────────────────────────────────

  const handleProposeMeeting = async (tradeId: string, place: string, time: string) => {
    const res = await fetch("/api/trade/propose-meeting", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tradeId, place, time }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to propose meeting");
    showToast("📍 Meeting proposal sent!");
    fetchMyTrades();
  };

  const handleAcceptMeeting = async (tradeId: string) => {
    setProcessingId(tradeId);
    try {
      const res = await fetch("/api/trade/accept-meeting", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tradeId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(data.mutuallyAccepted ? "✅ Meeting confirmed by both parties!" : "✓ You accepted the meeting proposal");
      fetchMyTrades();
    } catch (err: unknown) { showToast("❌ " + (err instanceof Error ? err.message : "Error")); }
    finally { setProcessingId(null); }
  };

  const handleRejectMeeting = async (tradeId: string) => {
    setProcessingId(tradeId);
    try {
      const res = await fetch("/api/trade/reject-meeting", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tradeId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast("❌ Proposal rejected — either party can suggest a new time");
      fetchMyTrades();
    } catch (err: unknown) { showToast("❌ " + (err instanceof Error ? err.message : "Error")); }
    finally { setProcessingId(null); }
  };

  // ── Complete trade ────────────────────────────────────────────────────────

  const handleComplete = async (tradeId: string) => {
    if (!confirm("Mark this trade as completed? Both listings will be closed.")) return;
    setProcessingId(tradeId);
    try {
      const res = await fetch("/api/trade/complete", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tradeId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast("✅ Trade completed!");
      fetchMyTrades(); fetchTradeable();
    } catch (err: unknown) { showToast("❌ " + (err instanceof Error ? err.message : "Error")); }
    finally { setProcessingId(null); }
  };

  // ── Derived lists ─────────────────────────────────────────────────────────

  const sentTrades      = myTrades.filter((t) => t.requesterId?._id === meId);
  const receivedTrades  = myTrades.filter((t) => t.ownerId?._id === meId);
  const completedTrades = myTrades.filter((t) => t.status === "completed");
  const activeTrades    = myTrades.filter((t) => ["accepted", "scheduled"].includes(t.status));

  const filteredBrowse = tradeableProducts.filter((p) => p.sellerId?._id !== meId);
  const browseSlice    = filteredBrowse.slice(browsePage * BROWSE_PER_PAGE, (browsePage + 1) * BROWSE_PER_PAGE);

  // ── Shared card props helper ──────────────────────────────────────────────
  const cardProps = (trade: Trade, extra?: Partial<TradeCardProps>) => ({
    trade, meId, processingId,
    onProposeMeeting: handleProposeMeeting,
    onAcceptMeeting:  handleAcceptMeeting,
    onRejectMeeting:  handleRejectMeeting,
    onComplete:       handleComplete,
    ...extra,
  });

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <>
      <style>{globalStyles}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, background: "#1a1a1a", border: "1px solid #333", borderRadius: 14, padding: "12px 20px", color: "#f1f5f9", fontSize: 14, fontWeight: 600, animation: "fadeUp 0.3s ease", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
          {toast}
        </div>
      )}

      {/* Propose Modal */}
      {proposeTarget && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 22, padding: 32, maxWidth: 520, width: "100%", animation: "scaleIn 0.25s ease", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 24 }}>
              <ProductThumb product={proposeTarget} size={64} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em" }}>Proposing trade for</p>
                <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#f1f5f9", lineHeight: 1.3 }}>{proposeTarget.title}</h2>
                {proposeTarget.tradePreferences && proposeTarget.tradePreferences.length > 0 && (
                  <p style={{ margin: "6px 0 0", fontSize: 12, color: "#64748b" }}>Looking for: <span style={{ color: "#f59e0b" }}>{proposeTarget.tradePreferences.join(", ")}</span></p>
                )}
              </div>
              <button onClick={() => { setProposeTarget(null); setProposeError(""); }} style={{ background: "none", border: "1px solid #2a2a2a", color: "#64748b", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>×</button>
            </div>

            <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em" }}>Your Products to Offer <span style={{ color: "#ef4444" }}>*</span></p>
            {myProducts.length === 0 ? (
              <div style={{ padding: 20, background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: 12, textAlign: "center", marginBottom: 20 }}>
                <p style={{ color: "#475569", fontSize: 13, margin: 0 }}>You have no active products to offer.</p>
                <Link href="/seller/add-product" style={{ display: "inline-block", marginTop: 10, color: "#f59e0b", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>+ Add a product</Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20, maxHeight: 240, overflowY: "auto", paddingRight: 4 }}>
                {myProducts.map((p) => {
                  const selected = selectedOfferIds.includes(p._id);
                  return (
                    <label key={p._id} className="product-check" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 12, border: `1px solid ${selected ? "rgba(245,158,11,0.5)" : "rgba(255,255,255,0.07)"}`, background: selected ? "rgba(245,158,11,0.06)" : "rgba(255,255,255,0.02)", cursor: "pointer", transition: "border-color 0.15s, background 0.15s" }}>
                      <input type="checkbox" checked={selected} onChange={() => setSelectedOfferIds((prev) => selected ? prev.filter((id) => id !== p._id) : [...prev, p._id])} style={{ display: "none" }} />
                      <ProductThumb product={p} size={44} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</p>
                        {p.expectedPrice && <p style={{ margin: 0, fontSize: 12, color: "#f59e0b", fontWeight: 700 }}>₹{p.expectedPrice.toLocaleString("en-IN")}</p>}
                      </div>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${selected ? "#f59e0b" : "rgba(255,255,255,0.2)"}`, background: selected ? "#f59e0b" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {selected && <span style={{ fontSize: 10, color: "#000", fontWeight: 900 }}>✓</span>}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em" }}>Cash Top-up (₹) — optional</label>
              <div style={{ display: "flex", alignItems: "center", background: "#0a0a0a", border: "1px solid #2a2a2a", borderRadius: 10, padding: "0 14px" }}>
                <span style={{ color: "#64748b", fontWeight: 700, marginRight: 6 }}>₹</span>
                <input type="number" min={0} value={cashOffered} onChange={(e) => setCashOffered(e.target.value)} style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#f8fafc", fontSize: 15, fontWeight: 700, padding: "12px 0", fontFamily: "inherit" }} placeholder="0" />
              </div>
            </div>

            {proposeError && <p style={{ color: "#ef4444", fontSize: 13, fontWeight: 600, margin: "0 0 14px" }}>⚠️ {proposeError}</p>}

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { setProposeTarget(null); setProposeError(""); }} style={{ flex: 1, padding: "12px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#64748b", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              <button className="action-btn" onClick={handlePropose} disabled={proposing} style={{ flex: 2, padding: "12px", borderRadius: 12, background: selectedOfferIds.length > 0 && !proposing ? "linear-gradient(135deg,#f59e0b,#d97706)" : "rgba(255,255,255,0.05)", color: selectedOfferIds.length > 0 ? "#000" : "#334155", fontWeight: 800, fontSize: 14, border: "none", cursor: proposing ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {proposing ? <><Spinner /> Sending…</> : "🔁 Send Trade Offer"}
              </button>
            </div>
          </div>
        </div>
      )}

      <main style={{ flex: 1, maxWidth: 1200, margin: "0 auto", width: "100%", padding: "40px 20px" }}>
        {/* Back Button */}
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#94a3b8', textDecoration: 'none', marginBottom: '24px', fontSize: '0.9rem', fontWeight: 600, transition: 'color 0.2s' }}>
          ← Back
        </Link>
        {/* Hero */}
        <div className="fade-up" style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem" }}>🔁</div>
            <div>
              <h1 style={{ margin: 0, fontSize: "clamp(1.8rem,4vw,2.5rem)", fontWeight: 900, letterSpacing: "-0.02em", background: "linear-gradient(135deg,#fff 60%,#94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Campus Trading Hub</h1>
              <p style={{ margin: 0, fontSize: 14, color: "#475569" }}>Exchange items directly — propose, negotiate, and confirm meetings</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 36 }}>
          {[
            { label: "Available", value: filteredBrowse.length, icon: "🛒", color: "#f59e0b" },
            { label: "Sent",      value: sentTrades.length,     icon: "📤", color: "#818cf8" },
            { label: "Received",  value: receivedTrades.length, icon: "📥", color: "#34d399" },
            { label: "Completed", value: completedTrades.length,icon: "✅", color: "#10b981" },
          ].map((s) => (
            <div key={s.label} style={{ background: "#121212", border: "1px solid #1f1f1f", borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: s.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>{s.icon}</div>
              <div>
                <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 900, color: "#f8fafc", lineHeight: 1 }}>{s.value}</p>
                <p style={{ margin: 0, fontSize: 11, color: "#64748b", fontWeight: 600 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Active trades alert */}
        {activeTrades.length > 0 && (
          <div className="fade-up" style={{ background: "rgba(129,140,248,0.06)", border: "1px solid rgba(129,140,248,0.2)", borderRadius: 16, padding: "14px 20px", marginBottom: 28, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: "1.1rem" }}>📍</span>
            <p style={{ margin: 0, fontSize: 13, color: "#818cf8", fontWeight: 700 }}>
              You have {activeTrades.length} active trade{activeTrades.length > 1 ? "s" : ""} — coordinate meeting times in the Sent / Received tabs.
            </p>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
          {(["browse", "sent", "received", "completed"] as const).map((tab) => {
            const labels = { browse: "🛒 Browse Items", sent: `📤 Sent (${sentTrades.length})`, received: `📥 Received (${receivedTrades.length})`, completed: `✅ Completed (${completedTrades.length})` };
            return (
              <button key={tab} onClick={() => setSection(tab)} style={{ padding: "10px 20px", borderRadius: 999, border: section === tab ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(255,255,255,0.07)", background: section === tab ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.02)", color: section === tab ? "#f59e0b" : "#64748b", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", whiteSpace: "nowrap" }}>
                {labels[tab]}
              </button>
            );
          })}
        </div>

        {/* ── BROWSE ── */}
        {section === "browse" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#f1f5f9" }}>🔁 Items Available for Trade</h2>
              <Link href="/seller/add-product" style={{ fontSize: 13, fontWeight: 700, color: "#f59e0b", textDecoration: "none", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", padding: "8px 16px", borderRadius: 10 }}>
                + Enable Trade on My Items
              </Link>
            </div>
            {loadingBrowse ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="shimmer-box" style={{ height: 200, borderRadius: 18 }} />)}
              </div>
            ) : browseSlice.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", background: "rgba(255,255,255,0.015)", border: "1px dashed rgba(255,255,255,0.07)", borderRadius: 20 }}>
                <div style={{ fontSize: "3.5rem", marginBottom: 16, opacity: 0.5 }}>🔁</div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#f1f5f9", margin: "0 0 8px" }}>No items listed for trade yet</h3>
                <p style={{ color: "#475569", fontSize: 14, maxWidth: 320, margin: "0 auto 24px" }}>Be the first! Enable trade on your listings from the seller dashboard.</p>
                <Link href="/seller/add-product" style={{ display: "inline-block", padding: "12px 24px", background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#000", fontWeight: 800, borderRadius: 12, textDecoration: "none", fontSize: 14 }}>+ Add Tradeable Item</Link>
              </div>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                  {browseSlice.map((p, idx) => (
                    <div key={p._id} className="trade-card fade-up" style={{ animationDelay: `${idx * 0.04}s`, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 18, overflow: "hidden" }}>
                      <div style={{ width: "100%", aspectRatio: "16/10", overflow: "hidden", background: "#0d0d0d", position: "relative" }}>
                        {p.image?.url
                          ? <img src={p.image.url} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem", opacity: 0.3 }}>📦</div>
                        }
                        <span style={{ position: "absolute", top: 10, left: 10, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", padding: "3px 8px", borderRadius: 6, background: "rgba(245,158,11,0.25)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.3)" }}>🔁 Trade</span>
                      </div>
                      <div style={{ padding: "16px" }}>
                        <h3 style={{ margin: "0 0 6px", fontSize: "0.95rem", fontWeight: 800, color: "#f1f5f9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</h3>
                        <p style={{ margin: "0 0 4px", fontSize: 12, color: "#64748b" }}>Owner: <span style={{ color: "#94a3b8", fontWeight: 600 }}>{p.sellerId?.name || "Campus User"}</span></p>
                        {p.expectedPrice && <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 800, color: "#f59e0b" }}>₹{p.expectedPrice.toLocaleString("en-IN")} value</p>}
                        {p.tradePreferences && p.tradePreferences.length > 0 && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
                            <span style={{ fontSize: 11, color: "#64748b" }}>Wants:</span>
                            {p.tradePreferences.map((pref) => (
                              <span key={pref} style={{ fontSize: 11, fontWeight: 700, color: "#fbbf24", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", padding: "1px 7px", borderRadius: 5 }}>{pref}</span>
                            ))}
                          </div>
                        )}
                        <button className="action-btn" onClick={() => { if (!meId) { showToast("Please sign in to propose a trade"); return; } setProposeTarget(p); setProposeError(""); setSelectedOfferIds([]); setCashOffered("0"); }} style={{ width: "100%", padding: "10px 0", borderRadius: 10, background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#000", fontWeight: 800, fontSize: 13, border: "none", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                          🤝 Propose Trade
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {filteredBrowse.length > BROWSE_PER_PAGE && (
                  <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 28 }}>
                    <button onClick={() => setBrowsePage((p) => Math.max(0, p - 1))} disabled={browsePage === 0} style={{ padding: "8px 20px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: browsePage === 0 ? "#334155" : "#94a3b8", fontSize: 13, fontWeight: 700, cursor: browsePage === 0 ? "not-allowed" : "pointer", fontFamily: "inherit" }}>← Prev</button>
                    <button onClick={() => setBrowsePage((p) => p + 1)} disabled={(browsePage + 1) * BROWSE_PER_PAGE >= filteredBrowse.length} style={{ padding: "8px 20px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Next →</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── SENT ── */}
        {section === "sent" && (
          <div>
            <h2 style={{ margin: "0 0 20px", fontSize: "1.1rem", fontWeight: 800, color: "#f1f5f9" }}>📤 Trade Requests You Sent</h2>
            {loadingTrades
              ? [1, 2].map((i) => <div key={i} className="shimmer-box" style={{ height: 120, borderRadius: 16, marginBottom: 12 }} />)
              : sentTrades.length === 0
                ? <EmptyState icon="📤" title="No outgoing trade requests" desc="Browse items and propose a trade!" />
                : <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {sentTrades.map((t, idx) => (
                      <TradeCard key={t._id} idx={idx} {...cardProps(t)} />
                    ))}
                  </div>
            }
          </div>
        )}

        {/* ── RECEIVED ── */}
        {section === "received" && (
          <div>
            <h2 style={{ margin: "0 0 20px", fontSize: "1.1rem", fontWeight: 800, color: "#f1f5f9" }}>📥 Trade Requests For You</h2>
            {loadingTrades
              ? [1, 2].map((i) => <div key={i} className="shimmer-box" style={{ height: 120, borderRadius: 16, marginBottom: 12 }} />)
              : receivedTrades.length === 0
                ? <EmptyState icon="📥" title="No incoming trade requests" desc="When someone proposes a trade on your items, it appears here." />
                : <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {receivedTrades.map((t, idx) => (
                      <TradeCard key={t._id} idx={idx} {...cardProps(t, { onRespond: handleRespond })} />
                    ))}
                  </div>
            }
          </div>
        )}

        {/* ── COMPLETED ── */}
        {section === "completed" && (
          <div>
            <h2 style={{ margin: "0 0 20px", fontSize: "1.1rem", fontWeight: 800, color: "#f1f5f9" }}>✅ Completed Trades</h2>
            {loadingTrades
              ? [1, 2].map((i) => <div key={i} className="shimmer-box" style={{ height: 100, borderRadius: 16, marginBottom: 12 }} />)
              : completedTrades.length === 0
                ? <EmptyState icon="✅" title="No completed trades yet" desc="Once a trade is marked complete, it appears here." />
                : <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {completedTrades.map((t, idx) => (
                      <TradeCard key={t._id} idx={idx} {...cardProps(t)} />
                    ))}
                  </div>
            }
          </div>
        )}
      </main>
    </>
  );
}
