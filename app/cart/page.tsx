import React from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import CartClient from "./CartClient";

export default function CartPage() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-slate-100">
      <Header />
      <main className="flex-grow">
        <CartClient />
      </main>
      <Footer />
    </div>
  );
}
