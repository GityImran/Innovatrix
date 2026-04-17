/**
 * app/seller/products/[id]/edit/page.tsx
 * Edit Product — pre-fills the add-product form with existing data.
 */

"use client";

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  DragEvent,
  ChangeEvent,
  FormEvent,
} from "react";
import { useRouter, useParams } from "next/navigation";
// import {
//   getProductById,
//   updateProduct,
//   type Product,
// } from "@/lib/productStore";

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
  isExisting?: boolean;
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

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [notFound, setNotFound] = useState(false);
  const [ready, setReady] = useState(false);

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Fetch from API ── */
  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) {
          if (res.status === 404) setNotFound(true);
          else throw new Error("Failed to fetch product");
          return;
        }

        const product = await res.json();
        setCategory(product.category as Category);
        setTitle(product.title);
        setDescription(product.description);
        setCondition(product.condition);
        setOriginalPrice(product.originalPrice?.toString() ?? "");
        setExpectedPrice(product.expectedPrice.toString());
        setImages(
          (product.images as string[]).map((dataUrl, i) => ({
            id: `existing-${i}`,
            dataUrl,
            isExisting: true,
          }))
        );
        setIsUrgent(product.isUrgent);
        setIsBundle(product.isBundle);
        setBundleTitle(product.bundleTitle ?? "");
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setReady(true);
        setLoading(false);
      }
    }

    if (id) {
      fetchProduct();
    }
  }, [id]);

  /* ── Image helpers ── */
  const readAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

  const addFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;
    const validFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const previews: ImagePreview[] = await Promise.all(
      validFiles.map(async (file) => ({
        id: `${Date.now()}-${Math.random()}`,
        dataUrl: await readAsDataUrl(file),
      }))
    );
    setImages((prev) => [...prev, ...previews]);
    setErrors((p) => ({ ...p, images: undefined }));
  }, []);

  const removeImage = (imgId: string) =>
    setImages((prev) => prev.filter((i) => i.id !== imgId));

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
    else if (title.length > 80) errs.title = "Max 80 characters.";
    if (!description.trim()) errs.description = "Description is required.";
    if (!condition) errs.condition = "Please select a condition.";
    if (!expectedPrice || Number(expectedPrice) <= 0)
      errs.expectedPrice = "Enter a valid expected price.";
    if (images.length === 0) errs.images = "At least 1 image required.";
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
    try {
      const res = await fetch(`/api/seller/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update product");
      }

      router.push("/seller/products");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!ready || loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "8rem" }}>
        <span style={s.spinner} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "4rem", color: "#f87171" }}>
        <h2 style={{ color: "#f8fafc", marginTop: "1rem" }}>Error Loading Product</h2>
        <p>{error}</p>
        <button
          style={{ ...s.btnPrimary, marginTop: "1.5rem", cursor: "pointer", border: "none" }}
          onClick={() => router.push("/seller/products")}
        >
          Back to Listings
        </button>
      </div>
    );
  }

  if (notFound) {
    return (
      <div style={{ textAlign: "center", padding: "4rem", color: "#94a3b8" }}>
        <div style={{ fontSize: "3rem" }}>❓</div>
        <h2 style={{ color: "#f8fafc", marginTop: "1rem" }}>Product not found</h2>
        <button
          style={{ ...s.btnPrimary, marginTop: "1.5rem", cursor: "pointer", border: "none" }}
          onClick={() => router.push("/seller/products")}
        >
          Back to Listings
        </button>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <form onSubmit={handleSubmit} style={s.form} noValidate>

        {/* Heading */}
        <div>
          <h1 style={s.title}>Edit Product</h1>
          <p style={s.subtitle}>Update your listing details below</p>
        </div>

        {/* ── Basic Info ── */}
        <div style={s.card}>
          <p style={s.cardHeading}>📋 Basic Information</p>

          <div style={s.field}>
            <label style={s.label} htmlFor="ep-category">Category <span style={s.req}>*</span></label>
            <select
              id="ep-category"
              value={category}
              onChange={(e) => { setCategory(e.target.value as Category); setErrors((p) => ({ ...p, category: undefined })); }}
              style={{ ...s.select, ...(errors.category ? s.errBorder : {}) }}
            >
              <option value="">Select a category…</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p style={s.errMsg}>{errors.category}</p>}
          </div>

          <div style={s.field}>
            <label style={s.label} htmlFor="ep-title">Item Title <span style={s.req}>*</span></label>
            <div style={{ position: "relative" }}>
              <input
                id="ep-title" type="text" maxLength={80}
                value={title}
                onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: undefined })); }}
                style={{ ...s.input, paddingRight: "4rem", ...(errors.title ? s.errBorder : {}) }}
                onFocus={(e) => Object.assign(e.target.style, s.focusStyle)}
                onBlur={(e) => Object.assign(e.target.style, errors.title ? { ...s.input, ...s.errBorder } : s.input)}
              />
              <span style={s.charCount}>{title.length}/80</span>
            </div>
            {errors.title && <p style={s.errMsg}>{errors.title}</p>}
          </div>

          <div style={s.field}>
            <label style={s.label} htmlFor="ep-desc">Description <span style={s.req}>*</span></label>
            <textarea
              id="ep-desc" rows={4}
              value={description}
              onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: undefined })); }}
              style={{ ...s.textarea, ...(errors.description ? s.errBorder : {}) }}
              onFocus={(e) => Object.assign(e.target.style, { ...s.textarea, ...s.focusStyle })}
              onBlur={(e) => Object.assign(e.target.style, errors.description ? { ...s.textarea, ...s.errBorder } : s.textarea)}
            />
            {errors.description && <p style={s.errMsg}>{errors.description}</p>}
          </div>
        </div>

        {/* ── Condition ── */}
        <div style={s.card}>
          <p style={s.cardHeading}>🔖 Condition</p>
          <div style={s.radioRow}>
            {([
              { val: "new", label: "New", desc: "Unused, sealed", color: "#10b981" },
              { val: "good", label: "Good", desc: "Lightly used", color: "#3b82f6" },
              { val: "used", label: "Used", desc: "Shows wear", color: "#f59e0b" },
            ] as const).map(({ val, label, desc, color }) => (
              <label key={val} style={{ ...s.radioCard, ...(condition === val ? { borderColor: color, backgroundColor: color + "12" } : {}) }}>
                <input type="radio" name="condition" value={val} checked={condition === val}
                  onChange={() => { setCondition(val); setErrors((p) => ({ ...p, condition: undefined })); }}
                  style={{ display: "none" }}
                />
                <span style={{ ...s.radioDot, ...(condition === val ? { backgroundColor: color, borderColor: color } : {}) }} />
                <div>
                  <p style={{ ...s.radioLabel, ...(condition === val ? { color } : {}) }}>{label}</p>
                  <p style={s.radioDesc}>{desc}</p>
                </div>
              </label>
            ))}
          </div>
          {errors.condition && <p style={s.errMsg}>{errors.condition}</p>}
        </div>

        {/* ── Pricing ── */}
        <div style={s.card}>
          <p style={s.cardHeading}>💸 Pricing</p>
          <div style={s.priceRow}>
            <div style={{ flex: 1 }}>
              <label style={s.label} htmlFor="ep-orig">Original Price (₹) <span style={s.optional}>— optional</span></label>
              <input id="ep-orig" type="number" min={0} value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                style={s.input}
                onFocus={(e) => Object.assign(e.target.style, s.focusStyle)}
                onBlur={(e) => Object.assign(e.target.style, s.input)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={s.label} htmlFor="ep-exp">Expected Price (₹) <span style={s.req}>*</span></label>
              <input id="ep-exp" type="number" min={1} value={expectedPrice}
                onChange={(e) => { setExpectedPrice(e.target.value); setErrors((p) => ({ ...p, expectedPrice: undefined })); }}
                style={{ ...s.input, ...(errors.expectedPrice ? s.errBorder : {}) }}
                onFocus={(e) => Object.assign(e.target.style, s.focusStyle)}
                onBlur={(e) => Object.assign(e.target.style, errors.expectedPrice ? { ...s.input, ...s.errBorder } : s.input)}
              />
              {errors.expectedPrice && <p style={s.errMsg}>{errors.expectedPrice}</p>}
            </div>
          </div>
        </div>

        {/* ── Images ── */}
        <div style={s.card}>
          <p style={s.cardHeading}>📸 Photos <span style={s.req}>*</span></p>
          <div
            style={{ ...s.dropzone, ...(isDragging ? s.dropzoneActive : {}), ...(errors.images ? { borderColor: "#ef4444" } : {}) }}
            onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: "none" }}
              onChange={(e: ChangeEvent<HTMLInputElement>) => addFiles(e.target.files)}
            />
            <div style={{ fontSize: "2.2rem", marginBottom: "0.4rem" }}>{isDragging ? "⬇️" : "📷"}</div>
            <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: 0 }}>
              {isDragging ? "Drop to add…" : "Drag & drop or click to add more photos"}
            </p>
          </div>
          {errors.images && <p style={s.errMsg}>{errors.images}</p>}

          {images.length > 0 && (
            <div style={s.thumbGrid}>
              {images.map((img, idx) => (
                <div key={img.id} style={s.thumbWrap}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.dataUrl} alt={`img-${idx}`} style={s.thumb} />
                  {idx === 0 && <span style={s.mainBadge}>Main</span>}
                  <button type="button" style={s.thumbRemove} onClick={() => removeImage(img.id)}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Advanced ── */}
        <div style={s.card}>
          <p style={s.cardHeading}>⚙️ Advanced Options</p>

          <div style={s.advRow}>
            <div style={{ flex: 1 }}>
              <p style={s.advTitle}>🔥 Mark as Urgent Sale</p>
              <p style={s.advSub}>Highlights your listing for faster visibility</p>
            </div>
            <button type="button"
              style={{ ...s.toggle, ...(isUrgent ? s.toggleOn : s.toggleOff) }}
              onClick={() => setIsUrgent((p) => !p)}
            >
              <span style={{ ...s.toggleKnob, ...(isUrgent ? s.toggleKnobOn : {}) }} />
            </button>
          </div>

          <div style={{ ...s.advRow, marginTop: "1rem" }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", cursor: "pointer", flex: 1 }}>
              <input type="checkbox" checked={isBundle}
                onChange={(e) => { setIsBundle(e.target.checked); if (!e.target.checked) setBundleTitle(""); }}
                style={s.checkbox}
              />
              <div>
                <p style={s.advTitle}>📦 This is a bundle</p>
                <p style={s.advSub}>Group multiple items into one listing</p>
              </div>
            </label>
          </div>

          {isBundle && (
            <div style={{ marginTop: "0.75rem" }}>
              <label style={s.label} htmlFor="ep-bundle">Bundle Title</label>
              <input id="ep-bundle" type="text" value={bundleTitle}
                onChange={(e) => setBundleTitle(e.target.value)}
                style={s.input}
                onFocus={(e) => Object.assign(e.target.style, s.focusStyle)}
                onBlur={(e) => Object.assign(e.target.style, s.input)}
              />
            </div>
          )}
        </div>

        {/* ── Actions ── */}
        <div style={s.actions}>
          <button type="button" style={s.btnCancel}
            onClick={() => router.push("/seller/products")} disabled={submitting}>
            Cancel
          </button>
          <button
            id="ep-submit-btn" type="submit"
            style={{ ...s.btnPrimary, ...(!isFormValid || submitting ? s.btnDisabled : {}) }}
            disabled={!isFormValid || submitting}
          >
            {submitting ? (
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={s.spinner} /> Saving…
              </span>
            ) : "✓ Save Changes"}
          </button>
        </div>

      </form>
    </div>
  );
}

/* ── Styles ── */
const s: Record<string, React.CSSProperties> = {
  page: { maxWidth: "760px", margin: "0 auto" },
  form: { display: "flex", flexDirection: "column", gap: "1.5rem" },
  title: { fontSize: "1.5rem", fontWeight: 800, color: "#f8fafc", letterSpacing: "-0.02em" },
  subtitle: { fontSize: "0.85rem", color: "#64748b", marginTop: "0.3rem" },
  card: {
    backgroundColor: "#121212", border: "1px solid #1f1f1f", borderRadius: "16px",
    padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem",
  },
  cardHeading: {
    fontSize: "0.9rem", fontWeight: 700, color: "#e2e8f0", margin: 0,
    paddingBottom: "0.75rem", borderBottom: "1px solid #1f1f1f",
  },
  field: { display: "flex", flexDirection: "column", gap: "0.4rem" },
  label: { fontSize: "0.85rem", fontWeight: 700, color: "#cbd5e1" },
  req: { color: "#f87171" },
  optional: { color: "#4b5563", fontWeight: 400 },
  input: {
    width: "100%", padding: "0.7rem 1rem", backgroundColor: "#0a0a0a",
    border: "1px solid #2a2a2a", borderRadius: "8px", color: "#f8fafc",
    fontSize: "0.875rem", outline: "none", fontFamily: "inherit",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  focusStyle: { borderColor: "#f59e0b", boxShadow: "0 0 0 3px rgba(245,158,11,0.12)" },
  errBorder: { borderColor: "#ef4444", boxShadow: "0 0 0 3px rgba(239,68,68,0.1)" },
  errMsg: { fontSize: "0.75rem", color: "#f87171", margin: 0 },
  charCount: { position: "absolute", right: "0.8rem", bottom: "0.6rem", fontSize: "0.68rem", color: "#4b5563", pointerEvents: "none" },
  textarea: {
    width: "100%", padding: "0.7rem 1rem", backgroundColor: "#0a0a0a",
    border: "1px solid #2a2a2a", borderRadius: "8px", color: "#f8fafc",
    fontSize: "0.875rem", outline: "none", resize: "vertical", fontFamily: "inherit",
    lineHeight: 1.6, transition: "border-color 0.2s, box-shadow 0.2s",
  },
  select: {
    width: "100%", padding: "0.7rem 1rem", backgroundColor: "#0a0a0a",
    border: "1px solid #2a2a2a", borderRadius: "8px", color: "#f8fafc",
    fontSize: "0.875rem", outline: "none", cursor: "pointer", fontFamily: "inherit",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 1rem center",
  },
  radioRow: { display: "flex", gap: "0.75rem", flexWrap: "wrap" },
  radioCard: {
    flex: "1 1 140px", display: "flex", alignItems: "center", gap: "0.75rem",
    padding: "0.9rem 1rem", backgroundColor: "#0a0a0a", border: "1px solid #2a2a2a",
    borderRadius: "10px", cursor: "pointer", transition: "all 0.2s", userSelect: "none",
  },
  radioDot: { width: "16px", height: "16px", borderRadius: "50%", border: "2px solid #444", flexShrink: 0, transition: "all 0.2s" },
  radioLabel: { fontSize: "0.875rem", fontWeight: 700, color: "#94a3b8", margin: 0, lineHeight: 1.2 },
  radioDesc: { fontSize: "0.7rem", color: "#4b5563", margin: "0.1rem 0 0" },
  priceRow: { display: "flex", gap: "1rem", flexWrap: "wrap" },
  dropzone: {
    border: "2px dashed #2a2a2a", borderRadius: "12px", padding: "2rem",
    textAlign: "center", cursor: "pointer", transition: "all 0.2s", backgroundColor: "#0a0a0a",
  },
  dropzoneActive: { borderColor: "#f59e0b", backgroundColor: "rgba(245,158,11,0.04)" },
  thumbGrid: { display: "flex", flexWrap: "wrap", gap: "0.75rem" },
  thumbWrap: { position: "relative", width: "96px", height: "96px", borderRadius: "10px", overflow: "hidden", border: "1px solid #2a2a2a" },
  thumb: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  mainBadge: { position: "absolute", bottom: "4px", left: "4px", backgroundColor: "#f59e0b", color: "#000", fontSize: "0.55rem", fontWeight: 800, borderRadius: "4px", padding: "1px 5px" },
  thumbRemove: { position: "absolute", top: "4px", right: "4px", background: "rgba(0,0,0,0.7)", color: "#fff", border: "none", borderRadius: "50%", width: "20px", height: "20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", lineHeight: 1, padding: 0 },
  advRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" },
  advTitle: { fontSize: "0.875rem", fontWeight: 600, color: "#e2e8f0", margin: 0 },
  advSub: { fontSize: "0.72rem", color: "#4b5563", marginTop: "0.15rem", marginBottom: 0 },
  toggle: { width: "48px", height: "26px", borderRadius: "13px", border: "none", cursor: "pointer", position: "relative", transition: "background-color 0.25s", flexShrink: 0, padding: 0 },
  toggleOn: { backgroundColor: "#f59e0b" },
  toggleOff: { backgroundColor: "#374151" },
  toggleKnob: { position: "absolute", top: "3px", left: "3px", width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "#fff", transition: "left 0.25s", display: "block" },
  toggleKnobOn: { left: "25px" },
  checkbox: { width: "18px", height: "18px", accentColor: "#f59e0b", cursor: "pointer", flexShrink: 0, marginTop: "2px" },
  actions: { display: "flex", gap: "0.75rem", justifyContent: "flex-end", flexWrap: "wrap", paddingBottom: "1.5rem" },
  btnPrimary: { padding: "0.75rem 2rem", backgroundColor: "#f59e0b", color: "#000", border: "none", borderRadius: "10px", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", minWidth: "150px", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" },
  btnCancel: { padding: "0.75rem 1.25rem", backgroundColor: "transparent", color: "#64748b", border: "1px solid #1f1f1f", borderRadius: "10px", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  btnDisabled: { backgroundColor: "#1f2937", color: "#4b5563", cursor: "not-allowed" },
  spinner: { display: "inline-block", width: "14px", height: "14px", border: "2px solid #000", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" },
};
