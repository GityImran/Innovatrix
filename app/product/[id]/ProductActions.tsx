"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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
    <div className="flex gap-4">
      <button 
        onClick={handleAction}
        disabled={actionLoading}
        className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold py-4 px-8 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {actionLoading ? "Processing..." : (type === "sell" ? "Buy Now" : "Request Rental")}
      </button>
      <a 
        href={`mailto:${sellerEmail}?subject=Interested in item id: ${productId}`}
        className="flex-[0.5] flex items-center justify-center bg-[#111] hover:bg-[#1a1a1a] border border-[#333] text-white font-bold py-4 px-4 rounded-xl transition-all hover:scale-[1.02] active:scale-95"
      >
        Contact
      </a>
    </div>
  );
}
