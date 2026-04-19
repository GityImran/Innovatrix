import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import TradeClient from "./TradeClient";

export const metadata = {
  title: "Campus Trading Hub — CampusMart",
  description: "Exchange items directly with other students. Propose trades, accept deals, and meet on campus — no cash needed.",
};

/**
 * /trade — Server Component shell.
 * Renders Header/Footer on the server (keeps Node.js-only deps off the client bundle),
 * then mounts the fully-interactive TradeClient component.
 */
export default function TradePage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#080808", color: "#e2e8f0" }}>
      <Header />
      <TradeClient />
      <Footer />
    </div>
  );
}
