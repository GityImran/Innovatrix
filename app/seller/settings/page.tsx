/**
 * app/seller/settings/page.tsx
 * Settings — Profile form pre-filled from session, with save + success state.
 */

"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useSession, signOut } from "next-auth/react";

interface ProfileForm {
  name: string;
  email: string;
  phone: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
}

export default function SettingsPage() {
  const { data: session, update } = useSession();

  const [form, setForm] = useState<ProfileForm>({ name: "", email: "", phone: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<"profile" | "security" | "notifications">("profile");

  /* Pre-fill from session */
  useEffect(() => {
    if (session?.user) {
      setForm({
        name: session.user.name ?? "",
        email: session.user.email ?? "",
        phone: "",
      });
    }
  }, [session]);

  const setField = (key: keyof ProfileForm) => (value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
    setSaved(false);
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = "Name is required.";
    else if (form.name.trim().length < 2) errs.name = "Name must be at least 2 characters.";
    if (!form.email.trim()) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email address.";
    if (form.phone && !/^\+?[0-9\s\-()]{7,15}$/.test(form.phone))
      errs.phone = "Enter a valid phone number.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    // Simulate API call — replace with real PATCH /api/profile
    await new Promise((r) => setTimeout(r, 1000));
    // Optionally update session name
    await update({ name: form.name.trim() }).catch(() => {});
    setSaving(false);
    setSaved(true);
    // Auto-hide success after 4s
    setTimeout(() => setSaved(false), 4000);
  };

  const isDirty =
    form.name !== (session?.user?.name ?? "") ||
    form.email !== (session?.user?.email ?? "") ||
    form.phone !== "";

  const avatarLetter = (form.name || session?.user?.name || "S")[0].toUpperCase();

  return (
    <div style={s.page}>

      {/* ── Page Header ── */}
      <div>
        <h1 style={s.title}>Settings</h1>
        <p style={s.subtitle}>Manage your seller account and preferences</p>
      </div>

      <div style={s.layout}>

        {/* ── Sidebar Tabs ── */}
        <aside style={s.tabSidebar}>
          {([
            { key: "profile",       label: "Profile",       icon: "👤" },
            { key: "security",      label: "Security",      icon: "🔒" },
            { key: "notifications", label: "Notifications", icon: "🔔" },
          ] as const).map(({ key, label, icon }) => (
            <button
              key={key}
              style={{
                ...s.sideTab,
                ...(activeSection === key ? s.sideTabActive : s.sideTabInactive),
              }}
              onClick={() => setActiveSection(key)}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          ))}

          <div style={s.sideTabDivider} />

          <button
            style={s.logoutTab}
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </aside>

        {/* ── Main Content ── */}
        <div style={s.content}>

          {/* ════ PROFILE SECTION ════ */}
          {activeSection === "profile" && (
            <form onSubmit={handleSave} style={s.form} noValidate>

              {/* Avatar strip */}
              <div style={s.avatarStrip}>
                <div style={s.avatar}>{avatarLetter}</div>
                <div>
                  <p style={s.avatarName}>{form.name || "Your Name"}</p>
                  <p style={s.avatarRole}>Seller · CampusMart</p>
                </div>
              </div>

              {/* Success Banner */}
              {saved && (
                <div style={s.successBanner} role="status">
                  <span style={{ fontSize: "1.1rem" }}>✅</span>
                  <div>
                    <p style={s.successTitle}>Profile updated successfully!</p>
                    <p style={s.successSub}>Your changes have been saved.</p>
                  </div>
                </div>
              )}

              {/* Form card */}
              <div style={s.card}>
                <p style={s.cardHeading}>👤 Personal Information</p>

                {/* Name */}
                <div style={s.field}>
                  <label style={s.label} htmlFor="st-name">
                    Full Name <span style={s.req}>*</span>
                  </label>
                  <input
                    id="st-name"
                    type="text"
                    value={form.name}
                    placeholder="Your full name"
                    onChange={(e) => setField("name")(e.target.value)}
                    style={{ ...s.input, ...(errors.name ? s.inputErr : {}) }}
                    onFocus={(e) => Object.assign(e.target.style, s.inputFocus)}
                    onBlur={(e) =>
                      Object.assign(
                        e.target.style,
                        errors.name ? { ...s.input, ...s.inputErr } : s.input
                      )
                    }
                  />
                  {errors.name && <p style={s.errMsg}>{errors.name}</p>}
                </div>

                {/* Email */}
                <div style={s.field}>
                  <label style={s.label} htmlFor="st-email">
                    Email Address <span style={s.req}>*</span>
                  </label>
                  <input
                    id="st-email"
                    type="email"
                    value={form.email}
                    placeholder="you@college.edu"
                    onChange={(e) => setField("email")(e.target.value)}
                    style={{ ...s.input, ...(errors.email ? s.inputErr : {}) }}
                    onFocus={(e) => Object.assign(e.target.style, s.inputFocus)}
                    onBlur={(e) =>
                      Object.assign(
                        e.target.style,
                        errors.email ? { ...s.input, ...s.inputErr } : s.input
                      )
                    }
                  />
                  {errors.email && <p style={s.errMsg}>{errors.email}</p>}
                </div>

                {/* Phone */}
                <div style={s.field}>
                  <label style={s.label} htmlFor="st-phone">
                    Phone Number
                    <span style={s.optional}> — optional</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <span style={s.phonePrefix}>+91</span>
                    <input
                      id="st-phone"
                      type="tel"
                      value={form.phone}
                      placeholder="9876543210"
                      onChange={(e) => setField("phone")(e.target.value)}
                      style={{
                        ...s.input,
                        paddingLeft: "3rem",
                        ...(errors.phone ? s.inputErr : {}),
                      }}
                      onFocus={(e) => Object.assign(e.target.style, { ...s.input, paddingLeft: "3rem", ...s.inputFocus })}
                      onBlur={(e) =>
                        Object.assign(
                          e.target.style,
                          errors.phone
                            ? { ...s.input, paddingLeft: "3rem", ...s.inputErr }
                            : { ...s.input, paddingLeft: "3rem" }
                        )
                      }
                    />
                  </div>
                  {errors.phone && <p style={s.errMsg}>{errors.phone}</p>}
                  <p style={s.fieldHint}>Used for buyer contact and order coordination</p>
                </div>
              </div>

              {/* Actions */}
              <div style={s.actions}>
                <button
                  type="button"
                  style={s.btnReset}
                  onClick={() =>
                    setForm({
                      name: session?.user?.name ?? "",
                      email: session?.user?.email ?? "",
                      phone: "",
                    })
                  }
                  disabled={saving || !isDirty}
                >
                  Reset
                </button>
                <button
                  id="settings-save-btn"
                  type="submit"
                  style={{
                    ...s.btnSave,
                    ...(!isDirty || saving ? s.btnSaveDisabled : {}),
                  }}
                  disabled={!isDirty || saving}
                >
                  {saving ? (
                    <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={s.spinner} /> Saving…
                    </span>
                  ) : saved ? (
                    "✓ Saved!"
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ════ SECURITY (placeholder) ════ */}
          {activeSection === "security" && (
            <div style={s.placeholderCard}>
              <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🔒</div>
              <p style={s.placeholderTitle}>Security Settings</p>
              <p style={s.placeholderDesc}>
                Password change and two-factor authentication will be available here once backend authentication is fully configured.
              </p>
            </div>
          )}

          {/* ════ NOTIFICATIONS (placeholder) ════ */}
          {activeSection === "notifications" && (
            <div style={s.card}>
              <p style={s.cardHeading}>🔔 Notification Preferences</p>

              {[
                { label: "New Order Alerts", desc: "Notify me when a buyer places an order", enabled: true },
                { label: "Order Status Updates", desc: "Updates when an order status changes", enabled: true },
                { label: "Weekly Earnings Report", desc: "Get a weekly summary of your earnings", enabled: false },
                { label: "Promotional Announcements", desc: "Platform news and tips for sellers", enabled: false },
              ].map(({ label, desc, enabled }) => (
                <NotifRow key={label} label={label} desc={desc} defaultEnabled={enabled} />
              ))}

              <p style={s.notifNote}>
                ℹ️ Email delivery will be active once backend notification services are integrated.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/* ── Notification toggle row ── */
function NotifRow({ label, desc, defaultEnabled }: { label: string; desc: string; defaultEnabled: boolean }) {
  const [on, setOn] = useState(defaultEnabled);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", padding: "0.5rem 0", borderBottom: "1px solid #1a1a1a" }}>
      <div>
        <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#e2e8f0", margin: "0 0 0.15rem" }}>{label}</p>
        <p style={{ fontSize: "0.75rem", color: "#4b5563", margin: 0 }}>{desc}</p>
      </div>
      <button
        type="button"
        onClick={() => setOn((p) => !p)}
        style={{
          width: "44px", height: "24px", borderRadius: "12px", border: "none",
          cursor: "pointer", position: "relative", transition: "background-color 0.25s",
          backgroundColor: on ? "#f59e0b" : "#374151", flexShrink: 0, padding: 0,
        }}
        aria-pressed={on}
      >
        <span style={{
          position: "absolute", top: "2px", width: "20px", height: "20px",
          borderRadius: "50%", backgroundColor: "#fff", transition: "left 0.25s",
          left: on ? "22px" : "2px", display: "block",
        }} />
      </button>
    </div>
  );
}

/* ── Styles ── */
const s: Record<string, React.CSSProperties> = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    maxWidth: "1000px",
    margin: "0 auto",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: 800,
    color: "#f8fafc",
    letterSpacing: "-0.02em",
  },
  subtitle: { fontSize: "0.8rem", color: "#64748b", marginTop: "0.2rem" },
  layout: {
    display: "flex",
    gap: "1.5rem",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  /* Sidebar tabs */
  tabSidebar: {
    width: "200px",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    backgroundColor: "#121212",
    border: "1px solid #1f1f1f",
    borderRadius: "14px",
    padding: "0.75rem 0.5rem",
  },
  sideTab: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    padding: "0.6rem 0.9rem",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: 600,
    fontFamily: "inherit",
    transition: "all 0.2s",
    width: "100%",
    textAlign: "left",
  },
  sideTabActive: {
    backgroundColor: "rgba(245,158,11,0.12)",
    color: "#f59e0b",
  },
  sideTabInactive: {
    backgroundColor: "transparent",
    color: "#64748b",
  },
  sideTabDivider: {
    borderTop: "1px solid #1f1f1f",
    margin: "0.5rem 0",
  },
  logoutTab: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    padding: "0.6rem 0.9rem",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: 600,
    fontFamily: "inherit",
    backgroundColor: "transparent",
    color: "#ef4444",
    width: "100%",
    textAlign: "left",
    transition: "all 0.2s",
  },
  /* Content area */
  content: { flex: 1, minWidth: "300px", display: "flex", flexDirection: "column", gap: "1.25rem" },
  form: { display: "flex", flexDirection: "column", gap: "1.25rem" },
  /* Avatar */
  avatarStrip: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "1.25rem 1.5rem",
    backgroundColor: "#121212",
    border: "1px solid #1f1f1f",
    borderRadius: "14px",
  },
  avatar: {
    width: "56px",
    height: "56px",
    borderRadius: "14px",
    backgroundColor: "#f59e0b",
    color: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
    fontWeight: 900,
    flexShrink: 0,
  },
  avatarName: { fontSize: "1.05rem", fontWeight: 800, color: "#f8fafc", margin: "0 0 0.2rem" },
  avatarRole: { fontSize: "0.75rem", color: "#f59e0b", margin: 0, fontWeight: 600 },
  /* Success */
  successBanner: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.75rem",
    padding: "1rem 1.25rem",
    backgroundColor: "rgba(16,185,129,0.08)",
    border: "1px solid rgba(16,185,129,0.25)",
    borderRadius: "12px",
    animation: "fadeInUp 0.3s ease",
  },
  successTitle: { fontSize: "0.875rem", fontWeight: 700, color: "#10b981", margin: "0 0 0.1rem" },
  successSub: { fontSize: "0.775rem", color: "#4b5563", margin: 0 },
  /* Card */
  card: {
    backgroundColor: "#121212",
    border: "1px solid #1f1f1f",
    borderRadius: "14px",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.1rem",
  },
  cardHeading: {
    fontSize: "0.9rem",
    fontWeight: 700,
    color: "#e2e8f0",
    margin: 0,
    paddingBottom: "0.75rem",
    borderBottom: "1px solid #1f1f1f",
  },
  /* Fields */
  field: { display: "flex", flexDirection: "column", gap: "0.35rem" },
  label: { fontSize: "0.85rem", fontWeight: 700, color: "#cbd5e1" },
  req: { color: "#f87171" },
  optional: { color: "#4b5563", fontWeight: 400 },
  input: {
    width: "100%",
    padding: "0.7rem 1rem",
    backgroundColor: "#0a0a0a",
    border: "1px solid #2a2a2a",
    borderRadius: "8px",
    color: "#f8fafc",
    fontSize: "0.875rem",
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  inputFocus: { borderColor: "#f59e0b", boxShadow: "0 0 0 3px rgba(245,158,11,0.12)" },
  inputErr: { borderColor: "#ef4444", boxShadow: "0 0 0 3px rgba(239,68,68,0.1)" },
  errMsg: { fontSize: "0.75rem", color: "#f87171", margin: 0 },
  phonePrefix: {
    position: "absolute",
    left: "1rem",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "0.875rem",
    color: "#64748b",
    pointerEvents: "none",
    zIndex: 1,
  },
  fieldHint: { fontSize: "0.7rem", color: "#374151", margin: 0 },
  /* Action buttons */
  actions: { display: "flex", gap: "0.75rem", justifyContent: "flex-end" },
  btnSave: {
    padding: "0.7rem 1.75rem",
    backgroundColor: "#f59e0b",
    color: "#000",
    border: "none",
    borderRadius: "10px",
    fontSize: "0.9rem",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    minWidth: "140px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    transition: "background-color 0.2s",
  },
  btnSaveDisabled: { backgroundColor: "#1f2937", color: "#4b5563", cursor: "not-allowed" },
  btnReset: {
    padding: "0.7rem 1.25rem",
    backgroundColor: "transparent",
    color: "#64748b",
    border: "1px solid #1f1f1f",
    borderRadius: "10px",
    fontSize: "0.875rem",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.2s",
  },
  spinner: {
    display: "inline-block",
    width: "14px",
    height: "14px",
    border: "2px solid #000",
    borderTopColor: "transparent",
    borderRadius: "50%",
    animation: "spin 0.6s linear infinite",
  },
  /* Placeholder */
  placeholderCard: {
    backgroundColor: "#121212",
    border: "1px dashed #2a2a2a",
    borderRadius: "14px",
    padding: "3rem 2rem",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  placeholderTitle: { fontSize: "1rem", fontWeight: 700, color: "#f8fafc", margin: "0 0 0.35rem" },
  placeholderDesc: { fontSize: "0.85rem", color: "#4b5563", maxWidth: "320px", margin: 0 },
  notifNote: { fontSize: "0.75rem", color: "#374151", margin: 0, paddingTop: "0.5rem" },
};
