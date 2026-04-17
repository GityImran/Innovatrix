/**
 * app/search/page.tsx
 * Campus Search Page — domain-filtered unified sell + rent results.
 * Users only see items from their own college email domain.
 */

"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

/* ── Types ── */
interface SearchResult {
  id: string;
  title: string;
  category: string;
  price: number;
  priceType: "total" | "per_day";
  type: "sell" | "rent";
  image: string | null;
  sellerEmail: string;
  isUrgent: boolean;
  createdAt: string;
}

/* ── Debounce hook — prevents API calls on every keystroke ── */
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true); // true on mount → loads campus items immediately
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 500);

  /* ── Fetch whenever debounced query changes ── */
  useEffect(() => {
    let cancelled = false;

    async function fetchResults() {
      setLoading(true);
      setError(null);

      try {
        const url = debouncedQuery
          ? `/api/search?q=${encodeURIComponent(debouncedQuery)}`
          : `/api/search`;

        const res = await fetch(url);

        if (cancelled) return;

        if (res.status === 401) {
          setError("Please sign in to search campus listings.");
          setResults([]);
          return;
        }
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Search failed. Please try again.");
        }

        const data: SearchResult[] = await res.json();
        if (!cancelled) setResults(data);
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message);
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setHasSearched(true);
        }
      }
    }

    fetchResults();
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  /* ── Auto-focus input on mount ── */
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleClear = useCallback(() => {
    setQuery("");
    inputRef.current?.focus();
  }, []);

  /* ── Render helpers ── */
  const sellCount = results.filter((r) => r.type === "sell").length;
  const rentCount = results.filter((r) => r.type === "rent").length;

  return (
    <div style={s.page}>
      {/* ── Header ── */}
      <div style={s.pageHeader}>
        <h1 style={s.title}>🔍 Campus Search</h1>
        <p style={s.subtitle}>Items from students in your college only</p>
      </div>

      {/* ── Search Input ── */}
      <div style={s.searchWrap}>
        <div style={s.searchBox}>
          <span style={s.searchIcon}>🔍</span>
          <input
            ref={inputRef}
            id="campus-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search books, electronics, furniture…"
            style={s.input}
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button
              id="campus-search-clear"
              onClick={handleClear}
              style={s.clearBtn}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status line */}
        <div style={s.statusLine}>
          {loading && <span style={s.statusText}>⏳ Searching your campus…</span>}
          {!loading && !error && hasSearched && results.length > 0 && (
            <span style={s.statusText}>
              {results.length} result{results.length !== 1 ? "s" : ""} —{" "}
              {sellCount > 0 && `${sellCount} for sale`}
              {sellCount > 0 && rentCount > 0 && ", "}
              {rentCount > 0 && `${rentCount} for rent`}
            </span>
          )}
        </div>
      </div>

      {/* ── Error State ── */}
      {error && (
        <div style={s.errorBox}>
          <span style={{ fontSize: "1.4rem" }}>⚠️</span>
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && !error && hasSearched && results.length === 0 && (
        <div style={s.emptyState}>
          <div style={{ fontSize: "3.5rem", marginBottom: "0.75rem" }}>📭</div>
          <p style={s.emptyTitle}>No items found in your campus</p>
          <p style={s.emptyDesc}>
            {query
              ? `No results for "${query}". Try a different keyword.`
              : "Be the first to list something on your campus!"}
          </p>
        </div>
      )}

      {/* ── Results Grid ── */}
      {!loading && results.length > 0 && (
        <div style={s.grid}>
          {results.map((item) => (
            <ResultCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* ── Loading Skeleton ── */}
      {loading && (
        <div style={s.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={s.skeleton} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Result Card ── */
function ResultCard({ item }: { item: SearchResult }) {
  const isSell = item.type === "sell";

  return (
    <div style={s.card}>
      {/* Image area */}
      <div style={s.imgWrap}>
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image} alt={item.title} style={s.img} />
        ) : (
          <div style={s.imgPlaceholder}>
            <span style={{ fontSize: "2.5rem" }}>{isSell ? "📦" : "🔄"}</span>
          </div>
        )}

        {/* Overlay badges */}
        <div style={s.badgeRow}>
          <span
            style={{
              ...s.typeBadge,
              ...(isSell ? s.sellBadge : s.rentBadge),
            }}
          >
            {isSell ? "🏷️ Sell" : "🔄 Rent"}
          </span>
          {item.isUrgent && <span style={s.urgentBadge}>🔥 Urgent</span>}
        </div>
      </div>

      {/* Card body */}
      <div style={s.cardBody}>
        <span style={s.categoryChip}>{item.category}</span>
        <p style={s.cardTitle}>{item.title}</p>
        <p style={s.price}>
          ₹{item.price.toLocaleString("en-IN")}
          {item.priceType === "per_day" && (
            <span style={s.priceUnit}> / day</span>
          )}
        </p>
        <p style={s.sellerEmail} title={item.sellerEmail}>
          🎓 {item.sellerEmail}
        </p>
      </div>
    </div>
  );
}

/* ── Styles ── */
const s: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "2rem 1.5rem 4rem",
    fontFamily: "inherit",
    display: "flex",
    flexDirection: "column",
    gap: "1.75rem",
  },
  pageHeader: { textAlign: "center" },
  title: {
    fontSize: "2rem",
    fontWeight: 800,
    color: "#f8fafc",
    letterSpacing: "-0.02em",
    margin: 0,
  },
  subtitle: {
    color: "#64748b",
    fontSize: "0.88rem",
    marginTop: "0.4rem",
    marginBottom: 0,
  },
  searchWrap: {
    maxWidth: "640px",
    margin: "0 auto",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#111",
    border: "1.5px solid #2a2a2a",
    borderRadius: "14px",
    padding: "0 1rem",
    gap: "0.75rem",
  },
  searchIcon: { fontSize: "1.1rem", opacity: 0.45, flexShrink: 0 },
  input: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#f8fafc",
    fontSize: "1rem",
    padding: "0.9rem 0",
    fontFamily: "inherit",
  },
  clearBtn: {
    background: "none",
    border: "none",
    color: "#64748b",
    cursor: "pointer",
    fontSize: "0.85rem",
    padding: "0.25rem 0.35rem",
    lineHeight: 1,
    flexShrink: 0,
    borderRadius: "4px",
  },
  statusLine: { textAlign: "center", minHeight: "1.2rem" },
  statusText: { fontSize: "0.75rem", color: "#475569" },
  errorBox: {
    maxWidth: "520px",
    margin: "0 auto",
    backgroundColor: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.22)",
    borderRadius: "12px",
    padding: "1.25rem 1.5rem",
    color: "#f87171",
    display: "flex",
    gap: "0.75rem",
    alignItems: "center",
  },
  emptyState: {
    textAlign: "center",
    padding: "4rem 2rem",
    backgroundColor: "#111",
    border: "1px dashed #2a2a2a",
    borderRadius: "16px",
  },
  emptyTitle: {
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "#f8fafc",
    margin: "0 0 0.4rem",
  },
  emptyDesc: {
    color: "#64748b",
    fontSize: "0.85rem",
    maxWidth: "320px",
    margin: "0 auto",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: "1rem",
  },
  skeleton: {
    height: "260px",
    borderRadius: "14px",
    backgroundColor: "#111",
    border: "1px solid #1a1a1a",
    animation: "pulse 1.5s ease-in-out infinite",
  },
  card: {
    backgroundColor: "#111",
    border: "1px solid #1f1f1f",
    borderRadius: "14px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    transition: "border-color 0.2s",
  },
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
    alignItems: "center",
    justifyContent: "center",
    color: "#374151",
  },
  badgeRow: {
    position: "absolute",
    top: "8px",
    left: "8px",
    display: "flex",
    gap: "0.3rem",
    flexWrap: "wrap",
  },
  typeBadge: {
    fontSize: "0.6rem",
    fontWeight: 800,
    borderRadius: "5px",
    padding: "2px 7px",
    backdropFilter: "blur(4px)",
  },
  sellBadge: { backgroundColor: "rgba(245,158,11,0.9)", color: "#000" },
  rentBadge: { backgroundColor: "rgba(139,92,246,0.9)", color: "#fff" },
  urgentBadge: {
    fontSize: "0.6rem",
    fontWeight: 800,
    borderRadius: "5px",
    padding: "2px 7px",
    backdropFilter: "blur(4px)",
    backgroundColor: "rgba(239,68,68,0.9)",
    color: "#fff",
  },
  cardBody: {
    padding: "0.85rem 1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.28rem",
    flex: 1,
  },
  categoryChip: {
    fontSize: "0.63rem",
    fontWeight: 700,
    color: "#94a3b8",
    backgroundColor: "rgba(148,163,184,0.08)",
    border: "1px solid rgba(148,163,184,0.12)",
    borderRadius: "4px",
    padding: "1px 6px",
    alignSelf: "flex-start",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  cardTitle: {
    fontSize: "0.88rem",
    fontWeight: 700,
    color: "#f8fafc",
    margin: 0,
    lineHeight: 1.35,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  price: {
    fontSize: "1.1rem",
    fontWeight: 800,
    color: "#f59e0b",
    margin: 0,
    lineHeight: 1.2,
  },
  priceUnit: { fontSize: "0.72rem", fontWeight: 500, color: "#94a3b8" },
  sellerEmail: {
    fontSize: "0.66rem",
    color: "#4b5563",
    margin: "0.15rem 0 0",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
};
