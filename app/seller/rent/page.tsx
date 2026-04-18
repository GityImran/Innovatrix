"use client";

/**
 * app/seller/rent/page.tsx
 * List an item for rent — runs inside the seller layout (sidebar + topbar).
 */

import React, {
  useState,
  useRef,
  useCallback,
  DragEvent,
  ChangeEvent,
  FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { uploadImage } from "@/lib/upload";

type Condition = "new" | "good" | "used";
type Category =
  | ""
  | "Books"
  | "Electronics"
  | "Furniture"
  | "Lab Equipment"
  | "Hostel Supplies"
  | "Others";

interface ImagePreview {
  id: string;
  dataUrl: string;
  file: File;
}

interface FormErrors {
  category?: string;
  title?: string;
  description?: string;
  pricePerDay?: string;
  availableFrom?: string;
  availableTill?: string;
  images?: string;
}

const CATEGORIES: Exclude<Category, "">[] = [
  "Books",
  "Electronics",
  "Furniture",
  "Lab Equipment",
  "Hostel Supplies",
  "Others",
];

export default function RentItemPage() {
  const router = useRouter();

  // ── form state ──────────────────────────────────────────────────────────
  const [category, setCategory] = useState<Category>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState<Condition>("good");
  const [pricePerDay, setPricePerDay] = useState("");
  const [pricePerWeek, setPricePerWeek] = useState("");
  const [pricePerMonth, setPricePerMonth] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableTill, setAvailableTill] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [isUrgent, setIsUrgent] = useState(false);
  const [allowNegotiation, setAllowNegotiation] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── helpers ──────────────────────────────────────────────────────────────
  const clearErr = (key: keyof FormErrors) =>
    setErrors((p) => ({ ...p, [key]: undefined }));

  const readAsDataUrl = (file: File): Promise<string> =>
    new Promise((res) => {
      const r = new FileReader();
      r.onloadend = () => res(r.result as string);
      r.readAsDataURL(file);
    });

  const addFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const previews: ImagePreview[] = await Promise.all(
      valid.map(async (file) => ({
        id: `${Date.now()}-${Math.random()}`,
        dataUrl: await readAsDataUrl(file),
        file,
      }))
    );
    setImages((prev) => [...prev, ...previews]);
    clearErr("images");
  }, []);

  const removeImage = (id: string) =>
    setImages((prev) => prev.filter((i) => i.id !== id));

  const onDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  const onDragLeave = useCallback(() => setIsDragging(false), []);
  const onDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  // ── validation ────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!category) errs.category = "Please select a category.";
    if (!title.trim()) errs.title = "Title is required.";
    if (!description.trim()) errs.description = "Description is required.";
    if (!pricePerDay || Number(pricePerDay) <= 0)
      errs.pricePerDay = "Enter a valid daily price.";
    if (!availableFrom) errs.availableFrom = "Select a start date.";
    if (!availableTill) errs.availableTill = "Select an end date.";
    if (
      availableFrom &&
      availableTill &&
      new Date(availableFrom) > new Date(availableTill)
    )
      errs.availableTill = "End date must be after start date.";
    if (images.length === 0) errs.images = "Upload at least 1 image.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const isFormValid =
    !!category &&
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    Number(pricePerDay) > 0 &&
    !!availableFrom &&
    !!availableTill &&
    images.length > 0;

  // ── submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    try {
      // 1. Upload first image to Cloudinary
      const uploadRes = await uploadImage(images[0].file);

      const payload = {
        category,
        title: title.trim(),
        description: description.trim(),
        condition,
        pricing: {
          day: Number(pricePerDay),
          week: pricePerWeek ? Number(pricePerWeek) : undefined,
          month: pricePerMonth ? Number(pricePerMonth) : undefined,
        },
        availability: {
          from: new Date(availableFrom),
          till: new Date(availableTill),
        },
        securityDeposit: securityDeposit ? Number(securityDeposit) : undefined,
        image: {
          url: uploadRes.imageUrl,
          public_id: uploadRes.publicId,
        },
        isUrgent,
        allowNegotiation,
        status: "active" as const,
      };

      const res = await fetch("/api/seller/rent-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to list item for rent");
      }

      router.push("/seller/products");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      <form onSubmit={handleSubmit} style={s.form} noValidate>

        {/* heading */}
        <div>
          <h1 style={s.pageTitle}>List Item for Rent</h1>
          <p style={s.pageSub}>Fill in the details to rent out your item on campus.</p>
        </div>

        {/* ── BASIC INFO ── */}
        <Section icon="📋" title="Basic Information">
          {/* Category */}
          <Field label="Category" required error={errors.category}>
            <select
              id="ri-category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as Category);
                clearErr("category");
              }}
              style={{ ...s.input, ...s.select, ...(errors.category ? s.errBorder : {}) }}
            >
              <option value="">Select a category…</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>

          {/* Title */}
          <Field label="Item Title" required error={errors.title}>
            <input
              id="ri-title"
              type="text"
              placeholder="e.g. Scientific Calculator — Casio fx-991EX"
              value={title}
              onChange={(e) => { setTitle(e.target.value); clearErr("title"); }}
              style={{ ...s.input, ...(errors.title ? s.errBorder : {}) }}
            />
          </Field>

          {/* Description */}
          <Field label="Description" required error={errors.description}>
            <textarea
              id="ri-desc"
              rows={4}
              placeholder="Describe the item — specs, usage terms, what's included…"
              value={description}
              onChange={(e) => { setDescription(e.target.value); clearErr("description"); }}
              style={{ ...s.textarea, ...(errors.description ? s.errBorder : {}) }}
            />
          </Field>
        </Section>

        {/* ── CONDITION ── */}
        <Section icon="🔖" title="Condition">
          <div style={s.radioRow}>
            {(
              [
                { val: "new" as Condition, label: "New", desc: "Unused / sealed", color: "#10b981" },
                { val: "good" as Condition, label: "Good", desc: "Lightly used", color: "#3b82f6" },
                { val: "used" as Condition, label: "Used", desc: "Shows wear", color: "#f59e0b" },
              ]
            ).map(({ val, label, desc, color }) => (
              <label
                key={val}
                style={{
                  ...s.radioCard,
                  ...(condition === val ? { borderColor: color, backgroundColor: `${color}14` } : {}),
                }}
              >
                <input
                  type="radio"
                  name="condition"
                  value={val}
                  checked={condition === val}
                  onChange={() => setCondition(val)}
                  style={{ display: "none" }}
                />
                <span
                  style={{
                    ...s.radioDot,
                    ...(condition === val
                      ? { backgroundColor: color, borderColor: color, boxShadow: `0 0 0 3px ${color}35` }
                      : {}),
                  }}
                />
                <div>
                  <p style={{ ...s.radioLabel, ...(condition === val ? { color } : {}) }}>{label}</p>
                  <p style={s.radioDesc}>{desc}</p>
                </div>
              </label>
            ))}
          </div>
        </Section>

        {/* ── PRICING ── */}
        <Section icon="💸" title="Pricing">
          <div style={s.grid3}>
            <Field label="Price per Day (₹)" required error={errors.pricePerDay}>
              <input
                id="ri-day"
                type="number"
                min={1}
                placeholder="50"
                value={pricePerDay}
                onChange={(e) => { setPricePerDay(e.target.value); clearErr("pricePerDay"); }}
                style={{ ...s.input, ...(errors.pricePerDay ? s.errBorder : {}) }}
              />
            </Field>
            <Field label="Price per Week (₹)" optional>
              <input
                id="ri-week"
                type="number"
                min={0}
                placeholder="300"
                value={pricePerWeek}
                onChange={(e) => setPricePerWeek(e.target.value)}
                style={s.input}
              />
            </Field>
            <Field label="Price per Month (₹)" optional>
              <input
                id="ri-month"
                type="number"
                min={0}
                placeholder="1000"
                value={pricePerMonth}
                onChange={(e) => setPricePerMonth(e.target.value)}
                style={s.input}
              />
            </Field>
          </div>

          <Field label="Security Deposit (₹)" optional>
            <input
              id="ri-deposit"
              type="number"
              min={0}
              placeholder="e.g. 500"
              value={securityDeposit}
              onChange={(e) => setSecurityDeposit(e.target.value)}
              style={{ ...s.input, maxWidth: "260px" }}
            />
          </Field>
        </Section>

        {/* ── AVAILABILITY ── */}
        <Section icon="📅" title="Availability">
          <div style={s.grid2}>
            <Field label="Available From" required error={errors.availableFrom}>
              <input
                id="ri-from"
                type="date"
                value={availableFrom}
                onChange={(e) => { setAvailableFrom(e.target.value); clearErr("availableFrom"); }}
                style={{ ...s.input, ...(errors.availableFrom ? s.errBorder : {}) }}
              />
            </Field>
            <Field label="Available Till" required error={errors.availableTill}>
              <input
                id="ri-till"
                type="date"
                value={availableTill}
                onChange={(e) => { setAvailableTill(e.target.value); clearErr("availableTill"); }}
                style={{ ...s.input, ...(errors.availableTill ? s.errBorder : {}) }}
              />
            </Field>
          </div>
        </Section>

        {/* ── IMAGES ── */}
        <Section icon="📸" title="Photos *  (min. 1)">
          <div
            style={{
              ...s.dropzone,
              ...(isDragging ? s.dropzoneActive : {}),
              ...(errors.images ? { borderColor: "#ef4444" } : {}),
            }}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={(e: ChangeEvent<HTMLInputElement>) => addFiles(e.target.files)}
            />
            <div style={{ fontSize: "2.2rem", marginBottom: "0.4rem" }}>
              {isDragging ? "⬇️" : "🖼️"}
            </div>
            <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: 0 }}>
              {isDragging ? "Drop images here…" : "Drag & drop or click to upload"}
            </p>
            <p style={{ color: "#3f3f46", fontSize: "0.72rem", marginTop: "0.3rem", marginBottom: 0 }}>
              PNG, JPG, WEBP · Multiple allowed
            </p>
          </div>
          {errors.images && <p style={s.errMsg}>{errors.images}</p>}

          {images.length > 0 && (
            <>
              <p style={s.thumbCount}>
                {images.length} image{images.length > 1 ? "s" : ""} selected
              </p>
              <div style={s.thumbGrid}>
                {images.map((img, idx) => (
                  <div key={img.id} style={s.thumbWrap}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.dataUrl} alt={`preview-${idx}`} style={s.thumb} />
                    {idx === 0 && <span style={s.mainBadge}>Main</span>}
                    <button
                      type="button"
                      style={s.thumbRemoveBtn}
                      onClick={() => removeImage(img.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </Section>

        {/* ── EXTRA OPTIONS ── */}
        <Section icon="⚙️" title="Extra Options">
          <Toggle
            label="🔥 Mark as Urgent"
            sub="Highlights your listing for faster visibility"
            checked={isUrgent}
            onChange={() => setIsUrgent((p) => !p)}
            id="ri-urgent"
          />
          <div style={{ height: "1px", backgroundColor: "#1a1a1a", margin: "0.25rem 0" }} />
          <Toggle
            label="🤝 Allow Negotiation"
            sub="Let renters propose a different price"
            checked={allowNegotiation}
            onChange={() => setAllowNegotiation((p) => !p)}
            id="ri-negotiation"
          />
        </Section>

        {/* ── ACTIONS ── */}
        <div style={s.actions}>
          <button
            type="button"
            style={s.btnSecondary}
            onClick={() => router.push("/seller")}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            id="ri-submit"
            type="submit"
            disabled={!isFormValid || submitting}
            style={{
              ...s.btnPrimary,
              ...(!isFormValid || submitting ? s.btnDisabled : {}),
            }}
          >
            {submitting ? (
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={s.spinner} /> Listing…
              </span>
            ) : (
              "✓ List for Rent"
            )}
          </button>
        </div>

      </form>
    </div>
  );
}

// ── small composable helpers ───────────────────────────────────────────────

function Section({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={sCard.card}>
      <p style={sCard.heading}>
        {icon} {title}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  optional,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
      <label style={s.label}>
        {label}
        {required && <span style={s.req}> *</span>}
        {optional && <span style={s.opt}> — optional</span>}
      </label>
      {children}
      {error && <p style={s.errMsg}>{error}</p>}
    </div>
  );
}

function Toggle({
  label,
  sub,
  checked,
  onChange,
  id,
}: {
  label: string;
  sub: string;
  checked: boolean;
  onChange: () => void;
  id: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <div style={{ flex: 1 }}>
        <p style={s.advTitle}>{label}</p>
        <p style={s.advSub}>{sub}</p>
      </div>
      <button
        id={id}
        type="button"
        onClick={onChange}
        aria-pressed={checked}
        style={{
          ...s.toggle,
          ...(checked ? s.toggleOn : s.toggleOff),
        }}
      >
        <span
          style={{
            ...s.knob,
            ...(checked ? s.knobOn : {}),
          }}
        />
      </button>
    </div>
  );
}

// ── styles ─────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  page: { maxWidth: "760px", margin: "0 auto" },
  form: { display: "flex", flexDirection: "column", gap: "1.5rem" },

  pageTitle: {
    fontSize: "1.5rem",
    fontWeight: 800,
    color: "#f8fafc",
    letterSpacing: "-0.02em",
    margin: 0,
  },
  pageSub: { color: "#64748b", fontSize: "0.85rem", marginTop: "0.3rem", marginBottom: 0 },

  label: { fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1" },
  req: { color: "#f87171" },
  opt: { color: "#3f3f46", fontWeight: 400 },

  input: {
    width: "100%",
    padding: "0.68rem 1rem",
    backgroundColor: "#0a0a0a",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#262626",
    borderRadius: "8px",
    color: "#f1f5f9",
    fontSize: "0.875rem",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box" as const,
    transition: "border-color 0.15s, box-shadow 0.15s",
  },
  select: {
    appearance: "none",
    cursor: "pointer",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 0.9rem center",
  },
  textarea: {
    width: "100%",
    padding: "0.68rem 1rem",
    backgroundColor: "#0a0a0a",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#262626",
    borderRadius: "8px",
    color: "#f1f5f9",
    fontSize: "0.875rem",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
    lineHeight: 1.65,
    boxSizing: "border-box" as const,
    transition: "border-color 0.15s, box-shadow 0.15s",
  },
  errBorder: {
    borderColor: "#ef4444",
    boxShadow: "0 0 0 3px rgba(239,68,68,0.1)",
  },
  errMsg: { fontSize: "0.73rem", color: "#f87171", margin: 0 },

  /* grids */
  grid3: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" },
  grid2: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" },

  /* radio */
  radioRow: { display: "flex", gap: "0.75rem", flexWrap: "wrap" },
  radioCard: {
    flex: "1 1 130px",
    display: "flex",
    alignItems: "center",
    gap: "0.7rem",
    padding: "0.85rem 1rem",
    backgroundColor: "#0a0a0a",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#262626",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.15s",
    userSelect: "none",
  },
  radioDot: {
    width: "15px",
    height: "15px",
    borderRadius: "50%",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "#444",
    flexShrink: 0,
    transition: "all 0.15s",
  },
  radioLabel: { fontSize: "0.85rem", fontWeight: 700, color: "#94a3b8", margin: 0 },
  radioDesc: { fontSize: "0.68rem", color: "#4b5563", margin: "0.1rem 0 0" },

  /* dropzone */
  dropzone: {
    borderWidth: "2px",
    borderStyle: "dashed",
    borderColor: "#292929",
    borderRadius: "12px",
    padding: "2.25rem",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.2s",
    backgroundColor: "#080808",
  },
  dropzoneActive: {
    borderColor: "#f59e0b",
    backgroundColor: "rgba(245,158,11,0.04)",
  },

  /* thumbnails */
  thumbCount: { fontSize: "0.78rem", color: "#64748b", margin: "0.25rem 0 0" },
  thumbGrid: { display: "flex", flexWrap: "wrap", gap: "0.7rem" },
  thumbWrap: {
    position: "relative",
    width: "84px",
    height: "84px",
    borderRadius: "8px",
    overflow: "hidden",
    border: "1px solid #2a2a2a",
  },
  thumb: { width: "100%", height: "100%", objectFit: "cover" },
  mainBadge: {
    position: "absolute",
    bottom: "4px",
    left: "4px",
    backgroundColor: "#f59e0b",
    color: "#000",
    fontSize: "0.55rem",
    fontWeight: 700,
    padding: "1px 5px",
    borderRadius: "4px",
  },
  thumbRemoveBtn: {
    position: "absolute",
    top: "4px",
    right: "4px",
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    backgroundColor: "rgba(0,0,0,0.65)",
    color: "#fff",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.9rem",
    cursor: "pointer",
    lineHeight: 1,
  },

  /* toggles */
  advTitle: { margin: 0, fontSize: "0.875rem", fontWeight: 700, color: "#e2e8f0" },
  advSub: { margin: "0.15rem 0 0", fontSize: "0.73rem", color: "#64748b" },
  toggle: {
    width: "44px",
    height: "24px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    position: "relative",
    flexShrink: 0,
    transition: "background-color 0.2s",
    padding: 0,
  },
  toggleOff: { backgroundColor: "#3f3f46" },
  toggleOn: { backgroundColor: "#f59e0b" },
  knob: {
    position: "absolute",
    top: "3px",
    left: "3px",
    width: "18px",
    height: "18px",
    backgroundColor: "#fff",
    borderRadius: "50%",
    transition: "transform 0.2s",
  },
  knobOn: { transform: "translateX(20px)" },

  /* actions */
  actions: { display: "flex", justifyContent: "flex-end", gap: "0.75rem", paddingTop: "0.5rem" },
  btnSecondary: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "transparent",
    border: "1px solid #2a2a2a",
    borderRadius: "8px",
    color: "#94a3b8",
    fontSize: "0.875rem",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  btnPrimary: {
    padding: "0.75rem 2rem",
    backgroundColor: "#f59e0b",
    border: "none",
    borderRadius: "8px",
    color: "#000",
    fontSize: "0.9rem",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    minWidth: "155px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  btnDisabled: { opacity: 0.55, cursor: "not-allowed" },
  spinner: {
    display: "inline-block",
    width: "15px",
    height: "15px",
    border: "2px solid #000",
    borderTopColor: "transparent",
    borderRadius: "50%",
    animation: "spin 0.6s linear infinite",
  },
};

const sCard: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: "#111",
    border: "1px solid #1c1c1c",
    borderRadius: "16px",
    padding: "1.6rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  heading: {
    fontSize: "0.88rem",
    fontWeight: 700,
    color: "#e2e8f0",
    margin: 0,
    paddingBottom: "0.75rem",
    borderBottom: "1px solid #1c1c1c",
  },
};
