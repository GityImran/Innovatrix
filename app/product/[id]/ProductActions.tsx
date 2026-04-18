"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MessageCircle, Mail } from "lucide-react";

interface ProductActionsProps {
  productId: string;
  type: "sell" | "rent";
  sellerId: string;
  sellerEmail: string;
  price: number;
  status: string;
}

export function ProductActions({
  productId,
  type,
  sellerId,
  sellerEmail,
  price,
  status,
}: ProductActionsProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [actionLoading, setActionLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);

  const isSoldOut = status !== "active";
  const isOwnProduct = session?.user?.id === sellerId;

  const handleAction = async () => {
    if (!session) {
      alert("Please sign in first");
      router.push("/login");
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: productId,
          itemModel: type === "sell" ? "Product" : "RentItem",
          sellerId,
          totalAmount: price,
          orderType: type === "sell" ? "buy" : "rent",
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to process request");
      }
      alert(type === "sell" ? "Order placed successfully!" : "Rental requested successfully!");
      router.push("/dashboard");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleChat = async () => {
    if (!session) {
      alert("Please sign in first");
      router.push("/login");
      return;
    }
    setChatLoading(true);
    try {
      const res = await fetch('/api/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: productId, sellerId }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to start chat');
        return;
      }

      const convo = await res.json();
      router.push(`/chat/${convo._id}`);
    } catch (err) {
      console.error('Chat button error:', err);
      alert('Could not start conversation. Please try again.');
    } finally {
      setChatLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!session) {
      alert("Please sign in first");
      router.push("/login");
      return;
    }
    
    setCartLoading(true);
    setCartSuccess(false);
    
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: productId,
          itemModel: type === "sell" ? "Product" : "RentItem",
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to add to cart");
      }
      
      setCartSuccess(true);
      // Automatically hide success message after 3 seconds
      setTimeout(() => setCartSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCartLoading(false);
    }
  };

  if (isOwnProduct) {
    return (
      <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 p-4 rounded-xl text-center font-medium">
        This is your own listing
      </div>
    );
  }

  if (isSoldOut) {
    return (
      <button 
        disabled
        className="w-full bg-[#111] text-slate-500 font-bold py-4 px-8 rounded-xl cursor-not-allowed border border-[#222]"
      >
        ❌ Already {type === "sell" ? "Sold" : "Rented"}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {cartSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg text-center text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
          ✨ Added to cart successfully!
        </div>
      )}
      <div className="flex gap-4">
        <button 
          onClick={handleAction}
          disabled={actionLoading || cartLoading}
          className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold py-4 px-8 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {actionLoading ? "Processing..." : (type === "sell" ? "Buy Now" : "Request Rental")}
        </button>
        <button 
          onClick={handleAddToCart}
          disabled={actionLoading || cartLoading}
          className={`flex-[0.3] flex items-center justify-center bg-[#111] hover:bg-[#1a1a1a] border border-[#333] text-white font-bold py-4 px-4 rounded-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 ${cartSuccess ? 'border-emerald-500 text-emerald-500' : ''}`}
          title="Add to Cart"
        >
          {cartLoading ? "..." : (cartSuccess ? "✓" : "🛒")}
        </button>
      </div>

      <button 
        onClick={handleChat}
        disabled={chatLoading}
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-8 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <MessageCircle size={20} />
        {chatLoading ? "connecting..." : "Chat With Seller"}
      </button>
      
      <a 
        href={`mailto:${sellerEmail}?subject=Interested in item: ${productId}`}
        className="text-center text-slate-500 hover:text-slate-300 transition-colors text-sm flex items-center justify-center gap-2 mt-2"
      >
        <Mail size={14} /> Or email {sellerEmail}
      </a>
    </div>
  );
}
