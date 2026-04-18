import React from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import CartClient from "./CartClient";

export default function CartPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#080808", color: "#e2e8f0" }}>
      <Header />
      <main style={{ flex: 1 }}>
        <CartClient />
      </main>
      <Footer />
    </div>
  );
}
