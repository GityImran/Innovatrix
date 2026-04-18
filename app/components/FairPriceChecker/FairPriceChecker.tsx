"use client";

import React, { useEffect, useState } from "react";

interface SimilarItem {
  _id: string;
  title: string;
  expectedPrice: number;
  condition: string;
}

interface PriceStats {
  hasData: boolean;
  lowData: boolean;
  count: number;
  avgPrice?: number;
  medianPrice?: number;
  minPrice?: number;
  maxPrice?: number;
  recommendedRange?: [number, number];
  priceDifferencePercent?: number;
  priceDifferenceAmount?: number;
  recommendation: string;
  similarItems: SimilarItem[];
}

interface FairPriceCheckerProps {
  title: string;
  category: string;
  condition: string;
  price: number;
  excludeId?: string;
  mode: "seller" | "buyer";
}

export const FairPriceChecker: React.FC<FairPriceCheckerProps> = ({
  title,
  category,
  condition,
  price,
  excludeId,
  mode,
}) => {
  const [stats, setStats] = useState<PriceStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      if (!title || !category || !condition) return;
      setLoading(true);
      try {
        const res = await fetch("/api/products/similar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, category, condition, price, excludeId }),
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch price stats:", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchStats, 1000);
    return () => clearTimeout(timer);
  }, [title, category, condition, price, excludeId]);

  const getStatusColor = (percent: number | undefined) => {
    if (percent === undefined) return "#94a3b8";
    if (percent < 0) return "#10b981"; // Green
    if (percent <= 10) return "#f59e0b"; // Yellow/Amber
    return "#ef4444"; // Red
  };

  const getStatusBg = (percent: number | undefined) => {
    if (percent === undefined) return "transparent";
    if (percent < 0) return "rgba(16, 185, 129, 0.1)";
    if (percent <= 10) return "rgba(245, 158, 11, 0.1)";
    return "rgba(239, 68, 68, 0.1)";
  };

  if (loading) {
    return <div style={s.container}>Checking market prices...</div>;
  }

  // Handle case with NO similar items at all
  if (!stats || stats.similarItems.length === 0) {
    return (
      <div style={s.container}>
        <p style={s.noData}>📉 Not enough data for price insights.</p>
      </div>
    );
  }

  const diffColor = getStatusColor(stats.priceDifferencePercent);

  return (
    <div style={s.container}>
      {/* 1. STATS SECTION - Only show if we have data for the same condition */}
      {stats.hasData ? (
        <>
          <h3 style={s.header}>Market Insights ({condition} condition)</h3>
          
          <div style={s.statsGrid}>
            <div style={s.statItem}>
              <p style={s.statLabel}>Avg Price</p>
              <p style={s.statValue}>₹{stats.avgPrice}</p>
            </div>
            <div style={s.statItem}>
              <p style={s.statLabel}>{stats.minPrice === stats.maxPrice ? "Typical Price" : "Market Range"}</p>
              <p style={s.statValue}>
                {stats.minPrice === stats.maxPrice ? `₹${stats.minPrice}` : `₹${stats.minPrice} - ₹${stats.maxPrice}`}
              </p>
            </div>
          </div>

          {/* Buyer Recommendation Section */}
          {mode === "buyer" && (
            <div style={{
              ...s.recommendationBox,
              borderColor: diffColor,
              backgroundColor: getStatusBg(stats.priceDifferencePercent)
            }}>
              <p style={{ ...s.recommendationText, color: diffColor }}>
                {stats.recommendation}
              </p>
            </div>
          )}

          {mode === "seller" && price > 0 && (
            <div style={s.sellerInsight}>
              <p style={s.insightTitle}>Recommendation</p>
              <div style={s.sellerStatsRow}>
                <p style={s.recommendedRange}>
                  Ideal range: <strong>₹{stats.recommendedRange?.[0]} - ₹{stats.recommendedRange?.[1]}</strong>
                </p>
                {stats.priceDifferenceAmount !== undefined && (
                  <p style={{ ...s.diffValueText, color: diffColor }}>
                    {stats.priceDifferenceAmount > 0 ? "+" : ""}₹{stats.priceDifferenceAmount} ({stats.priceDifferencePercent}%)
                  </p>
                )}
              </div>

              <div style={{
                ...s.recommendationBox,
                borderColor: diffColor,
                backgroundColor: getStatusBg(stats.priceDifferencePercent),
                marginTop: "0.5rem"
              }}>
                <p style={{ ...s.recommendationText, color: diffColor }}>
                  {stats.priceDifferencePercent !== undefined && stats.priceDifferencePercent > 10 
                    ? `Consider reducing price by ₹${stats.priceDifferenceAmount} to match market`
                    : stats.priceDifferencePercent !== undefined && stats.priceDifferencePercent < -15
                    ? "You can increase price slightly"
                    : "Your pricing is competitive"}
                </p>
              </div>
            </div>
          )}

          {stats.count === 1 && (
            <p style={s.lowDataWarning}>
              Only 1 similar item found — insights may not be reliable.
            </p>
          )}
          {stats.count === 2 && (
            <p style={s.lowDataWarning}>
              Limited data available — insights based on 2 items.
            </p>
          )}
        </>
      ) : (
        // No data for this condition
        <div style={{ marginBottom: "1rem" }}>
          <p style={s.noData}>
            {stats.count === 1 
              ? "📉 Only one similar item found — use as reference."
              : mode === "seller" 
              ? "📉 Not enough data to suggest price for this condition."
              : "📉 No market stats for this condition yet."}
          </p>
        </div>
      )}

      {/* 2. SIMILAR ITEMS LIST - Always show if items exist (all conditions) */}
      <div style={s.similarSection}>
        <p style={s.similarTitle}>Similar Items Found ({stats.similarItems.length}):</p>
        <div style={s.similarList}>
          {stats.similarItems.map((item) => (
            <div key={item._id} style={s.similarCard}>
              <div style={s.similarInfo}>
                <p style={s.itemTitle}>{item.title}</p>
                <p style={s.itemMeta}>₹{item.expectedPrice} • {item.condition}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: "#1a1a1a",
    border: "1px solid #333",
    borderRadius: "12px",
    padding: "1.25rem",
    marginTop: "1rem",
    color: "#e2e8f0",
  },
  header: {
    fontSize: "0.95rem",
    fontWeight: 700,
    marginBottom: "1rem",
    color: "#f59e0b",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
    marginBottom: "1.25rem",
  },
  statItem: {
    backgroundColor: "#0a0a0a",
    padding: "0.75rem",
    borderRadius: "8px",
    border: "1px solid #222",
  },
  statLabel: {
    fontSize: "0.75rem",
    color: "#94a3b8",
    margin: 0,
    marginBottom: "0.25rem",
  },
  statValue: {
    fontSize: "1rem",
    fontWeight: 700,
    margin: 0,
  },
  recommendationBox: {
    padding: "0.75rem",
    borderRadius: "8px",
    border: "1px solid",
    marginBottom: "1rem",
  },
  recommendationText: {
    fontSize: "0.875rem",
    fontWeight: 600,
    margin: 0,
  },
  sellerInsight: {
    borderTop: "1px solid #333",
    paddingTop: "1rem",
    marginBottom: "1rem",
  },
  insightTitle: {
    fontSize: "0.85rem",
    fontWeight: 600,
    marginBottom: "0.5rem",
  },
  sellerStatsRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.5rem",
  },
  recommendedRange: {
    fontSize: "0.875rem",
    margin: 0,
  },
  diffValueText: {
    fontSize: "0.875rem",
    fontWeight: 700,
    margin: 0,
  },
  noData: {
    fontSize: "0.875rem",
    color: "#94a3b8",
    margin: 0,
    textAlign: "center",
  },
  lowDataWarning: {
    fontSize: "0.75rem",
    color: "#f59e0b",
    fontStyle: "italic",
    marginBottom: "1rem",
  },
  similarSection: {
    borderTop: "1px solid #333",
    paddingTop: "1rem",
  },
  similarTitle: {
    fontSize: "0.85rem",
    fontWeight: 600,
    marginBottom: "0.75rem",
    color: "#94a3b8",
  },
  similarList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.6rem",
    maxHeight: "150px",
    overflowY: "auto",
  },
  similarCard: {
    backgroundColor: "#0a0a0a",
    padding: "0.6rem 0.8rem",
    borderRadius: "8px",
    border: "1px solid #222",
  },
  similarInfo: {
    display: "flex",
    flexDirection: "column",
  },
  itemTitle: {
    fontSize: "0.8rem",
    fontWeight: 600,
    margin: 0,
    color: "#f8fafc",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  itemMeta: {
    fontSize: "0.75rem",
    color: "#64748b",
    margin: 0,
    marginTop: "0.2rem",
  },
};
