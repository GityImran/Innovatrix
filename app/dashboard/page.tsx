/**
 * app/dashboard/page.tsx
 * Protected dashboard — only accessible to authenticated users.
 *
 * Uses `auth()` (server-side) from NextAuth v5 to check the session.
 * Unauthenticated users are redirected to /login.
 * Shows the logged-in user's name and email, plus a logout button.
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LogoutButton from "@/app/dashboard/LogoutButton";

export const metadata = {
  title: "Dashboard | CircularCampus",
  description: "Your CircularCampus account dashboard",
};

export default async function DashboardPage() {
  // Server-side session check
  const session = await auth();

  if (!session || !session.user) {
    // No valid JWT session → send to login
    redirect("/login");
  }

  const { name, email, id } = session.user as {
    name: string;
    email: string;
    id: string;
  };

  return (
    <div style={styles.page}>
      {/* Background ambient glow */}
      <div style={styles.glow} />

      <div style={styles.container}>
        {/* Header bar */}
        <header style={styles.header}>
          <div style={styles.brand}>
            <span style={styles.brandIcon}>♻️</span>
            <span style={styles.brandName}>CircularCampus</span>
          </div>
          <LogoutButton />
        </header>

        {/* Welcome Section */}
        <section style={styles.heroSection}>
          <div style={styles.avatarWrapper}>
            <div style={styles.avatar}>
              {name ? name[0].toUpperCase() : "?"}
            </div>
          </div>
          <h1 style={styles.welcomeHeading}>Welcome back, {name}! 👋</h1>
          <p style={styles.welcomeSub}>
            You&apos;re signed in and your session is active.
          </p>
        </section>

        {/* User Info Card */}
        <div style={styles.infoCard}>
          <h2 style={styles.cardTitle}>Account Details</h2>
          <div style={styles.infoGrid}>
            <InfoRow label="Full Name" value={name} icon="👤" />
            <InfoRow label="College Email" value={email} icon="📧" />
            <InfoRow label="User ID" value={id} icon="🔑" monospace />
            <InfoRow
              label="Session Type"
              value="JWT (Stateless)"
              icon="🛡️"
              highlight
            />
          </div>
        </div>

        {/* Stats Row */}
        <div style={styles.statsRow}>
          <StatCard icon="📦" label="My Listings" value="0" />
          <StatCard icon="🛒" label="Purchases" value="0" />
          <StatCard icon="⭐" label="Reviews" value="0" />
        </div>

        {/* JWT Info Banner */}
        <div style={styles.jwtBanner}>
          <span style={styles.jwtIcon}>🔐</span>
          <div>
            <p style={styles.jwtTitle}>Secured with JWT Authentication</p>
            <p style={styles.jwtSub}>
              Your session is stored in a signed HTTP-only cookie — no database lookup required on each request.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Sub-components
   ------------------------------------------------------------------ */

function InfoRow({
  label,
  value,
  icon,
  monospace,
  highlight,
}: {
  label: string;
  value: string;
  icon: string;
  monospace?: boolean;
  highlight?: boolean;
}) {
  return (
    <div style={styles.infoRow}>
      <div style={styles.infoRowLeft}>
        <span style={styles.infoIcon}>{icon}</span>
        <span style={styles.infoLabel}>{label}</span>
      </div>
      <span
        style={{
          ...styles.infoValue,
          ...(monospace ? styles.mono : {}),
          ...(highlight ? styles.highlightValue : {}),
        }}
      >
        {value}
      </span>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div style={styles.statCard}>
      <span style={styles.statIcon}>{icon}</span>
      <span style={styles.statValue}>{value}</span>
      <span style={styles.statLabel}>{label}</span>
    </div>
  );
}

/* ------------------------------------------------------------------
   Styles
   ------------------------------------------------------------------ */
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#000000",
    color: "#f8fafc",
    fontFamily: "var(--font-geist-sans), Arial, sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  glow: {
    position: "fixed",
    top: "-300px",
    right: "-200px",
    width: "700px",
    height: "700px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  container: {
    maxWidth: "860px",
    margin: "0 auto",
    padding: "2rem 1.5rem 4rem",
    position: "relative",
    zIndex: 1,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "3rem",
    paddingBottom: "1.25rem",
    borderBottom: "1px solid #1e1e1e",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  brandIcon: { fontSize: "1.5rem" },
  brandName: {
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "#f59e0b",
  },
  heroSection: {
    textAlign: "center",
    marginBottom: "2.5rem",
  },
  avatarWrapper: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "1rem",
  },
  avatar: {
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    backgroundColor: "#f59e0b",
    color: "#000",
    fontSize: "2rem",
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 0 4px rgba(245,158,11,0.2)",
  },
  welcomeHeading: {
    fontSize: "2rem",
    fontWeight: 800,
    color: "#f8fafc",
    letterSpacing: "-0.03em",
    marginBottom: "0.5rem",
  },
  welcomeSub: {
    color: "#64748b",
    fontSize: "0.95rem",
    marginBottom: 0,
  },
  infoCard: {
    backgroundColor: "#121212",
    border: "1px solid #1e1e1e",
    borderRadius: "14px",
    padding: "1.75rem",
    marginBottom: "1.25rem",
  },
  cardTitle: {
    fontSize: "0.8rem",
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    marginBottom: "1.25rem",
  },
  infoGrid: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.75rem 0",
    borderBottom: "1px solid #1a1a1a",
  },
  infoRowLeft: {
    display: "flex",
    alignItems: "center",
    gap: "0.625rem",
  },
  infoIcon: { fontSize: "1rem" },
  infoLabel: {
    fontSize: "0.875rem",
    color: "#94a3b8",
    fontWeight: 500,
  },
  infoValue: {
    fontSize: "0.9rem",
    color: "#e2e8f0",
    fontWeight: 600,
  },
  mono: {
    fontFamily: "var(--font-geist-mono), monospace",
    fontSize: "0.75rem",
    color: "#64748b",
    wordBreak: "break-all" as const,
    maxWidth: "200px",
    textAlign: "right" as const,
  },
  highlightValue: {
    color: "#10b981",
    backgroundColor: "rgba(16,185,129,0.08)",
    padding: "0.2rem 0.6rem",
    borderRadius: "20px",
    fontSize: "0.8rem",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1rem",
    marginBottom: "1.25rem",
  },
  statCard: {
    backgroundColor: "#121212",
    border: "1px solid #1e1e1e",
    borderRadius: "12px",
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "0.25rem",
  },
  statIcon: { fontSize: "1.5rem", marginBottom: "0.25rem" },
  statValue: {
    fontSize: "1.75rem",
    fontWeight: 800,
    color: "#f59e0b",
  },
  statLabel: {
    fontSize: "0.8rem",
    color: "#64748b",
    fontWeight: 500,
  },
  jwtBanner: {
    display: "flex",
    alignItems: "flex-start",
    gap: "1rem",
    backgroundColor: "rgba(245,158,11,0.06)",
    border: "1px solid rgba(245,158,11,0.15)",
    borderRadius: "12px",
    padding: "1.25rem 1.5rem",
  },
  jwtIcon: { fontSize: "1.5rem", flexShrink: 0 },
  jwtTitle: {
    fontSize: "0.875rem",
    fontWeight: 700,
    color: "#fbbf24",
    marginBottom: "0.25rem",
  },
  jwtSub: {
    fontSize: "0.8rem",
    color: "#78716c",
    lineHeight: "1.5",
    marginBottom: 0,
  },
};
