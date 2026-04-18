"use client";

import React from "react";

export default function AdminTopbar() {
  return (
    <header style={s.topbar}>
      <div style={s.left}>
        <h2 style={s.title}>Admin Dashboard</h2>
      </div>
      <div style={s.right}>
        <button style={s.iconBtn} title="Notifications">
          <span style={s.icon}>🔔</span>
        </button>
        <div style={s.profile}>
          <div style={s.avatar}>
            <span style={s.avatarText}>AD</span>
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
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#f8fafc",
    margin: 0,
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
  },
  iconBtn: {
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    fontSize: "1.25rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px",
    borderRadius: "6px",
    transition: "background-color 0.2s, color 0.2s",
  },
  icon: {
    fontSize: "1.2rem",
  },
  profile: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#f59e0b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#000",
    fontWeight: 700,
    fontSize: "0.85rem",
  },
  avatarText: {
    letterSpacing: "0.05em",
  },
};
