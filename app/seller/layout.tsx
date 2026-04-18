/**
 * app/seller/layout.tsx
 * Seller dashboard layout — sidebar + topbar, no global site header.
 */

"use client";

import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/seller": "Dashboard Overview",
  "/seller/add-product": "Add Product",
  "/seller/rent": "List Item for Rent",
  "/seller/products": "Listed Products",
  "/seller/orders": "Orders",
  "/seller/earnings": "Earnings",
  "/seller/settings": "Settings",
};

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const pageTitle = PAGE_TITLES[pathname] ?? "Seller Dashboard";

  // Don't show sidebar/topbar on the registration/status page
  if (pathname === "/seller/register") {
    return <>{children}</>;
  }

  return (
    <div style={s.shell}>
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />

      <div style={s.main}>
        <Topbar pageTitle={pageTitle} />
        <main style={s.content}>{children}</main>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  shell: {
    display: "flex",
    height: "100vh",
    overflow: "hidden",
    backgroundColor: "#000",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  content: {
    flex: 1,
    overflowY: "auto",
    padding: "2rem",
    backgroundColor: "#050505",
  },
};
