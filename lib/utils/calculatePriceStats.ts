/**
 * Utility to calculate price statistics for a given set of prices.
 * 
 * Steps:
 * 1. Extract price array
 * 2. Sort prices
 * 3. Compute median
 * 4. Apply safe cap: filteredPrices = prices.filter(p => p >= median * 0.3 && p <= median * 3)
 * 5. Compute: avg, min, max
 * 6. Recommended range: [Math.round(median * 0.9), Math.round(median * 1.1)]
 */
export interface PriceStats {
  avgPrice: number;
  medianPrice: number;
  minPrice: number;
  maxPrice: number;
  recommendedRange: [number, number];
  lowData: boolean;
}

export const calculatePriceStats = (prices: number[]): PriceStats | null => {
  if (prices.length === 0) return null;

  // 1. Sort prices
  const sortedPrices = [...prices].sort((a, b) => a - b);
  
  // 2. Compute median
  let median: number;
  const mid = Math.floor(sortedPrices.length / 2);
  if (sortedPrices.length % 2 === 0) {
    median = (sortedPrices[mid - 1] + sortedPrices[mid]) / 2;
  } else {
    median = sortedPrices[mid];
  }

  // 3. Apply safe cap (remove outliers) - Only if we have enough data
  let filteredPrices = sortedPrices;
  if (sortedPrices.length >= 3) {
    filteredPrices = sortedPrices.filter(
      p => p >= median * 0.3 && p <= median * 3
    );
  }

  if (filteredPrices.length === 0) return null;

  // 4. Compute avg, min, max
  const sum = filteredPrices.reduce((a, b) => a + b, 0);
  const avg = sum / filteredPrices.length;
  const min = filteredPrices[0];
  const max = filteredPrices[filteredPrices.length - 1];

  // 5. Recommended range
  const recommendedRange: [number, number] = [
    Math.round(median * 0.9),
    Math.round(median * 1.1)
  ];

  return {
    avgPrice: Math.round(avg),
    medianPrice: Math.round(median),
    minPrice: Math.round(min),
    maxPrice: Math.round(max),
    recommendedRange,
    lowData: filteredPrices.length < 3
  };
};
