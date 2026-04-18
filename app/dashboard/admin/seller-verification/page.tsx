"use client";

import React, { useEffect, useState } from "react";
import Table from "@/app/components/Table";

type SellerRequest = {
  _id: string;
  name: string;
  email: string;
  status: "pending" | "approved" | "rejected";
  appliedAt: string;
};

export default function SellerVerification() {
  const [requests, setRequests] = useState<SellerRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = () => {
    setLoading(true);
    fetch("/api/admin/verification")
      .then((res) => res.json())
      .then((data) => {
        setRequests(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleAction = async (id: string, status: "approved" | "rejected") => {
    try {
      const res = await fetch(`/api/admin/verification/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { header: "Name", accessor: "name" as const },
    { header: "Email", accessor: "email" as const },
    {
      header: "Status",
      accessor: (item: SellerRequest) => (
        <span
          style={{
            ...s.badge,
            backgroundColor:
              item.status === "approved"
                ? "rgba(34,197,94,0.1)"
                : item.status === "rejected"
                ? "rgba(239,68,68,0.1)"
                : "rgba(245,158,11,0.1)",
            color:
              item.status === "approved"
                ? "#22c55e"
                : item.status === "rejected"
                ? "#ef4444"
                : "#f59e0b",
          }}
        >
          {item.status}
        </span>
      ),
    },
    {
      header: "Applied Date",
      accessor: (item: SellerRequest) => new Date(item.appliedAt).toLocaleDateString(),
    },
    {
      header: "Actions",
      accessor: (item: SellerRequest) => (
        <div style={s.actions}>
          {item.status === "pending" && (
            <>
              <button
                onClick={() => handleAction(item._id, "approved")}
                style={s.approveBtn}
              >
                Approve
              </button>
              <button
                onClick={() => handleAction(item._id, "rejected")}
                style={s.rejectBtn}
              >
                Reject
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <h1 style={s.title}>Seller Verification</h1>
      {loading ? (
        <div style={s.loading}>Loading requests...</div>
      ) : (
        <Table
          columns={columns}
          data={requests}
          keyExtractor={(item) => item._id}
        />
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
  approveBtn: {
    backgroundColor: "#22c55e",
    color: "#fff",
    border: "none",
    padding: "0.4rem 0.8rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.75rem",
    fontWeight: 600,
  },
  rejectBtn: {
    backgroundColor: "#ef4444",
    color: "#fff",
    border: "none",
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
