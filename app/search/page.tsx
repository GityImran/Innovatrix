/**
 * app/search/page.tsx
 * Campus Search Page — domain-filtered unified sell + rent results.
 * Users only see items from their own college email domain.
 */

"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

/* ── Types ── */
interface SearchResult {
  id: string;
  title: string;
  category: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating?: number;
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
    <>
      <style dangerouslySetInnerHTML={{ __html: pageCSS }} />
      <div className="search-page-container">
        <Link href="/" className="back-button">
          ← Back to Home
        </Link>
        {/* ── Header ── */}
        <div className="search-header">
          <h1 className="search-title">🔍 Campus Search</h1>
          <p className="search-subtitle">Items from students in your college only</p>
        </div>

        {/* ── Search Input ── */}
        <div className="search-wrap">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              ref={inputRef}
              id="campus-search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search books, electronics, furniture…"
              className="search-input"
              autoComplete="off"
              spellCheck={false}
            />
            {query && (
              <button
                id="campus-search-clear"
                onClick={handleClear}
                className="clear-btn"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status line */}
          <div className="status-line">
            {loading && <span>⏳ Searching your campus…</span>}
            {!loading && !error && hasSearched && results.length > 0 && (
              <span>
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
          <div className="error-box">
            <span style={{ fontSize: "1.4rem" }}>⚠️</span>
            <p style={{ margin: 0 }}>{error}</p>
          </div>
        )}

        {/* ── Empty State ── */}
        {!loading && !error && hasSearched && results.length === 0 && (
          <div className="empty-state">
            <div style={{ fontSize: "3.5rem", marginBottom: "0.75rem" }}>📭</div>
            <p className="empty-title">No items found in your campus</p>
            <p className="empty-desc">
              {query
                ? `No results for "${query}". Try a different keyword.`
                : "Be the first to list something on your campus!"}
            </p>
          </div>
        )}

        {/* ── Results Grid ── */}
        {!loading && results.length > 0 && (
          <div className="product-grid">
            {results.map((item) => (
              <ResultCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* ── Loading Skeleton ── */}
        {loading && (
          <div className="product-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* ── Result Card ── */
function ResultCard({ item }: { item: SearchResult }) {
  const isSell = item.type === "sell";

  return (
    <Link href={`/product/${item.id}`} className="product-card">
      {/* ── Top-left Badges ── */}
      <div className="badge-container">
        <span className={`badge ${isSell ? "badge-sell" : "badge-rent"}`}>
          {isSell ? "Sell" : "Rent"}
        </span>
        {item.isUrgent && <span className="badge badge-urgent">Urgent</span>}
      </div>

      {/* ── Product Image ── */}
      <div className="img-wrap">
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image} alt={item.title} className="product-img" />
        ) : (
          <div className="img-placeholder">
            <span style={{ fontSize: "2.5rem" }}>{isSell ? "📦" : "🔄"}</span>
          </div>
        )}
      </div>

      {/* ── Card Body ── */}
      <div className="product-details">
        <span className="product-category">{item.category}</span>
        
        <h3 className="product-title" title={item.title}>{item.title}</h3>
        
        {item.rating && (
          <div className="product-rating">
            <span className="star">★</span> {item.rating.toFixed(1)}
          </div>
        )}
        
        <div className="price-container">
          <div className="price-row">
            <span className="current-price">
              ₹{item.price.toLocaleString("en-IN")}
              {item.priceType === "per_day" && <span className="price-unit">/day</span>}
            </span>
            {item.originalPrice && item.originalPrice > item.price && (
              <span className="original-price">
                ₹{item.originalPrice.toLocaleString("en-IN")}
              </span>
            )}
            {item.discount && item.discount > 0 ? (
              <span className="discount-tag">{item.discount}% off</span>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ── Modern Flipkart/Amazon Style CSS ── */
const pageCSS = `
.search-page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
  font-family: 'Inter', 'Roboto', sans-serif;
  color: #1a1a1a;
}

/* Header & Search styling updated for light/clean look while retaining structure */
.back-button {
  display: inline-flex;
  align-items: center;
  color: #9ca3af;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
  transition: color 0.2s ease;
  align-self: flex-start;
}
.back-button:hover {
  color: #f9fafb;
}

.search-header {
  text-align: center;
  margin-bottom: 2rem;
}
.search-title {
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #a78bfa, #c084fc, #f472b6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 4px 20px rgba(192, 132, 252, 0.2);
  margin: 0;
  letter-spacing: -0.02em;
}
.search-subtitle {
  color: #a1a1aa;
  font-size: 1.05rem;
  margin-top: 0.5rem;
  font-weight: 400;
}
.search-wrap {
  max-width: 680px;
  margin: 0 auto 3rem auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.search-box {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 9999px;
  padding: 0.75rem 1.5rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  gap: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.search-box:focus-within {
  border-color: rgba(167, 139, 250, 0.5); /* vibrant purple */
  box-shadow: 0 0 25px rgba(167, 139, 250, 0.25), inset 0 0 10px rgba(255,255,255,0.02);
  background: rgba(255, 255, 255, 0.07);
}
.search-icon {
  font-size: 1.25rem;
  color: #a1a1aa;
}
.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #f8fafc;
  font-size: 1.1rem;
  padding: 0.5rem 0;
}
.search-input::placeholder { color: #64748b; }
.clear-btn {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0.25rem;
}
.status-line { text-align: center; font-size: 0.85rem; color: #9ca3af; }
.error-box { max-width: 520px; margin: 0 auto; background: #fef2f2; border: 1px solid #f87171; border-radius: 12px; padding: 1.25rem; color: #b91c1c; display: flex; gap: 0.75rem; align-items: center; }
.empty-state { text-align: center; padding: 4rem 2rem; background: #fff; border: 1px dashed #d1d5db; border-radius: 16px; margin-top: 2rem; }
.empty-title { font-size: 1.1rem; font-weight: 700; color: #111827; margin: 0 0 0.4rem; }
.empty-desc { color: #6b7280; font-size: 0.85rem; max-width: 320px; margin: 0 auto; }

/* ── Modern Product Grid Layout ── */
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.75rem;
  animation: gridFadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes gridFadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 1024px) {
  .product-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .product-grid { grid-template-columns: 1fr; }
}

/* ── Premium E-commerce Card ── */
.product-card {
  background: rgba(17, 17, 17, 0.65);
  backdrop-filter: blur(12px);
  border-radius: 1rem; /* smoother xl corners */
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.06);
  text-decoration: none;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-8px); /* Elevates the card beautifully */
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.6), 0 0 20px rgba(167, 139, 250, 0.15); /* glowing shadow */
  border-color: rgba(167, 139, 250, 0.4);
}

/* Badges */
.badge-container {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 10;
}

.badge {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 5px 12px;
  border-radius: 6px;
  letter-spacing: 0.05em;
  box-shadow: 0 4px 12px rgba(0,0,0,0.25);
  backdrop-filter: blur(8px);
}

.badge-sell { background: rgba(59, 130, 246, 0.85); color: #fff; border: 1px solid rgba(59, 130, 246, 0.3); } 
.badge-rent { background: rgba(139, 92, 246, 0.85); color: #fff; border: 1px solid rgba(139, 92, 246, 0.3); } 
.badge-urgent { background: rgba(239, 68, 68, 0.9); color: #fff; border: 1px solid rgba(239, 68, 68, 0.3); animation: pulseUrgent 2s infinite; }

@keyframes pulseUrgent {
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

/* Image Area */
.img-wrap {
  width: 100%;
  height: 200px; /* Fixed height */
  background: #0a0a0a;
  overflow: hidden;
  position: relative;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Cover */
  display: block;
}

.img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

/* Card Body */
.product-details {
  padding: 1rem 1.25rem; /* padding 4 */
  display: flex;
  flex-direction: column;
  flex: 1;
}

.product-category {
  font-size: 0.75rem;
  font-weight: 600;
  color: #9ca3af; /* Muted text */
  margin-bottom: 0.35rem;
  text-transform: uppercase;
}

.product-title {
  font-size: 1rem;
  font-weight: 500;
  color: #f3f4f6;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
  /* Truncate overflow to 2 lines */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 2.8rem; /* Keeps title height consistent even if 1 line */
}

.product-rating {
  font-size: 0.8rem;
  color: #9ca3af;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
}

.star { color: #fbbf24; margin-right: 3px; font-size: 0.9rem; }

.price-container {
  margin-top: auto; /* pushes price to the bottom */
  padding-top: 0.5rem;
}

.price-row {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.current-price {
  font-size: 1.2rem;
  font-weight: 700;
  color: #f9fafb; /* bold */
}

.price-unit {
  font-size: 0.8rem;
  font-weight: 500;
  color: #6b7280;
  margin-left: 2px;
}

.original-price {
  font-size: 0.85rem;
  color: #9ca3af;
  text-decoration: line-through; /* strikethrough */
}

.discount-tag {
  font-size: 0.8rem;
  font-weight: 700;
  color: #16a34a; /* green */
}

/* Skeleton Loading */
.skeleton-card {
  height: 340px;
  border-radius: 0.5rem;
  background: #111111;
  border: 1px solid #2a2a2a;
  position: relative;
  overflow: hidden;
}

.skeleton-card::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
`;
