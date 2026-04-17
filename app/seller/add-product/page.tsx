/**
 * app/seller/add-product/page.tsx
 * Full Add Product form — saves to localStorage, redirects to /seller/products.
 */

"use client";

import React, {
  useState,
  useRef,
  useCallback,
  DragEvent,
  ChangeEvent,
  FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { saveProduct } from "@/lib/productStore";

type Condition = "new" | "good" | "used" | "";
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
  condition?: string;
  expectedPrice?: string;
  images?: string;
}

const CATEGORIES: Category[] = [
  "Books",
  "Electronics",
  "Furniture",
  "Lab Equipment",
  "Hostel Supplies",
  "Others",
];

export default function AddProductPage() {
  const router = useRouter();

  /* ── State ── */
  const [category, setCategory] = useState<Category>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState<Condition>("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [expectedPrice, setExpectedPrice] = useState("");
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [isUrgent, setIsUrgent] = useState(false);
  const [isBundle, setIsBundle] = useState(false);
  const [bundleTitle, setBundleTitle] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Image helpers ── */
  const readAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

  const addFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;
    const validFiles = Array.from(files).filter((f) =>
      f.type.startsWith("image/")
    );
    const previews: ImagePreview[] = await Promise.all(
      validFiles.map(async (file) => ({
        id: `${Date.now()}-${Math.random()}`,
        dataUrl: await readAsDataUrl(file),
        file,
      }))
    );
    setImages((prev) => [...prev, ...previews]);
    setErrors((prev) => ({ ...prev, images: undefined }));
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

  /* ── Validation ── */
  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!category) errs.category = "Please select a category.";
    if (!title.trim()) errs.title = "Title is required.";
    else if (title.length > 80) errs.title = "Title must be 80 characters or less.";
    if (!description.trim()) errs.description = "Description is required.";
    if (!condition) errs.condition = "Please select item condition.";
    if (!expectedPrice || Number(expectedPrice) <= 0)
      errs.expectedPrice = "Enter a valid expected price.";
    if (images.length === 0) errs.images = "Upload at least 1 image.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const isFormValid =
    !!category &&
    title.trim().length > 0 &&
    title.length <= 80 &&
    description.trim().length > 0 &&
    !!condition &&
    Number(expectedPrice) > 0 &&
    images.length > 0;

  /* ── Submit ── */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    // Simulate API latency
    await new Promise((r) => setTimeout(r, 1000));

    saveProduct({
      category,
      title: title.trim(),
      description: description.trim(),
      condition: condition as "new" | "good" | "used",
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      expectedPrice: Number(expectedPrice),
      images: images.map((i) => i.dataUrl),
      isUrgent,
      isBundle,
      bundleTitle: isBundle ? bundleTitle.trim() : undefined,
      status: "active",
    });

    setSubmitting(false);
    router.push("/seller/products");
  };

  /* ── Helpers ── */
  const setField =
    <T,>(setter: React.Dispatch<React.SetStateAction<T>>, key: keyof FormErrors) =>
      (value: T) => {
        setter(value);
        setErrors((p) => ({ ...p, [key]: undefined }));
      };

  return (
    <div style={s.page}>
      <form onSubmit={handleSubmit} style={s.form} noValidate>

        {/* ── Page heading ── */}
        <div style={s.heading}>
          <h1 style={s.title}>Add New Product</h1>
          <p style={s.subtitle}>Fill in the details to list your item on the marketplace</p>
        </div>

        {/* ════════════ BASIC INFO ════════════ */}
        <div style={s.card}>
          <p style={s.cardHeading}>📋 Basic Information</p>

          {/* Category */}
          <div style={s.field}>
            <label style={s.label} htmlFor="ap-category">
              Category <span style={s.req}>*</span>
            </label>
            <select
              id="ap-category"
              value={category}
              onChange={(e) =>
                setField(setCategory, "category")(e.target.value as Category)
              }
              style={{ ...s.select, ...(errors.category ? s.errBorder : {}) }}
            >
              <option value="">Select a category…</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.category && <p style={s.errMsg}>{errors.category}</p>}
          </div>

          {/* Title */}
          <div style={s.field}>
            <label style={s.label} htmlFor="ap-title">
              Item Title <span style={s.req}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="ap-title"
                type="text"
                maxLength={80}
                placeholder="e.g. Physics Textbook — Resnick & Halliday"
                value={title}
                onChange={(e) => setField(setTitle, "title")(e.target.value)}
                style={{
                  ...s.input,
                  paddingRight: "4rem",
                  ...(errors.title ? s.errBorder : {}),
                }}
                onFocus={(e) => Object.assign(e.target.style, s.focusStyle)}
                onBlur={(e) =>
                  Object.assign(e.target.style, errors.title ? { ...s.input, ...s.errBorder } : s.input)
                }
              />
              <span style={s.charCount}>{title.length}/80</span>
            </div>
            {errors.title && <p style={s.errMsg}>{errors.title}</p>}
          </div>

          {/* Description */}
          <div style={s.field}>
            <label style={s.label} htmlFor="ap-desc">
              Description <span style={s.req}>*</span>
            </label>
            <textarea
              id="ap-desc"
              rows={4}
              placeholder="Describe your item — edition, flaws, reason for selling, accessories included…"
              value={description}
              onChange={(e) =>
                setField(setDescription, "description")(e.target.value)
              }
              style={{
                ...s.textarea,
                ...(errors.description ? s.errBorder : {}),
              }}
              onFocus={(e) =>
                Object.assign(e.target.style, { ...s.textarea, ...s.focusStyle })
              }
              onBlur={(e) =>
                Object.assign(
                  e.target.style,
                  errors.description
                    ? { ...s.textarea, ...s.errBorder }
                    : s.textarea
                )
              }
            />
            {errors.description && (
              <p style={s.errMsg}>{errors.description}</p>
            )}
          </div>
        </div>

        {/* ════════════ CONDITION ════════════ */}
        <div style={s.card}>
          <p style={s.cardHeading}>🔖 Condition</p>
          <div style={s.radioRow}>
            {(
              [
                { val: "new", label: "New", desc: "Unused, sealed", color: "#10b981" },
                { val: "good", label: "Good", desc: "Lightly used", color: "#3b82f6" },
                { val: "used", label: "Used", desc: "Shows wear", color: "#f59e0b" },
              ] as const
            ).map(({ val, label, desc, color }) => (
              <label
                key={val}
                style={{
                  ...s.radioCard,
                  ...(condition === val
                    ? { borderColor: color, backgroundColor: color + "12" }
                    : {}),
                }}
              >
                <input
                  type="radio"
                  name="condition"
                  value={val}
                  checked={condition === val}
                  onChange={() =>
                    setField(setCondition, "condition")(val)
                  }
                  style={{ display: "none" }}
                />
                <span
                  style={{
                    ...s.radioDot,
                    ...(condition === val
                      ? { backgroundColor: color, borderColor: color, boxShadow: `0 0 0 3px ${color}30` }
                      : {}),
                  }}
                />
                <div>
                  <p style={{ ...s.radioLabel, ...(condition === val ? { color } : {}) }}>
                    {label}
                  </p>
                  <p style={s.radioDesc}>{desc}</p>
                </div>
              </label>
            ))}
          </div>
          {errors.condition && <p style={s.errMsg}>{errors.condition}</p>}
        </div>

        {/* ════════════ PRICING ════════════ */}
        <div style={s.card}>
          <p style={s.cardHeading}>💸 Pricing</p>
          <div style={s.priceRow}>
            <div style={{ flex: 1 }}>
              <label style={s.label} htmlFor="ap-orig">
                Original Price (₹)
                <span style={s.optional}> — optional</span>
              </label>
              <input
                id="ap-orig"
                type="number"
                min={0}
                placeholder="e.g. 800"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                style={s.input}
                onFocus={(e) => Object.assign(e.target.style, s.focusStyle)}
                onBlur={(e) => Object.assign(e.target.style, s.input)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={s.label} htmlFor="ap-exp">
                Expected Price (₹) <span style={s.req}>*</span>
              </label>
              <input
                id="ap-exp"
                type="number"
                min={1}
                placeholder="e.g. 500"
                value={expectedPrice}
                onChange={(e) =>
                  setField(setExpectedPrice, "expectedPrice")(e.target.value)
                }
                style={{
                  ...s.input,
                  ...(errors.expectedPrice ? s.errBorder : {}),
                }}
                onFocus={(e) => Object.assign(e.target.style, s.focusStyle)}
                onBlur={(e) =>
                  Object.assign(
                    e.target.style,
                    errors.expectedPrice
                      ? { ...s.input, ...s.errBorder }
                      : s.input
                  )
                }
              />
              {errors.expectedPrice && (
                <p style={s.errMsg}>{errors.expectedPrice}</p>
              )}
            </div>
          </div>

          {/* Discount badge preview */}
          {originalPrice &&
            expectedPrice &&
            Number(originalPrice) > Number(expectedPrice) && (
              <div style={s.discountPreview}>
                <span style={s.discountBadge}>
                  {Math.round(
                    (1 - Number(expectedPrice) / Number(originalPrice)) * 100
                  )}
                  % OFF
                </span>
                <span style={s.discountText}>
                  Buyers save ₹
                  {(Number(originalPrice) - Number(expectedPrice)).toFixed(0)}
                </span>
              </div>
            )}
        </div>

        {/* ════════════ IMAGES ════════════ */}
        <div style={s.card}>
          <p style={s.cardHeading}>
            📸 Photos <span style={s.req}>*</span>
            <span style={s.optional}> — min. 1 image</span>
          </p>

          {/* Drop zone */}
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
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                addFiles(e.target.files)
              }
            />
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
              {isDragging ? "⬇️" : "📷"}
            </div>
            <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: 0 }}>
              {isDragging
                ? "Drop images here…"
                : "Drag & drop or click to upload"}
            </p>
            <p
              style={{
                color: "#4b5563",
                fontSize: "0.75rem",
                marginTop: "0.35rem",
                marginBottom: 0,
              }}
            >
              PNG, JPG, WEBP • Multiple allowed
            </p>
          </div>
          {errors.images && <p style={s.errMsg}>{errors.images}</p>}

          {/* Thumbnails */}
          {images.length > 0 && (
            <>
              <p style={s.thumbCount}>{images.length} image{images.length > 1 ? "s" : ""} selected</p>
              <div style={s.thumbGrid}>
                {images.map((img, idx) => (
                  <div key={img.id} style={s.thumbWrap}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.dataUrl} alt={`preview-${idx}`} style={s.thumb} />
                    {idx === 0 && <span style={s.mainBadge}>Main</span>}
                    <button
                      type="button"
                      style={s.thumbRemove}
                      onClick={() => removeImage(img.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ════════════ ADVANCED ════════════ */}
        <div style={s.card}>
          <p style={s.cardHeading}>⚙️ Advanced Options</p>

          {/* Urgent toggle */}
          <div style={s.advRow}>
            <div style={{ flex: 1 }}>
              <p style={s.advTitle}>🔥 Mark as Urgent Sale</p>
              <p style={s.advSub}>
                Highlights your listing for faster visibility
              </p>
            </div>
            <button
              type="button"
              style={{
                ...s.toggle,
                ...(isUrgent ? s.toggleOn : s.toggleOff),
              }}
              onClick={() => setIsUrgent((p) => !p)}
              aria-pressed={isUrgent}
            >
              <span
                style={{
                  ...s.toggleKnob,
                  ...(isUrgent ? s.toggleKnobOn : {}),
                }}
              />
            </button>
          </div>

          {/* Bundle checkbox */}
          <div style={{ ...s.advRow, marginTop: "1rem" }}>
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
                cursor: "pointer",
                flex: 1,
              }}
            >
              <input
                type="checkbox"
                checked={isBundle}
                onChange={(e) => {
                  setIsBundle(e.target.checked);
                  if (!e.target.checked) setBundleTitle("");
                }}
                style={s.checkbox}
              />
              <div>
                <p style={s.advTitle}>📦 This is a bundle</p>
                <p style={s.advSub}>Group multiple items into one listing</p>
              </div>
            </label>
          </div>

          {/* Bundle title */}
          {isBundle && (
            <div style={{ marginTop: "1rem", animation: "fadeInUp 0.3s ease" }}>
              <label style={s.label} htmlFor="ap-bundle">
                Bundle Title
              </label>
              <input
                id="ap-bundle"
                type="text"
                placeholder="e.g. Complete 2nd Year Engineering Kit"
                value={bundleTitle}
                onChange={(e) => setBundleTitle(e.target.value)}
                style={s.input}
                onFocus={(e) => Object.assign(e.target.style, s.focusStyle)}
                onBlur={(e) => Object.assign(e.target.style, s.input)}
              />
            </div>
          )}
        </div>

        {/* ════════════ ACTIONS ════════════ */}
        <div style={s.actions}>
          <button
            type="button"
            style={s.btnSecondary}
            onClick={() => router.push("/seller/products")}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            style={s.btnDraft}
            disabled={submitting}
            onClick={async () => {
              setSubmitting(true);
              await new Promise((r) => setTimeout(r, 500));
              saveProduct({
                category: category || "Others",
                title: title.trim() || "Untitled Draft",
                description,
                condition: (condition as "new" | "good" | "used") || "used",
                originalPrice: originalPrice ? Number(originalPrice) : undefined,
                expectedPrice: Number(expectedPrice) || 0,
                images: images.map((i) => i.dataUrl),
                isUrgent,
                isBundle,
                bundleTitle: isBundle ? bundleTitle : undefined,
                status: "draft",
              });
              setSubmitting(false);
              router.push("/seller/products");
            }}
          >
            Save as Draft
          </button>
          <button
            id="ap-submit-btn"
            type="submit"
            style={{
              ...s.btnPrimary,
              ...(!isFormValid || submitting ? s.btnDisabled : {}),
            }}
            disabled={!isFormValid || submitting}
          >
            {submitting ? (
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={s.spinner} /> Listing…
              </span>
            ) : (
              "✓ List Item"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ────────────────────── Styles ────────────────────── */
const s: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: "760px",
    margin: "0 auto",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  heading: {
    paddingBottom: "0.5rem",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: 800,
    color: "#f8fafc",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    color: "#64748b",
    fontSize: "0.875rem",
    marginTop: "0.3rem",
  },
  card: {
    backgroundColor: "#121212",
    border: "1px solid #1f1f1f",
    borderRadius: "16px",
    padding: "1.75rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  cardHeading: {
    fontSize: "0.9rem",
    fontWeight: 700,
    color: "#e2e8f0",
    margin: 0,
    paddingBottom: "0.75rem",
    borderBottom: "1px solid #1f1f1f",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },
  label: {
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "#cbd5e1",
  },
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
    transition: "border-color 0.2s, box-shadow 0.2s",
    fontFamily: "inherit",
  },
  focusStyle: {
    borderColor: "#f59e0b",
    boxShadow: "0 0 0 3px rgba(245,158,11,0.12)",
  },
  errBorder: {
    borderColor: "#ef4444",
    boxShadow: "0 0 0 3px rgba(239,68,68,0.1)",
  },
  errMsg: {
    fontSize: "0.75rem",
    color: "#f87171",
    margin: 0,
  },
  charCount: {
    position: "absolute",
    right: "0.8rem",
    bottom: "0.6rem",
    fontSize: "0.68rem",
    color: "#4b5563",
    pointerEvents: "none",
  },
  textarea: {
    width: "100%",
    padding: "0.7rem 1rem",
    backgroundColor: "#0a0a0a",
    border: "1px solid #2a2a2a",
    borderRadius: "8px",
    color: "#f8fafc",
    fontSize: "0.875rem",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
    lineHeight: 1.6,
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  select: {
    width: "100%",
    padding: "0.7rem 1rem",
    backgroundColor: "#0a0a0a",
    border: "1px solid #2a2a2a",
    borderRadius: "8px",
    color: "#f8fafc",
    fontSize: "0.875rem",
    outline: "none",
    cursor: "pointer",
    fontFamily: "inherit",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 1rem center",
    transition: "border-color 0.2s",
  },
  /* Condition radio cards */
  radioRow: {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  radioCard: {
    flex: "1 1 140px",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.9rem 1rem",
    backgroundColor: "#0a0a0a",
    border: "1px solid #2a2a2a",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.2s",
    userSelect: "none",
  },
  radioDot: {
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    border: "2px solid #444",
    flexShrink: 0,
    transition: "all 0.2s",
  },
  radioLabel: {
    fontSize: "0.875rem",
    fontWeight: 700,
    color: "#94a3b8",
    margin: 0,
    lineHeight: 1.2,
  },
  radioDesc: {
    fontSize: "0.7rem",
    color: "#4b5563",
    margin: "0.1rem 0 0",
  },
  /* Pricing */
  priceRow: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
  },
  discountPreview: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginTop: "-0.25rem",
  },
  discountBadge: {
    backgroundColor: "rgba(16,185,129,0.12)",
    color: "#10b981",
    border: "1px solid rgba(16,185,129,0.25)",
    borderRadius: "6px",
    padding: "2px 8px",
    fontSize: "0.75rem",
    fontWeight: 700,
  },
  discountText: {
    fontSize: "0.78rem",
    color: "#64748b",
  },
  /* Images */
  dropzone: {
    border: "2px dashed #2a2a2a",
    borderRadius: "12px",
    padding: "2.5rem",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.2s",
    backgroundColor: "#0a0a0a",
  },
  dropzoneActive: {
    borderColor: "#f59e0b",
    backgroundColor: "rgba(245,158,11,0.04)",
  },
  thumbCount: {
    fontSize: "0.75rem",
    color: "#64748b",
    margin: 0,
  },
  thumbGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.75rem",
  },
  thumbWrap: {
    position: "relative",
    width: "96px",
    height: "96px",
    borderRadius: "10px",
    overflow: "hidden",
    border: "1px solid #2a2a2a",
  },
  thumb: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  mainBadge: {
    position: "absolute",
    bottom: "4px",
    left: "4px",
    backgroundColor: "#f59e0b",
    color: "#000",
    fontSize: "0.55rem",
    fontWeight: 800,
    borderRadius: "4px",
    padding: "1px 5px",
  },
  thumbRemove: {
    position: "absolute",
    top: "4px",
    right: "4px",
    background: "rgba(0,0,0,0.7)",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: "20px",
    height: "20px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1rem",
    lineHeight: 1,
    padding: 0,
  },
  /* Advanced */
  advRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
  },
  advTitle: {
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "#e2e8f0",
    margin: 0,
  },
  advSub: {
    fontSize: "0.72rem",
    color: "#4b5563",
    marginTop: "0.15rem",
    marginBottom: 0,
  },
  toggle: {
    width: "48px",
    height: "26px",
    borderRadius: "13px",
    border: "none",
    cursor: "pointer",
    position: "relative",
    transition: "background-color 0.25s",
    flexShrink: 0,
    padding: 0,
  },
  toggleOn: { backgroundColor: "#f59e0b" },
  toggleOff: { backgroundColor: "#374151" },
  toggleKnob: {
    position: "absolute",
    top: "3px",
    left: "3px",
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    backgroundColor: "#fff",
    transition: "left 0.25s",
    display: "block",
  },
  toggleKnobOn: { left: "25px" },
  checkbox: {
    width: "18px",
    height: "18px",
    accentColor: "#f59e0b",
    cursor: "pointer",
    flexShrink: 0,
    marginTop: "2px",
  },
  /* Action buttons */
  actions: {
    display: "flex",
    gap: "0.75rem",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    paddingBottom: "1.5rem",
  },
  btnPrimary: {
    padding: "0.75rem 2rem",
    backgroundColor: "#f59e0b",
    color: "#000",
    border: "none",
    borderRadius: "10px",
    fontSize: "0.9rem",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    minWidth: "130px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    transition: "background-color 0.2s",
  },
  btnDraft: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "transparent",
    color: "#94a3b8",
    border: "1px solid #2a2a2a",
    borderRadius: "10px",
    fontSize: "0.875rem",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "border-color 0.2s",
  },
  btnSecondary: {
    padding: "0.75rem 1.25rem",
    backgroundColor: "transparent",
    color: "#64748b",
    border: "1px solid #1f1f1f",
    borderRadius: "10px",
    fontSize: "0.875rem",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  btnDisabled: {
    backgroundColor: "#1f2937",
    color: "#4b5563",
    cursor: "not-allowed",
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
};
