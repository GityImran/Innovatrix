/**
 * app/(auth)/login/page.tsx
 * Login page — matches the dark amber e-commerce theme.
 * Uses NextAuth signIn("credentials") with client-side form handling.
 */

"use client";

import { useState, FormEvent, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={styles.page}>
        <div style={styles.glow} />
        <div style={styles.card}>
          <div style={{ textAlign: "center", color: "#94a3b8" }}>Loading...</div>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read ?error= from URL (NextAuth puts error here on redirect)
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    urlError === "CredentialsSignin" ? "Invalid email or password" : null
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Admin Credentials check
    if (email === "admin@college.edu" && password === "admin123") {
      document.cookie = `userEmail=${email}; path=/`;
      router.push("/dashboard/admin");
      setLoading(false);
      return;
    }

    // Show specific error for admin email with wrong password
    if (email === "admin@college.edu") {
      setError("Invalid admin credentials");
      setLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, // Handle redirect manually for better error UX
      });

      if (result?.error) {
        // Map NextAuth error codes to human-readable messages
        setError(
          result.error === "CredentialsSignin"
            ? "Invalid email or password"
            : result.error
        );
      } else {
        // Success → navigate to home
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      {/* Background ambient glow */}
      <div style={styles.glow} />

      <div style={styles.card}>
        {/* Logo / Brand */}
        <div style={styles.brand}>
          <span style={styles.brandIcon}>♻️</span>
          <span style={styles.brandName}>CircularCampus</span>
        </div>

        <h1 style={styles.heading}>Welcome back</h1>
        <p style={styles.subheading}>Sign in to your account to continue</p>

        {/* Error Alert */}
        {error && (
          <div style={styles.errorAlert} role="alert">
            <span style={styles.errorIcon}>⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          {/* Email */}
          <div style={styles.fieldGroup}>
            <label htmlFor="login-email" style={styles.label}>
              College Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@college.edu"
              required
              autoComplete="email"
              style={styles.input}
              onFocus={(e) =>
                Object.assign(e.target.style, styles.inputFocus)
              }
              onBlur={(e) =>
                Object.assign(e.target.style, styles.inputBlur)
              }
            />
          </div>

          {/* Password */}
          <div style={styles.fieldGroup}>
            <label htmlFor="login-password" style={styles.label}>
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              style={styles.input}
              onFocus={(e) =>
                Object.assign(e.target.style, styles.inputFocus)
              }
              onBlur={(e) =>
                Object.assign(e.target.style, styles.inputBlur)
              }
            />
          </div>

          {/* Submit */}
          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
          >
            {loading ? (
              <span style={styles.buttonInner}>
                <span style={styles.spinner} />
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p style={styles.footer}>
          Don&apos;t have an account?{" "}
          <Link href="/register" style={styles.link}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Inline styles — dark amber e-commerce theme
   ------------------------------------------------------------------ */
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#000000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    position: "relative",
    overflow: "hidden",
  },
  glow: {
    position: "absolute",
    top: "-200px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "600px",
    height: "600px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  card: {
    width: "100%",
    maxWidth: "440px",
    backgroundColor: "#121212",
    border: "1px solid #262626",
    borderRadius: "16px",
    padding: "2.5rem",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.8)",
    backdropFilter: "blur(12px)",
    position: "relative",
    zIndex: 1,
    animation: "fadeInUp 0.4s ease-out",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "1.75rem",
  },
  brandIcon: { fontSize: "1.5rem" },
  brandName: {
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "#f59e0b",
    letterSpacing: "-0.02em",
  },
  heading: {
    fontSize: "1.875rem",
    fontWeight: 800,
    color: "#f8fafc",
    marginBottom: "0.375rem",
    letterSpacing: "-0.03em",
  },
  subheading: {
    fontSize: "0.9rem",
    color: "#94a3b8",
    marginBottom: "1.75rem",
  },
  errorAlert: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    backgroundColor: "rgba(220,38,38,0.12)",
    border: "1px solid rgba(220,38,38,0.3)",
    borderRadius: "8px",
    padding: "0.75rem 1rem",
    color: "#fca5a5",
    fontSize: "0.875rem",
    marginBottom: "1.25rem",
  },
  errorIcon: { fontSize: "1rem" },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  label: {
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "#cbd5e1",
    letterSpacing: "0.01em",
  },
  input: {
    width: "100%",
    padding: "0.75rem 1rem",
    backgroundColor: "#0a0a0a",
    border: "1px solid #333333",
    borderRadius: "8px",
    color: "#f8fafc",
    fontSize: "0.95rem",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    fontFamily: "inherit",
  },
  inputFocus: {
    borderColor: "#f59e0b",
    boxShadow: "0 0 0 3px rgba(245,158,11,0.15)",
  },
  inputBlur: {
    borderColor: "#333333",
    boxShadow: "none",
  },
  button: {
    width: "100%",
    padding: "0.875rem",
    backgroundColor: "#f59e0b",
    color: "#000000",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: 700,
    cursor: "pointer",
    marginTop: "0.5rem",
    transition: "background-color 0.2s, transform 0.1s",
    fontFamily: "inherit",
  },
  buttonDisabled: {
    backgroundColor: "#78716c",
    cursor: "not-allowed",
  },
  buttonInner: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  spinner: {
    display: "inline-block",
    width: "16px",
    height: "16px",
    border: "2px solid #000",
    borderTopColor: "transparent",
    borderRadius: "50%",
    animation: "spin 0.6s linear infinite",
  },
  footer: {
    marginTop: "1.5rem",
    textAlign: "center",
    fontSize: "0.875rem",
    color: "#94a3b8",
    marginBottom: 0,
  },
  link: {
    color: "#f59e0b",
    fontWeight: 600,
    textDecoration: "none",
  },
};
