"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, ShoppingBag, ArrowRight, CreditCard } from "lucide-react";

export default function CartClient() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error("Failed to fetch cart", err);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (cartItemId: string) => {
    try {
      const res = await fetch(`/api/cart?id=${cartItemId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setItems(items.filter((item) => item._id !== cartItemId));
      }
    } catch (err) {
      console.error("Failed to remove item", err);
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/cart/checkout", {
        method: "POST",
      });
      if (res.ok) {
        alert("🎉 Order placed successfully for all items!");
        router.push("/dashboard");
      } else {
        const d = await res.json();
        alert(d.error || "Checkout failed");
      }
    } catch (err) {
      console.error("Checkout failed", err);
      alert("An unexpected error occurred during checkout");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const subtotal = items.reduce((acc, item) => {
    const price = item.itemModel === "Product" 
      ? item.itemId?.expectedPrice 
      : (item.itemId?.pricing?.day || 0);
    return acc + (price || 0);
  }, 0);

  if (loading) {
    return <div className="min-h-[400px] bg-black flex items-center justify-center text-slate-400">Loading your cart...</div>;
  }

  return (
    <div className="flex-grow container mx-auto px-4 py-12 max-w-5xl">
        <div className="flex items-center gap-3 mb-10">
          <ShoppingBag className="text-amber-500" size={32} />
          <h1 className="text-4xl font-bold tracking-tight">Your Shopping Cart</h1>
        </div>

        {items.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-16 text-center">
            <div className="text-6xl mb-6">🏜️</div>
            <h2 className="text-2xl font-bold mb-4 text-white">Your cart is empty</h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Looks like you haven't added anything to your cart yet. 
              Explore the campus marketplace to find some amazing deals!
            </p>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 px-8 rounded-xl transition-all"
            >
              Start Shopping <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items List */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {items.map((item) => {
                const product = item.itemId;
                const isSell = item.itemModel === "Product";
                const price = isSell ? product?.expectedPrice : (product?.pricing?.day || 0);

                return (
                  <div key={item._id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex gap-4 items-center">
                    <div className="w-24 h-24 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                      {product?.image?.url ? (
                        <img src={product.image.url} alt={product.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl opacity-50">
                          {isSell ? "📦" : "🔄"}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">
                            {isSell ? "Buy" : "Rent"} • {product?.category}
                          </span>
                          <h3 className="font-semibold text-lg text-white">
                            <Link href={`/product/${product?._id}`} className="hover:text-amber-500 transition-colors">
                              {product?.title || "Unknown Item"}
                            </Link>
                          </h3>
                        </div>
                        <button 
                          onClick={() => removeItem(item._id)}
                          className="text-slate-500 hover:text-red-500 transition-colors p-2"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-xl font-bold text-amber-500">₹{price}</span>
                        {!isSell && <span className="text-xs text-slate-500"> / day</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-6 text-white border-b border-slate-800 pb-4">Order Summary</h2>
                
                <div className="flex flex-col gap-4 mb-6">
                  <div className="flex justify-between text-slate-400">
                    <span>Items ({items.length})</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Platform Fee</span>
                    <span className="text-emerald-500">FREE</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Delivery</span>
                    <span>To be discussed</span>
                  </div>
                </div>
                
                <div className="border-t border-slate-800 pt-4 mb-8">
                  <div className="flex justify-between items-baseline">
                    <span className="text-lg font-bold text-white">Total Amount</span>
                    <span className="text-3xl font-extrabold text-amber-500">₹{subtotal}</span>
                  </div>
                </div>

                <button 
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-extrabold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                >
                  {checkoutLoading ? (
                    "Processing..."
                  ) : (
                    <>
                      Place Order <ArrowRight size={20} />
                    </>
                  )}
                </button>
                
                <div className="mt-6 flex flex-col gap-3">
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <CreditCard size={14} />
                    Secure payment powered by Stripe
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <ShoppingBag size={14} />
                    Buyer Protection Guarantee
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
