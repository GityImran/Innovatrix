/**
 * lib/productStore.ts
 * Temporary client-side product store using localStorage.
 * Replace with API calls when backend is ready.
 */

export interface Product {
  id: string;
  category: string;
  title: string;
  description: string;
  condition: "new" | "good" | "used";
  originalPrice?: number;
  expectedPrice: number;
  images: string[]; // base64 data URLs for temporary storage
  isUrgent: boolean;
  isBundle: boolean;
  bundleTitle?: string;
  status: "active" | "draft" | "sold";
  createdAt: string;
}

const STORE_KEY = "seller_products";

export function getProducts(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveProduct(product: Omit<Product, "id" | "createdAt">): Product {
  const newProduct: Product = {
    ...product,
    id: `prod_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  const existing = getProducts();
  localStorage.setItem(STORE_KEY, JSON.stringify([newProduct, ...existing]));
  return newProduct;
}

export function deleteProduct(id: string): void {
  const updated = getProducts().filter((p) => p.id !== id);
  localStorage.setItem(STORE_KEY, JSON.stringify(updated));
}

export function updateProduct(
  id: string,
  changes: Partial<Omit<Product, "id" | "createdAt">>
): void {
  const updated = getProducts().map((p) =>
    p.id === id ? { ...p, ...changes } : p
  );
  localStorage.setItem(STORE_KEY, JSON.stringify(updated));
}

export function getProductById(id: string): Product | undefined {
  return getProducts().find((p) => p.id === id);
}

export function updateProductStatus(id: string, status: Product["status"]): void {
  const updated = getProducts().map((p) => (p.id === id ? { ...p, status } : p));
  localStorage.setItem(STORE_KEY, JSON.stringify(updated));
}
