/**
 * app/search/page.tsx
 * Campus Search Page — domain-filtered unified sell + rent results.
 * Users only see items from their own college email domain.
 */

"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

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

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc">("newest");
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 500);

  // Sync state if URL changes (e.g. from CategoriesNav)
  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null) setQuery(q);
  }, [searchParams]);

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
    // Only focus if query is empty to avoid interrupting user if they arrived with a category
    if (!initialQuery) inputRef.current?.focus();
  }, [initialQuery]);

  const handleClear = useCallback(() => {
    setQuery("");
    inputRef.current?.focus();
  }, []);

  /* ── Render helpers ── */
  const sortedResults = [...results].sort((a, b) => {
    if (sortBy === "price_asc") return a.price - b.price;
    if (sortBy === "price_desc") return b.price - a.price;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const sellCount = results.filter((r) => r.type === "sell").length;
  const rentCount = results.filter((r) => r.type === "rent").length;

  return (
    <div className="search-page-wrapper">
      <style dangerouslySetInnerHTML={{ __html: pageCSS }} />
      
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/10 blur-[180px] rounded-full opacity-30 animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[180px] rounded-full opacity-20 animate-pulse-slow delay-1000" />
      </div>

      <div className="search-page-container">
        <Link href="/" className="back-button">
          <span className="arrow">←</span> Back to Market
        </Link>
        
        <div className="search-top-bar">
          {/* ── Header ── */}
          <div className="search-header">
            <div className="inline-badge">
               <span className="dot"></span> Campus Network
            </div>
            <h1 className="search-title">Market <span className="text-amber">Search</span></h1>
            <p className="search-subtitle">Discover items exclusively from your college campus</p>
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
                placeholder="What are you looking for?"
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

            {/* Status & Sort line */}
            <div className="status-line">
              {loading ? (
                <span className="loading-dots">Searching campus listings</span>
              ) : !error && hasSearched && results.length > 0 ? (
                <div className="controls-row">
                  <span className="results-badge">
                    {results.length} found •{" "}
                    {sellCount > 0 && <span className="sell-stat">{sellCount} Sale</span>}
                    {sellCount > 0 && rentCount > 0 && " • "}
                    {rentCount > 0 && <span className="rent-stat">{rentCount} Rent</span>}
                  </span>

                  <div className="sort-box">
                    <label htmlFor="sort-dropdown">Sort by:</label>
                    <select 
                      id="sort-dropdown"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="sort-select"
                    >
                      <option value="newest">Newest First</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                    </select>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* ── Error State ── */}
        {error && (
          <div className="error-box">
            <span className="error-icon">⚠️</span>
            <p className="error-text">{error}</p>
          </div>
        )}

        {/* ── Empty State ── */}
        {!loading && !error && hasSearched && results.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h2 className="empty-title">Nothing Found</h2>
            <p className="empty-desc">
              {query
                ? `We couldn't find anything matching "${query}".`
                : "Be the first to list something on your campus!"}
            </p>
            {query && (
              <button onClick={handleClear} className="reset-btn">
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* ── Results Grid ── */}
        {!loading && sortedResults.length > 0 && (
          <div className="product-grid">
            {sortedResults.map((item, idx) => (
              <ResultCard key={item.id} item={item} index={idx} />
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
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505] text-white p-20">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}

/* ── Result Card ── */
function ResultCard({ item, index }: { item: SearchResult; index: number }) {
  const isSell = item.type === "sell";

  return (
    <Link 
      href={`/product/${item.id}`} 
      className="product-card"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* ── Top-left Badges ── */}
      <div className="badge-container">
        <span className={`badge ${isSell ? "badge-sell" : "badge-rent"}`}>
          {isSell ? "Sale" : "Rent"}
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
            <span className="placeholder-emoji">{isSell ? "📦" : "🔄"}</span>
          </div>
        )}
        <div className="img-overlay"></div>
      </div>

      {/* ── Card Body ── */}
      <div className="product-details">
        <span className="product-category">{item.category}</span>
        
        <h3 className="product-title" title={item.title}>{item.title}</h3>
        
        <div className="meta-row">
          {item.rating && (
            <div className="product-rating">
              <span className="star">★</span> {item.rating.toFixed(1)}
            </div>
          )}
          <span className="time-ago">Added {new Date(item.createdAt).toLocaleDateString()}</span>
        </div>
        
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
          </div>
          {item.discount && item.discount > 0 ? (
            <span className="discount-tag">Save {item.discount}%</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

/* ── Global Transitions & Theme Styles ── */
const pageCSS = `
.search-page-wrapper {
  min-height: 100vh;
  background: #050505;
  color: #fff;
  position: relative;
  overflow-x: hidden;
}

.search-page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem 6rem;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  position: relative;
  z-index: 10;
}

/* Back Button */
.back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 2rem;
  transition: all 0.3s ease;
  padding: 0.4rem 0.8rem;
  background: rgba(255,255,255,0.03);
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.05);
}

.back-button:hover {
  color: #f59e0b;
  background: rgba(245,158,11,0.08);
  border-color: rgba(245,158,11,0.2);
  transform: translateX(-4px);
}

/* Header Section */
.search-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 3rem;
  margin-bottom: 4rem;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  padding-bottom: 3rem;
}

.search-header {
  text-align: left;
  margin-bottom: 0;
  flex: 1;
}

.inline-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.8rem;
  background: rgba(245,158,11,0.08);
  border: 1px solid rgba(245,158,11,0.15);
  border-radius: 100px;
  font-size: 0.65rem;
  font-weight: 800;
  color: #f59e0b;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin-bottom: 1rem;
}

.dot {
  width: 5px;
  height: 5px;
  background: #f59e0b;
  border-radius: 50%;
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.5; }
  100% { transform: scale(1); opacity: 1; }
}

.search-title {
  font-size: 2.8rem;
  font-weight: 900;
  letter-spacing: -0.04em;
  margin: 0;
  line-height: 1;
  color: #fff;
}

.text-amber {
  color: #f59e0b;
  background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.search-subtitle {
  color: #64748b;
  font-size: 1rem;
  margin-top: 0.75rem;
  font-weight: 500;
}

/* Search Box */
.search-wrap {
  max-width: 500px;
  margin: 0;
  width: 100%;
}

.search-box {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1rem 1.5rem;
  box-shadow: 0 15px 30px rgba(0,0,0,0.3);
  gap: 1rem;
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.search-box:focus-within {
  background: rgba(255, 255, 255, 0.06);
  border-color: #f59e0b;
  box-shadow: 0 0 0 4px rgba(245,158,11,0.1), 0 15px 30px rgba(0,0,0,0.4);
  transform: translateY(-2px);
}

.search-icon {
  font-size: 1.25rem;
  opacity: 0.5;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
}

.search-input::placeholder {
  color: #475569;
  font-weight: 500;
}

.clear-btn {
  background: rgba(255,255,255,0.05);
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.7rem;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: #f59e0b;
  color: #000;
}

.status-line {
  margin-top: 1rem;
  text-align: left;
}

.controls-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.results-badge {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  background: rgba(255,255,255,0.03);
  padding: 0.4rem 1rem;
  border-radius: 100px;
  border: 1px solid rgba(255,255,255,0.05);
}

.sort-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.sort-select {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  color: #fff;
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  font-weight: 700;
  outline: none;
  cursor: pointer;
  transition: all 0.2s;
}

.sort-select:hover {
  background: rgba(245,158,11,0.08);
  border-color: rgba(245,158,11,0.3);
}

.sort-select:focus {
  border-color: #f59e0b;
}

.sort-select option {
  background: #111;
  color: #fff;
}

.sell-stat { color: #3b82f6; }
.rent-stat { color: #8b5cf6; }

/* Grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
  animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Card */
.product-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  overflow: hidden;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  position: relative;
  opacity: 0;
  animation: fadeInUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

.product-card:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(245, 158, 11, 0.4);
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 15px 30px rgba(0,0,0,0.5);
}

.badge-container {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 20;
  display: flex;
  gap: 6px;
}

.badge {
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.65rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.1);
}

.badge-sell { background: rgba(59, 130, 246, 0.8); color: #fff; }
.badge-rent { background: rgba(139, 92, 246, 0.8); color: #fff; }
.badge-urgent { background: rgba(239, 68, 68, 0.9); color: #fff; border-color: rgba(239, 68, 68, 0.3); animation: pulse-red 2s infinite; }

@keyframes pulse-red {
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

.img-wrap {
  width: 100%;
  aspect-ratio: 1/1;
  background: #000;
  position: relative;
  overflow: hidden;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.product-card:hover .product-img {
  transform: scale(1.1);
}

.img-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.4), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}

.product-card:hover .img-overlay { opacity: 1; }

.product-details {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.product-category {
  font-size: 0.65rem;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin-bottom: 0.5rem;
}

.product-title {
  font-size: 1rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 0.75rem;
  line-height: 1.3;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.product-rating {
  font-size: 0.75rem;
  font-weight: 800;
  color: #f59e0b;
  display: flex;
  align-items: center;
  gap: 3px;
}

.time-ago {
  font-size: 0.7rem;
  font-weight: 600;
  color: #475569;
}

.price-container {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.current-price {
  font-size: 1.25rem;
  font-weight: 900;
  color: #fff;
}

.original-price {
  font-size: 0.8rem;
  color: #475569;
  text-decoration: line-through;
  margin-left: 6px;
}

.discount-tag {
  font-size: 0.65rem;
  font-weight: 900;
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid rgba(34, 197, 94, 0.1);
}

/* Empty States */
.empty-state {
  text-align: left;
  padding: 4rem 2.5rem;
  background: rgba(255,255,255,0.02);
  border: 1px dashed rgba(255,255,255,0.08);
  border-radius: 24px;
}

.empty-icon { font-size: 3rem; margin-bottom: 1.5rem; }
.empty-title { font-size: 1.75rem; font-weight: 900; margin-bottom: 0.75rem; }
.empty-desc { color: #64748b; font-size: 1rem; max-width: 400px; margin: 0 0 2rem; }

.reset-btn {
  background: #fff;
  color: #000;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.3s;
}

.reset-btn:hover {
  background: #f59e0b;
  transform: scale(1.05);
  box-shadow: 0 10px 30px rgba(245,158,11,0.3);
}

/* Skeleton */
.skeleton-card {
  height: 380px;
  background: rgba(255,255,255,0.02);
  border-radius: 20px;
  position: relative;
  overflow: hidden;
}

.skeleton-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes pulse-slow {
  0%, 100% { transform: scale(1); opacity: 0.2; }
  50% { transform: scale(1.1); opacity: 0.3; }
}

.loading-dots::after {
  content: '...';
  display: inline-block;
  width: 20px;
  text-align: left;
  animation: dots 1.5s infinite;
}

@keyframes dots {
  0% { content: ''; }
  33% { content: '.'; }
  66% { content: '..'; }
  100% { content: '...'; }
}

@media (max-width: 1024px) {
  .search-top-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 2rem;
  }
  .search-wrap { max-width: 100%; }
}

@media (max-width: 768px) {
  .search-title { font-size: 2.2rem; }
  .product-grid { grid-template-columns: 1fr; }
}
`;
