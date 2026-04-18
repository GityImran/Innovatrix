"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  UserCheck, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut 
} from "lucide-react";

const ADMIN_NAV_ITEMS = [
  { href: "/dashboard/admin", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { href: "/dashboard/admin/seller-verification", label: "Seller Verification", icon: <UserCheck size={20} /> },
  { href: "/dashboard/admin/active-sellers", label: "Active Sellers", icon: <Users size={20} /> },
  { href: "/dashboard/admin/analytics", label: "Analytics", icon: <BarChart3 size={20} /> },
  { href: "/dashboard/admin/settings", label: "Settings", icon: <Settings size={20} /> },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onCollapse: (val: boolean) => void;
}

export default function AdminSidebar({ collapsed, onCollapse }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard/admin") return pathname === "/dashboard/admin";
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    // Clear admin cookie
    document.cookie = "userEmail=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    // Normal NextAuth signout
    signOut({ callbackUrl: "/" });
  };

  return (
    <aside style={{ ...s.sidebar, width: collapsed ? "72px" : "240px" }}>
      <div style={s.logoArea}>
        {!collapsed && (
          <Link href="/" style={s.logoText}>
            Campus<span style={s.logoAccent}>Mart</span>
            <span style={s.logoBadge}>Admin</span>
          </Link>
        )}
        <button
          style={s.collapseBtn}
          onClick={() => onCollapse(!collapsed)}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? "›" : "‹"}
        </button>
      </div>

      <nav style={s.nav}>
        {ADMIN_NAV_ITEMS.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            style={{
              ...s.navItem,
              ...(isActive(href) ? s.navItemActive : s.navItemInactive),
              justifyContent: collapsed ? "center" : "flex-start",
            }}
            title={collapsed ? label : undefined}
          >
            <span style={s.navIcon}>{icon}</span>
            {!collapsed && <span style={s.navLabel}>{label}</span>}
            {isActive(href) && <span style={s.activeBar} />}
          </Link>
        ))}
      </nav>

      <div style={s.logoutArea}>
        <button
          style={{
            ...s.logoutBtn,
            justifyContent: collapsed ? "center" : "flex-start",
          }}
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
        >
          <span style={s.navIcon}><LogOut size={20} /></span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

const s: Record<string, React.CSSProperties> = {
  sidebar: {
    height: "100vh",
    backgroundColor: "#0a0a0a",
    borderRight: "1px solid #1f1f1f",
    display: "flex",
    flexDirection: "column",
    transition: "width 0.25s ease",
    flexShrink: 0,
    position: "sticky",
    top: 0,
    zIndex: 40,
    overflow: "hidden",
  },
  logoArea: {
    height: "64px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 1rem",
    borderBottom: "1px solid #1f1f1f",
    gap: "0.5rem",
    flexShrink: 0,
  },
  logoText: {
    fontSize: "1.1rem",
    fontWeight: 800,
    color: "#f8fafc",
    textDecoration: "none",
    whiteSpace: "nowrap",
    display: "flex",
    alignItems: "baseline",
    gap: "4px",
  },
  logoAccent: {
    color: "#f59e0b",
  },
  logoBadge: {
    fontSize: "0.6rem",
    fontWeight: 700,
    backgroundColor: "#ef4444",
    color: "#fff",
    borderRadius: "4px",
    padding: "1px 5px",
    marginLeft: "4px",
    verticalAlign: "middle",
  },
  collapseBtn: {
    background: "transparent",
    border: "1px solid #2a2a2a",
    color: "#94a3b8",
    borderRadius: "6px",
    width: "28px",
    height: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "1.1rem",
    flexShrink: 0,
    transition: "border-color 0.2s",
  },
  nav: {
    flex: 1,
    padding: "0.75rem 0",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    overflowY: "auto",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.65rem 1rem",
    textDecoration: "none",
    fontSize: "0.875rem",
    fontWeight: 500,
    transition: "background-color 0.15s",
    position: "relative",
    margin: "0 0.5rem",
    borderRadius: "8px",
  },
  navItemActive: {
    backgroundColor: "rgba(245,158,11,0.12)",
    color: "#f59e0b",
  },
  navItemInactive: {
    color: "#94a3b8",
  },
  navIcon: {
    fontSize: "1.1rem",
    flexShrink: 0,
    width: "20px",
    textAlign: "center",
  },
  navLabel: {
    whiteSpace: "nowrap",
    overflow: "hidden",
  },
  activeBar: {
    position: "absolute",
    right: 0,
    top: "20%",
    height: "60%",
    width: "3px",
    backgroundColor: "#f59e0b",
    borderRadius: "2px 0 0 2px",
  },
  logoutArea: {
    padding: "0.75rem 0.5rem",
    borderTop: "1px solid #1f1f1f",
    flexShrink: 0,
  },
  logoutBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.65rem 1rem",
    backgroundColor: "transparent",
    border: "none",
    color: "#ef4444",
    fontSize: "0.875rem",
    fontWeight: 500,
    cursor: "pointer",
    borderRadius: "8px",
    transition: "background-color 0.15s",
  },
};
