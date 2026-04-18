"use client";

import React, { useState } from "react";
import AdminSidebar from "@/app/components/Sidebar";
import AdminTopbar from "@/app/components/AdminTopbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={s.layout}>
      <AdminSidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <main style={s.main}>
        <AdminTopbar />
        <div style={s.content}>{children}</div>
      </main>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#000",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0, // Prevent flex items from overflowing
  },
  content: {
    padding: "2rem",
    maxWidth: "1200px",
    margin: "0 auto",
    width: "100%",
  },
};
