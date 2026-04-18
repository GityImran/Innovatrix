"use client";

import React, { useEffect, useState } from "react";
import Table from "@/app/components/Table";

type Seller = {
  id: string;
  name: string;
  status: "active" | "disabled";
  listings: number;
  lastActive: string;
};

export default function ActiveSellers() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/sellers")
      .then((res) => res.json())
      .then((data) => {
        setSellers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const columns = [
    { header: "Name", accessor: "name" as const },
    {
      header: "Status",
      accessor: (item: Seller) => (
        <span
          style={{
            ...s.badge,
            backgroundColor:
              item.status === "active" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
            color: item.status === "active" ? "#22c55e" : "#ef4444",
          }}
        >
          {item.status}
        </span>
      ),
    },
    { header: "Listings", accessor: "listings" as const },
    {
      header: "Last Active",
      accessor: (item: Seller) => new Date(item.lastActive).toLocaleDateString(),
    },
    {
      header: "Actions",
      accessor: (item: Seller) => (
        <div style={s.actions}>
          <button style={s.viewBtn}>View</button>
          <button style={s.disableBtn}>Disable</button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h1 style={s.title}>Active Sellers</h1>
      {loading ? (
        <div style={s.loading}>Loading sellers...</div>
      ) : (
        <Table columns={columns} data={sellers} keyExtractor={(item) => item.id} />
      )}
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
  badge: {
    padding: "0.25rem 0.6rem",
    borderRadius: "9999px",
    fontSize: "0.75rem",
    fontWeight: 600,
    textTransform: "capitalize",
  },
  actions: {
    display: "flex",
    gap: "0.5rem",
  },
  viewBtn: {
    backgroundColor: "#3b82f6",
    color: "#fff",
    border: "none",
    padding: "0.4rem 0.8rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.75rem",
    fontWeight: 600,
  },
  disableBtn: {
    backgroundColor: "transparent",
    color: "#ef4444",
    border: "1px solid #ef4444",
    padding: "0.4rem 0.8rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.75rem",
    fontWeight: 600,
  },
  loading: {
    color: "#94a3b8",
    textAlign: "center",
    marginTop: "4rem",
  },
};
