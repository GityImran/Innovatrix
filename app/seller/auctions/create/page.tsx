import React from "react";
import Header from "@/app/components/Header/Header";
import CategoriesNav from "@/app/components/CategoriesNav/CategoriesNav";
import CreateAuctionForm from "./CreateAuctionForm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function CreateAuctionPage() {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-yellow-500/30 selection:text-yellow-200">
      <Header />
      <CategoriesNav />

      {/* Decorative Glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-yellow-500/5 blur-[150px] rounded-full pointer-events-none opacity-40 mix-blend-screen -z-10" />

      <main className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-yellow-500 mb-6 mx-auto">
            Seller Dashboard
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tighter">
            Launch an <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Auction</span>
          </h1>
          <p className="text-zinc-400 text-lg">Sell your items to the highest bidder in the campus marketplace.</p>
        </div>

        <CreateAuctionForm />
      </main>
    </div>
  );
}
