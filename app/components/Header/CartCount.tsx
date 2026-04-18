"use client";

import React, { useState, useEffect } from "react";
import styles from "./Header.module.css";

export default function CartCount({ initialCount = 0 }: { initialCount?: number }) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    // Only fetch if we're on the client
    const fetchCount = async () => {
      try {
        const res = await fetch("/api/cart");
        if (res.ok) {
          const data = await res.json();
          setCount(data.length);
        }
      } catch (err) {
        console.error("Failed to fetch cart count", err);
      }
    };

    fetchCount();
  }, []);

  return <span className={styles.cartCount}>{count}</span>;
}
