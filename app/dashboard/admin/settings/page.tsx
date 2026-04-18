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
    <div>
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
            <div style={s.value}>admin@campusmart.com</div>
          </div>
        </div>
      </section>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  title: {
    fontSize: "1.875rem",
    fontWeight: 700,
    color: "#f8fafc",
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
  },
  inputGroup: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "1rem",
  },
  input: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    border: "1px solid #1f1f1f",
    padding: "0.6rem 1rem",
    borderRadius: "8px",
    color: "#f8fafc",
    outline: "none",
  },
  addBtn: {
    backgroundColor: "#f59e0b",
    color: "#000",
    border: "none",
    padding: "0.6rem 1.2rem",
    borderRadius: "8px",
    fontWeight: 600,
    cursor: "pointer",
  },
  list: {
    listStyle: "none",
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  listItem: {
    backgroundColor: "#0a0a0a",
    border: "1px solid #1f1f1f",
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#f8fafc",
  },
  deleteBtn: {
    background: "transparent",
    border: "none",
    color: "#ef4444",
    fontSize: "1.1rem",
    cursor: "pointer",
    padding: "0.2rem 0.5rem",
  },
  profileCard: {
    backgroundColor: "#0a0a0a",
    border: "1px solid #1f1f1f",
    padding: "1.5rem",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  profileField: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
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
  },
};
