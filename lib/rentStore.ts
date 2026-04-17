/**
 * lib/rentStore.ts
 * Temporary client-side rent-item store using localStorage.
 * Replace with API calls when backend is ready.
 */

export interface RentItem {
  id: string;
  category: string;
  title: string;
  description: string;
  condition: "new" | "good" | "used";
  pricing: {
    pricePerDay: number;
    pricePerWeek?: number;
    pricePerMonth?: number;
  };
  availability: {
    availableFrom: string;
    availableTill: string;
  };
  securityDeposit?: number;
  images: string[]; // base64 data URLs
  isUrgent: boolean;
  allowNegotiation: boolean;
  status: "active" | "rented" | "unavailable";
  createdAt: string;
}

const STORE_KEY = "seller_rent_items";

export function getRentItems(): RentItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveRentItem(
  item: Omit<RentItem, "id" | "createdAt">
): RentItem {
  const newItem: RentItem = {
    ...item,
    id: `rent_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  const existing = getRentItems();
  localStorage.setItem(STORE_KEY, JSON.stringify([newItem, ...existing]));
  return newItem;
}

export function deleteRentItem(id: string): void {
  const updated = getRentItems().filter((r) => r.id !== id);
  localStorage.setItem(STORE_KEY, JSON.stringify(updated));
}

export function updateRentItem(
  id: string,
  changes: Partial<Omit<RentItem, "id" | "createdAt">>
): void {
  const updated = getRentItems().map((r) =>
    r.id === id ? { ...r, ...changes } : r
  );
  localStorage.setItem(STORE_KEY, JSON.stringify(updated));
}
