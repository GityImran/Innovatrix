"use client";

import React, { useState } from "react";

export default function Settings() {
  const [categories, setCategories] = useState([
    "Electronics",
    "Books",
    "Furniture",
    "Clothing",
  ]);
  const [newCategory, setNewCategory] = useState("");

  const addCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory("");
    }
  };

  const deleteCategory = (cat: string) => {
    setCategories(categories.filter((c) => c !== cat));
  };

  return (
    <div style={s.pageWrapper}>
      <h1 style={s.title}>Settings</h1>

      <section style={s.section}>
        <h2 style={s.sectionTitle}>Manage Categories</h2>
        <div style={s.inputGroup}>
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New category name"
            style={s.input}
          />
          <button onClick={addCategory} style={s.addBtn}>
            Add
          </button>
        </div>
        <ul style={s.list}>
          {categories.map((cat) => (
            <li key={cat} style={s.listItem}>
              <span>{cat}</span>
              <button
                onClick={() => deleteCategory(cat)}
                style={s.deleteBtn}
                title="Delete"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section style={s.section}>
        <h2 style={s.sectionTitle}>Admin Profile</h2>
        <div style={s.profileCard}>
          <div style={s.profileField}>
            <label style={s.label}>Name</label>
            <div style={s.value}>Admin User</div>
          </div>
          <div style={s.profileField}>
            <label style={s.label}>Email</label>
            <div style={s.value}>admin@college.edu</div>
          </div>
        </div>
      </section>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  pageWrapper: {
    minHeight: "100vh",
    backgroundColor: "#000",
    backgroundImage: "radial-gradient(circle at top right, #8b5cf610, transparent 40%), radial-gradient(circle at bottom left, #3b82f610, transparent 40%)",
    padding: "2rem",
    fontFamily: "'Inter', system-ui, sans-serif",
    color: "#f8fafc",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    marginBottom: "2rem",
  },
  section: {
    marginBottom: "3rem",
    maxWidth: "600px",
  },
  sectionTitle: {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#f8fafc",
    marginBottom: "1rem",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
    paddingBottom: "0.5rem",
  },
  inputGroup: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "1.5rem",
  },
  input: {
    flex: 1,
    background: "rgba(15, 23, 42, 0.4)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "0.75rem 1rem",
    borderRadius: "10px",
    color: "#f8fafc",
    outline: "none",
    fontSize: "0.95rem",
    transition: "border-color 0.2s",
  },
  addBtn: {
    backgroundColor: "rgba(34,197,94,0.1)",
    color: "#22c55e",
    border: "1px solid rgba(34,197,94,0.2)",
    padding: "0.75rem 1.5rem",
    borderRadius: "10px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  list: {
    listStyle: "none",
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  listItem: {
    background: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    padding: "1rem 1.25rem",
    borderRadius: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#f8fafc",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  deleteBtn: {
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.2)",
    color: "#ef4444",
    fontSize: "0.9rem",
    cursor: "pointer",
    padding: "0.4rem 0.6rem",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },
  profileCard: {
    background: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "2rem",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
  },
  profileField: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    padding: "1rem",
    borderRadius: "10px",
    border: "1px solid rgba(255, 255, 255, 0.03)",
  },
  label: {
    fontSize: "0.75rem",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  value: {
    fontSize: "1rem",
    color: "#f8fafc",
    fontWeight: 500,
  },
};
