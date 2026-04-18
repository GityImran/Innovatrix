"use client";

import React, { useEffect, useState, useCallback } from "react";
import styles from "./Header.module.css";

export default function UnreadBadge() {
  const [count, setCount] = useState(0);

  const fetchUnread = useCallback(async () => {
    try {
      const res = await fetch("/api/conversation/unread", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setCount(data.unreadCount ?? 0);
      }
    } catch {
      // silently ignore — badge just won't update
    }
  }, []);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 15_000); // refresh every 15 s
    return () => clearInterval(interval);
  }, [fetchUnread]);

  if (count <= 0) return null;

  return (
    <span className={styles.unreadBadge}>
      {count > 99 ? "99+" : count}
    </span>
  );
}
