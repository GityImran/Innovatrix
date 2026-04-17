/**
 * lib/productStore.ts
 *
 * Compatibility shim retained after migration to MongoDB.
 * The sustainability page uses `getProducts()` on the client side for
 * local stat calculations; it now returns an empty array so that the
 * page falls back to its built-in placeholder values.
 *
 * The `Product` interface is kept here so that lib/sustainability.ts
 * can import the shared type without changes.
 */

export interface Product {
  id: string;
  title: string;
  category: string;
  condition: string;
  status: "active" | "sold" | "draft";
  expectedPrice: number;
  createdAt: string;
  [key: string]: unknown;
}

/**
 * Returns an empty list; data now lives in MongoDB.
 * The sustainability dashboard falls back to its built-in placeholder stats
 * when this returns [].
 */
export function getProducts(): Product[] {
  return [];
}
