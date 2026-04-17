"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface Props {
  selectClassName?: string;
  inputClassName?: string;
  buttonClassName?: string;
}

/**
 * Client-side search form: routes to /search?q=<query> on submit.
 * Kept separate from Header (which is a server component).
 */
export default function SearchForm({
  selectClassName,
  inputClassName,
  buttonClassName,
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "contents" }} role="search">
      <select className={selectClassName} aria-label="Category filter">
        <option>All</option>
        <option>Books</option>
        <option>Electronics</option>
        <option>Furniture</option>
        <option>Lab Equipment</option>
        <option>Hostel Supplies</option>
        <option>Others</option>
      </select>
      <input
        id="header-search-input"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={inputClassName}
        placeholder="Search for textbooks, calculators, bikes…"
        autoComplete="off"
        spellCheck={false}
        aria-label="Search campus listings"
      />
      <button
        id="header-search-btn"
        type="submit"
        className={buttonClassName}
        aria-label="Submit search"
      >
        🔍
      </button>
    </form>
  );
}
