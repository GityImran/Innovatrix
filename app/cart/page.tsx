import React from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import CartClient from "./CartClient";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export default async function CartPage() {
  const session = await auth();
  let superCoins = 0;
  if (session?.user?.email) {
    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email }).select("superCoins").lean() as { superCoins?: number } | null;
    if (user && typeof user.superCoins === "number") {
      superCoins = user.superCoins;
    }
  }
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#080808", color: "#e2e8f0" }}>
      <Header />
      <main style={{ flex: 1 }}>
        <CartClient initialSuperCoins={superCoins} />
      </main>
      <Footer />
    </div>
  );
}
