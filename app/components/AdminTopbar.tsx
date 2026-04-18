"use client";

import React from "react";
import { Bell, User } from "lucide-react";

export default function AdminTopbar() {
  return (
    <header style={s.topbar}>
      <div style={s.left}>
        <h2 style={s.title}>Admin Dashboard</h2>
      </div>
      <div style={s.right}>
        <button style={s.iconBtn} title="Notifications">
          <Bell size={20} />
          <span style={s.notificationBadge} />
        </button>
        <div style={s.profile}>
          <div style={s.avatar}>
            <User size={20} />
          </div>
          <div style={s.adminInfo}>
            <span style={s.adminName}>Admin</span>
            <span style={s.adminRole}>Super Admin</span>
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
    padding: "0 2rem",
    position: "sticky",
    top: 0,
    zIndex: 30,
  },
  left: {
    display: "flex",
    alignItems: "center",
  },
  title: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#f8fafc",
    margin: 0,
    letterSpacing: "-0.02em",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "1.25rem",
  },
  iconBtn: {
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px",
    borderRadius: "8px",
    transition: "all 0.2s",
    position: "relative",
  } as React.CSSProperties,
  notificationBadge: {
    position: "absolute",
    top: "6px",
    right: "6px",
    width: "8px",
    height: "8px",
    backgroundColor: "#ef4444",
    borderRadius: "50%",
    border: "2px solid #0a0a0a",
  },
  profile: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "4px 8px",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  } as React.CSSProperties,
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    backgroundColor: "rgba(245,158,11,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#f59e0b",
    border: "1px solid rgba(245,158,11,0.2)",
  },
  adminInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  adminName: {
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "#f8fafc",
    lineHeight: 1,
  },
  adminRole: {
    fontSize: "0.75rem",
    color: "#64748b",
    lineHeight: 1,
  },
};
