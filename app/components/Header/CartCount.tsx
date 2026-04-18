"use client";

import React, { useState, useEffect } from "react";

export default function CartCount() {
  const [count, setCount] = useState(0);

  const updateCount = async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setCount(Array.isArray(data) ? data.length : 0);
      }
    } catch {
      setCount(0);
    }
  };

  useEffect(() => {
    updateCount();
    // Refresh when a cartUpdated event fires (after adding an item)
    window.addEventListener("cartUpdated", updateCount);
    return () => window.removeEventListener("cartUpdated", updateCount);
  }, []);

  if (count === 0) return null;

  return (
    <span style={{
      position: "absolute",
      top: "-4px",
      right: "-4px",
      background: "#f59e0b",
      color: "#000",
      fontSize: "10px",
      fontWeight: 900,
      width: "17px",
      height: "17px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "2px solid #080808",
      lineHeight: 1,
    }}>
      {count > 9 ? "9+" : count}
    </span>
  );
}
