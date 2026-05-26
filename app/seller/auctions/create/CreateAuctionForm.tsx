"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadImage } from "@/lib/upload";

const CATEGORIES = [
  "Books",
  "Electronics",
  "Furniture",
  "Lab Equipment",
  "Hostel Supplies",
  "Others",
];

export default function CreateAuctionForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    productTitle: "",
    description: "",
    category: "",
    condition: "Good",
    startingPrice: "",
    minIncrement: "10",
    durationHours: "24",
    reservePrice: "",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (images.length === 0) throw new Error("Please upload at least one image");
      if (!formData.category) throw new Error("Please select a category");

      // 1. Upload images to Cloudinary
      const imageUrls = await Promise.all(
        images.map(async (file) => {
          const res = await uploadImage(file);
          return res.imageUrl;
        })
      );

      // 2. Create auction
      const res = await fetch("/api/auctions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          startingPrice: Number(formData.startingPrice),
          minIncrement: Number(formData.minIncrement),
          durationHours: Number(formData.durationHours),
          reservePrice: formData.reservePrice ? Number(formData.reservePrice) : undefined,
          images: imageUrls,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create auction");

      router.push("/seller/auctions");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <form onSubmit={handleSubmit} style={s.form} noValidate>
        {error && (
          <div style={s.errorBanner}>
            <span>⚠️</span> {error}
          </div>
        )}

        <div style={s.heading}>
          <h1 style={s.title}>Launch an Auction</h1>
          <p style={s.subtitle}>Sell your items to the highest bidder in the campus marketplace.</p>
        </div>

        {/* ════════════ BASIC INFO ════════════ */}
        <div style={s.card}>
          <p style={s.cardHeading}>📋 Product Details</p>

          <div style={s.field}>
            <label style={s.label}>Product Title <span style={s.req}>*</span></label>
            <input
              type="text"
              required
              placeholder="e.g. Scientific Calculator Casio FX-991ES"
              style={s.input}
              value={formData.productTitle}
              onChange={e => setFormData({ ...formData, productTitle: e.target.value })}
              onFocus={e => Object.assign(e.target.style, s.focusStyle)}
              onBlur={e => Object.assign(e.target.style, s.input)}
            />
          </div>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ flex: 1, ...s.field }}>
              <label style={s.label}>Category <span style={s.req}>*</span></label>
              <select
                required
                style={s.select}
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="" disabled>Select Category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ flex: 1, ...s.field }}>
              <label style={s.label}>Condition <span style={s.req}>*</span></label>
              <select
                required
                style={s.select}
                value={formData.condition}
                onChange={e => setFormData({ ...formData, condition: e.target.value })}
              >
                {["New", "Good", "Used"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label}>Description <span style={s.req}>*</span></label>
            <textarea
              rows={4}
              required
              placeholder="Tell buyers about your product. Include details about its condition, features, etc."
              style={s.textarea}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              onFocus={e => Object.assign(e.target.style, ...[s.textarea, s.focusStyle])}
              onBlur={e => Object.assign(e.target.style, s.textarea)}
            />
          </div>
        </div>

        {/* ════════════ AUCTION SETTINGS ════════════ */}
        <div style={s.card}>
          <p style={s.cardHeading}>⏳ Bidding & Time</p>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ flex: 1, ...s.field }}>
              <label style={s.label}>Starting Bid (₹) <span style={s.req}>*</span></label>
              <input
                type="number"
                required
                placeholder="e.g. 500"
                style={s.input}
                value={formData.startingPrice}
                onChange={e => setFormData({ ...formData, startingPrice: e.target.value })}
                onFocus={e => Object.assign(e.target.style, s.focusStyle)}
                onBlur={e => Object.assign(e.target.style, s.input)}
              />
            </div>

            <div style={{ flex: 1, ...s.field }}>
              <label style={s.label}>Min. Increment (₹) <span style={s.req}>*</span></label>
              <input
                type="number"
                required
                placeholder="e.g. 10"
                style={s.input}
                value={formData.minIncrement}
                onChange={e => setFormData({ ...formData, minIncrement: e.target.value })}
                onFocus={e => Object.assign(e.target.style, s.focusStyle)}
                onBlur={e => Object.assign(e.target.style, s.input)}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
            <div style={{ flex: 1, ...s.field }}>
              <label style={s.label}>Duration <span style={s.req}>*</span></label>
              <select
                style={s.select}
                value={formData.durationHours}
                onChange={e => setFormData({ ...formData, durationHours: e.target.value })}
              >
                {[1, 6, 12, 24, 48, 72].map(h => (
                  <option key={h} value={h}>{h} {h === 1 ? 'Hour' : 'Hours'}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: 1, ...s.field }}>
              <label style={s.label}>
                Reserve Price (₹) <span style={s.optional}> — optional</span>
              </label>
              <input
                type="number"
                placeholder="Secret minimum"
                style={s.input}
                value={formData.reservePrice}
                onChange={e => setFormData({ ...formData, reservePrice: e.target.value })}
                onFocus={e => Object.assign(e.target.style, s.focusStyle)}
                onBlur={e => Object.assign(e.target.style, s.input)}
              />
            </div>
          </div>
        </div>

        {/* ════════════ IMAGES ════════════ */}
        <div style={s.card}>
          <p style={s.cardHeading}>
            📸 Upload Media <span style={s.req}>*</span>
          </p>

          <label style={s.dropzone}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📷</div>
            <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: 0 }}>Click to select photos</p>
            <input type="file" multiple accept="image/*" style={{ display: "none" }} onChange={handleImageChange} />
          </label>

          {previews.length > 0 && (
            <div style={s.thumbGrid}>
              {previews.map((src, idx) => (
                <div key={idx} style={s.thumbWrap}>
                  <img src={src} alt="" style={s.thumb} />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    style={s.thumbRemove}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ════════════ ACTIONS ════════════ */}
        <div style={s.actions}>
          <button
            type="button"
            style={s.btnSecondary}
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              ...s.btnPrimary,
              ...(loading ? s.btnDisabled : {}),
            }}
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={s.spinner} /> Initializing...
              </span>
            ) : (
              " Launch Auction 🔥"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

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
    margin: "0 0 0.35rem",
  },
  subtitle: {
    color: "#64748b",
    fontSize: "0.875rem",
    margin: 0,
  },
  errorBanner: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    color: "#ef4444",
    padding: "1rem",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.9rem",
    fontWeight: 700,
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
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#2a2a2a",
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
  textarea: {
    width: "100%",
    padding: "0.7rem 1rem",
    backgroundColor: "#0a0a0a",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#2a2a2a",
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
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#2a2a2a",
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
  dropzone: {
    borderWidth: "2px",
    borderStyle: "dashed",
    borderColor: "#2a2a2a",
    borderRadius: "12px",
    padding: "2.5rem",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.2s",
    backgroundColor: "#0a0a0a",
    display: "block",
  },
  thumbGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
    gap: "1rem",
    marginTop: "1rem",
  },
  thumbWrap: {
    position: "relative",
    aspectRatio: "1/1",
    borderRadius: "8px",
    overflow: "hidden",
    border: "1px solid #1f1f1f",
  },
  thumb: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  thumbRemove: {
    position: "absolute",
    top: "0.3rem",
    right: "0.3rem",
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    backgroundColor: "rgba(0,0,0,0.7)",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    transition: "background-color 0.2s",
  },
  actions: {
    display: "flex",
    gap: "1rem",
    marginTop: "1rem",
    paddingBottom: "4rem",
  },
  btnPrimary: {
    flex: 2,
    padding: "0.8rem",
    backgroundColor: "#f59e0b",
    color: "#000",
    border: "none",
    borderRadius: "10px",
    fontWeight: 700,
    fontSize: "0.95rem",
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  btnSecondary: {
    flex: 1,
    padding: "0.8rem",
    backgroundColor: "transparent",
    color: "#94a3b8",
    border: "1px solid #2a2a2a",
    borderRadius: "10px",
    fontWeight: 600,
    fontSize: "0.9rem",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  btnDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid rgba(0,0,0,0.1)",
    borderTopColor: "#000",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};
