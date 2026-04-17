"use client";

import React from "react";
import { useSession } from "next-auth/react";

interface TopbarProps {
  pageTitle: string;
}

export default function Topbar({ pageTitle }: TopbarProps) {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] ?? "Seller";

  return (
    <header style={s.topbar}>
      <div style={s.left}>
        <h2 style={s.pageTitle}>{pageTitle}</h2>
      </div>

      <div style={s.right}>
        {/* Notification bell */}
        <button style={s.iconBtn} title="Notifications">
          <span style={{ fontSize: "1.2rem" }}>🔔</span>
          <span style={s.badge}>3</span>
        </button>

        {/* User chip */}
        <div style={s.userChip}>
          <div style={s.avatar}>{firstName[0].toUpperCase()}</div>
          <div style={s.userInfo}>
            <span style={s.userName}>{firstName}</span>
            <span style={s.userRole}>Seller</span>
          </div>
        </div>
      </div>
    </header>
  );
}

const s: Record<string, React.CSSProperties> = {
  topbar: {
    height: "64px",
    backgroundColor: "#0a0a0a",
    borderBottom: "1px solid #1f1f1f",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 1.5rem",
    position: "sticky",
    top: 0,
    zIndex: 30,
    flexShrink: 0,
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  pageTitle: {
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "#f8fafc",
    letterSpacing: "-0.01em",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },

  iconBtn: {
    position: "relative",
    background: "transparent",
    border: "1px solid #2a2a2a",
    borderRadius: "8px",
    width: "38px",
    height: "38px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#94a3b8",
  },
  badge: {
    position: "absolute",
    top: "-4px",
    right: "-4px",
    backgroundColor: "#ef4444",
    color: "#fff",
    fontSize: "0.6rem",
    fontWeight: 700,
    borderRadius: "50%",
    width: "16px",
    height: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  userChip: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.35rem 0.75rem 0.35rem 0.35rem",
    backgroundColor: "#121212",
    border: "1px solid #2a2a2a",
    borderRadius: "10px",
    cursor: "pointer",
  },
  avatar: {
    width: "30px",
    height: "30px",
    borderRadius: "8px",
    backgroundColor: "#f59e0b",
    color: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: "0.9rem",
    flexShrink: 0,
  },
  userInfo: {
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.2,
  },
  userName: {
    fontSize: "0.8rem",
    fontWeight: 700,
    color: "#f8fafc",
  },
  userRole: {
    fontSize: "0.65rem",
    color: "#f59e0b",
    fontWeight: 600,
  },
};
