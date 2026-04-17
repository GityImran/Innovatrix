/**
 * app/(auth)/register/page.tsx
 * Registration page — matches the dark amber e-commerce theme.
 * Calls POST /api/register and redirects to /login on success.
 */

"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Client-side validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed. Please try again.");
      } else {
        setSuccess(data.message || "Account created! Redirecting to login...");
        // Redirect to login after short delay to show success message
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
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

        <h1 style={styles.heading}>Create your account</h1>
        <p style={styles.subheading}>
          Join the campus circular economy — save money, reduce waste
        </p>

        {/* Error Alert */}
        {error && (
          <div style={styles.errorAlert} role="alert">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div style={styles.successAlert} role="status">
            <span>✅</span> {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          {/* Full Name */}
          <div style={styles.fieldGroup}>
            <label htmlFor="register-name" style={styles.label}>
              Full Name
            </label>
            <input
              id="register-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rahul Sharma"
              required
              autoComplete="name"
              style={styles.input}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => Object.assign(e.target.style, styles.inputBlur)}
            />
          </div>

          {/* College Email */}
          <div style={styles.fieldGroup}>
            <label htmlFor="register-email" style={styles.label}>
              College Email
            </label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@college.edu"
              required
              autoComplete="email"
              style={styles.input}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => Object.assign(e.target.style, styles.inputBlur)}
            />
          </div>

          {/* Password */}
          <div style={styles.fieldGroup}>
            <label htmlFor="register-password" style={styles.label}>
              Password
            </label>
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              required
              autoComplete="new-password"
              style={styles.input}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => Object.assign(e.target.style, styles.inputBlur)}
            />
          </div>

          {/* Confirm Password */}
          <div style={styles.fieldGroup}>
            <label htmlFor="register-confirm-password" style={styles.label}>
              Confirm Password
            </label>
            <input
              id="register-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              required
              autoComplete="new-password"
              style={styles.input}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => Object.assign(e.target.style, styles.inputBlur)}
            />
          </div>

          {/* Submit */}
          <button
            id="register-submit-btn"
            type="submit"
            disabled={loading || !!success}
            style={
              loading || success
                ? { ...styles.button, ...styles.buttonDisabled }
                : styles.button
            }
          >
            {loading ? (
              <span style={styles.buttonInner}>
                <span style={styles.spinner} />
                Creating account...
              </span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{" "}
          <Link href="/login" style={styles.link}>
            Sign in
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
    background:
      "radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)",
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
    fontSize: "0.875rem",
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
  successAlert: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    backgroundColor: "rgba(16,185,129,0.12)",
    border: "1px solid rgba(16,185,129,0.3)",
    borderRadius: "8px",
    padding: "0.75rem 1rem",
    color: "#6ee7b7",
    fontSize: "0.875rem",
    marginBottom: "1.25rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.1rem",
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
    transition: "background-color 0.2s",
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
