"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  "Books",
  "Electronics",
  "Furniture",
  "Lab Equipment",
  "Hostel Supplies",
  "Others",
];

export default function NewRequestForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    budget: "",
    condition: "Good",
    description: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          budget: Number(formData.budget),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to post request");
      }

      router.push("/requests");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    padding: '14px 16px',
    color: '#f8fafc',
    fontSize: '15px',
    outline: 'none',
    transition: 'all 0.2s',
  };

  const focusProps = {
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
      e.currentTarget.style.border = '1px solid #f59e0b';
      e.currentTarget.style.background = 'rgba(245,158,11,0.02)';
      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.1)';
    },
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
      e.currentTarget.style.boxShadow = 'none';
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      style={{
        background: 'linear-gradient(145deg, rgba(15,15,15,0.95), rgba(10,10,10,0.95))',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '24px',
        padding: '40px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: '28px'
      }}
    >
      {/* Glow accent */}
      <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', background: 'rgba(245,158,11,0.05)', borderRadius: '50%', filter: 'blur(50px)', pointerEvents: 'none' }} />

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '16px', borderRadius: '12px', fontSize: '14px', fontWeight: 500 }}>
          {error}
        </div>
      )}

      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px' }}>
          What are you looking for? <span style={{ color: '#f59e0b' }}>*</span>
        </label>
        <input
          type="text"
          required
          placeholder="e.g. Looking for T-scale"
          style={inputStyle}
          {...focusProps}
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Category <span style={{ color: '#f59e0b' }}>*</span>
          </label>
          <select
            required
            style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
            {...focusProps}
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            <option value="" disabled>Select Category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} style={{ background: '#0a0a0a' }}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Budget (₹) <span style={{ color: '#f59e0b' }}>*</span>
          </label>
          <input
            type="number"
            required
            placeholder="500"
            style={inputStyle}
            {...focusProps}
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '12px' }}>
          Preferred Condition <span style={{ color: '#f59e0b' }}>*</span>
        </label>
        <div style={{ display: 'flex', gap: '16px' }}>
          {["New", "Good", "Used"].map((cond) => {
            const isSelected = formData.condition === cond;
            return (
              <button
                key={cond}
                type="button"
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  border: `1px solid ${isSelected ? '#f59e0b' : 'rgba(255,255,255,0.08)'}`,
                  background: isSelected ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.02)',
                  color: isSelected ? '#fbbf24' : '#94a3b8',
                  fontWeight: isSelected ? 800 : 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: isSelected ? '0 0 0 3px rgba(245,158,11,0.15)' : 'none'
                }}
                onClick={() => setFormData({ ...formData, condition: cond })}
              >
                {cond}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px' }}>
          Additional Details
        </label>
        <textarea
          rows={4}
          placeholder="Describe your requirement (e.g. urgent requirement, preferred brand, etc.)"
          style={{ ...inputStyle, resize: 'vertical' }}
          {...focusProps}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          marginTop: '12px',
          padding: '18px',
          background: loading ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
          color: loading ? '#64748b' : '#000',
          border: 'none',
          borderRadius: '14px',
          fontSize: '16px',
          fontWeight: 800,
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: loading ? 'none' : '0 12px 32px rgba(245,158,11,0.3)',
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}
        onMouseOver={(e) => {
          if (!loading) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 16px 40px rgba(245,158,11,0.4)';
          }
        }}
        onMouseOut={(e) => {
          if (!loading) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(245,158,11,0.3)';
          }
        }}
      >
        {loading ? "Posting..." : "Post Request"}
      </button>
    </form>
  );
}
