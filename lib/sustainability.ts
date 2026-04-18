/**
 * lib/sustainability.ts
 * Logic for calculating environmental impact of reused items.
 */

import { Product } from "./productStore";

export const CO2_FACTORS: Record<string, number> = {
  clothes: 5, // Default for general clothes
  tshirt: 2.5,
  jeans: 10,
  books: 1,
  electronics: 30, // Average for electronics
  laptop: 50,
  phone: 20
};

export interface SustainabilityStats {
  co2Saved: number;
  treesSaved: number;
  wasteDiverted: number;
  circularityScore: number;
}

export function calculateStats(products: Product[]): SustainabilityStats {
  const reusedItems = products.filter(p => p.status === "sold");
  const donatedItems = products.filter(p => p.status === "active" && p.expectedPrice === 0); // Assuming 0 price is donation
  
  const totalReused = reusedItems.length;
  const totalDonated = donatedItems.length;
  
  const co2Saved = reusedItems.reduce((total, item) => {
    // Try to find a specific factor, or use category, or fallback to 2
    const factor = CO2_FACTORS[item.title.toLowerCase()] || 
                   CO2_FACTORS[item.category.toLowerCase()] || 2;
    return total + factor;
  }, 0);

  const treesSaved = co2Saved / 21; // 1 tree absorbs ~21kg CO2/year
  const wasteDiverted = totalReused + totalDonated;
  const circularityScore = products.length > 0 ? (totalReused / products.length) * 100 : 0;

  return {
    co2Saved,
    treesSaved,
    wasteDiverted,
    circularityScore
  };
}

export interface CategoryImpact {
  name: string;
  co2Saved: number;
}

export function getCategoryImpact(products: Product[]): CategoryImpact[] {
  const reusedItems = products.filter(p => p.status === "sold");
  const impactMap: Record<string, number> = {};

  reusedItems.forEach(item => {
    const factor = CO2_FACTORS[item.title.toLowerCase()] || 
                   CO2_FACTORS[item.category.toLowerCase()] || 2;
    const category = item.category || "Other";
    impactMap[category] = (impactMap[category] || 0) + factor;
  });

  return Object.entries(impactMap).map(([name, co2Saved]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    co2Saved
  })).sort((a, b) => b.co2Saved - a.co2Saved);
}

export function getSuggestions(products: Product[]) {
  const suggestions = [];
  const now = new Date();

  for (const product of products) {
    if (product.status === "active") {
      const createdAt = new Date(product.createdAt);
      const daysListed = (now.getTime() - createdAt.getTime()) / (1000 * 3600 * 24);

      // 1. Donate Suggestion
      if (daysListed > 15) {
        suggestions.push({
          productId: product.id,
          type: "donate",
          title: "Consider Donating",
          message: `Your item "${product.title}" hasn't been picked up for 15+ days. Consider donating to reduce waste! 🌱`,
          action: "Donate Now"
        });
      }

      // 2. Recycle Suggestion (if electronics or damaged/used heavily)
      if (product.category.toLowerCase() === "electronics" || product.condition === "used") {
        suggestions.push({
          productId: product.id,
          type: "recycle",
          title: "Recycle Responsibly",
          message: `Is your "${product.title}" no longer functional? Recycle it responsibly to prevent environmental harm. ♻️`,
          action: "Find Center"
        });
      }

      // 3. Price Drop Suggestion (placeholder logic for views)
      // Since we don't have a 'views' field in the current productStore, I'll use a random placeholder or just days
      if (daysListed > 7) {
        suggestions.push({
          productId: product.id,
          type: "price-drop",
          title: "Boost Interest",
          message: `A small price drop for "${product.title}" could reach more buyers faster.`,
          action: "Update Price"
        });
      }
    }
  }

  return suggestions;
}
