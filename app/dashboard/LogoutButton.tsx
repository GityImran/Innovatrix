/**
 * app/dashboard/LogoutButton.tsx
 * Client component for the logout button.
 * Must be a "use client" component because it uses the onClick handler.
 * Calls NextAuth signOut() which clears the JWT cookie and redirects to /login.
 */

"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      id="logout-btn"
      onClick={() =>
        signOut({
          callbackUrl: "/", // Redirect here after logout
        })
      }
      style={styles.button}
      onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.buttonHover)}
      onMouseLeave={(e) => Object.assign(e.currentTarget.style, styles.buttonBase)}
    >
      Sign Out
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  button: {
    padding: "0.5rem 1.25rem",
    backgroundColor: "transparent",
    color: "#f59e0b",
    border: "1px solid #f59e0b",
    borderRadius: "8px",
    fontSize: "0.875rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background-color 0.2s, color 0.2s",
    fontFamily: "inherit",
  },
  buttonBase: {
    backgroundColor: "transparent",
    color: "#f59e0b",
  },
  buttonHover: {
    backgroundColor: "#f59e0b",
    color: "#000000",
  },
};
