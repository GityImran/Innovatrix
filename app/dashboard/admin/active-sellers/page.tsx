"use client";

import React, { useEffect, useState } from "react";
import Table from "@/app/components/Table";
import { Eye, UserX, UserCheck, ArrowLeft, ExternalLink } from "lucide-react";

type Seller = {
  id: string;
  name: string;
  status: "active" | "disabled";
  listings: number;
  lastActive: string;
};

type SellerDetails = {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  collegeName: string;
  course: string;
  department?: string;
  studentStatus: string;
  yearBatch?: string;
  rollNumber?: string;
  idCardPhotoUrl: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
  status: string;
};

export default function ActiveSellers() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeller, setSelectedSeller] = useState<SellerDetails | null>(null);
  const [fetchingDetails, setFetchingDetails] = useState(false);

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = () => {
    setLoading(true);
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
  };

  const handleView = async (id: string) => {
    setFetchingDetails(true);
    try {
      const res = await fetch(`/api/admin/sellers/${id}`);
      const data = await res.json();
      setSelectedSeller(data);
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingDetails(false);
    }
  };

  const handleStatusChange = async (id: string, action: "disable" | "enable") => {
    if (!confirm(`Are you sure you want to ${action} this seller?`)) return;
    
    try {
      const res = await fetch(`/api/admin/sellers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        fetchSellers();
        if (selectedSeller && selectedSeller._id === id) {
          handleView(id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

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
          <button onClick={() => handleView(item.id)} style={s.viewBtn}>
            <Eye size={16} /> View
          </button>
          {item.status === "active" ? (
            <button onClick={() => handleStatusChange(item.id, "disable")} style={s.disableBtn}>
              <UserX size={16} /> Disable
            </button>
          ) : (
            <button onClick={() => handleStatusChange(item.id, "enable")} style={s.enableBtn}>
              <UserCheck size={16} /> Enable
            </button>
          )}
        </div>
      ),
    },
  ];

  if (selectedSeller) {
    return (
      <div style={s.detailPage}>
        <button onClick={() => setSelectedSeller(null)} style={s.backBtn}>
          <ArrowLeft size={18} /> Back to List
        </button>

        <div style={s.detailGrid}>
          <div style={s.detailCard}>
            <h2 style={s.cardTitle}>Seller Details</h2>
            <div style={s.infoGrid}>
              <InfoItem label="Full Name" value={selectedSeller.fullName} />
              <InfoItem label="Email" value={selectedSeller.email} />
              <InfoItem label="Phone" value={selectedSeller.phoneNumber} />
              <InfoItem label="College" value={selectedSeller.collegeName} />
              <InfoItem label="Course" value={selectedSeller.course} />
              <InfoItem label="Department" value={selectedSeller.department || "N/A"} />
              <InfoItem label="Status" value={selectedSeller.studentStatus} />
              <InfoItem label="Batch" value={selectedSeller.yearBatch || "N/A"} />
              <InfoItem label="Roll No" value={selectedSeller.rollNumber || "N/A"} />
            </div>

            <h2 style={{ ...s.cardTitle, marginTop: "2rem" }}>Payment Information</h2>
            <div style={s.infoGrid}>
              <InfoItem label="Holder Name" value={selectedSeller.accountHolderName} />
              <InfoItem label="Account No" value={selectedSeller.accountNumber} />
              <InfoItem label="IFSC Code" value={selectedSeller.ifscCode} />
              <InfoItem label="UPI ID" value={selectedSeller.upiId} />
            </div>
          </div>

          <div style={s.sideCol}>
            <div style={s.detailCard}>
              <h2 style={s.cardTitle}>ID Verification</h2>
              <div style={s.imageWrapper}>
                <img src={selectedSeller.idCardPhotoUrl} style={s.idImage} alt="ID Card" />
                <a 
                  href={selectedSeller.idCardPhotoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={s.externalLink}
                >
                  <ExternalLink size={16} /> View Full Image
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={s.infoItem}>
      <label style={s.infoLabel}>{label}</label>
      <div style={s.infoValue}>{value}</div>
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
    backgroundColor: "rgba(59,130,246,0.1)",
    color: "#3b82f6",
    border: "1px solid rgba(59,130,246,0.2)",
    padding: "0.4rem 0.8rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.75rem",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
  },
  disableBtn: {
    backgroundColor: "rgba(239,68,68,0.1)",
    color: "#ef4444",
    border: "1px solid rgba(239,68,68,0.2)",
    padding: "0.4rem 0.8rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.75rem",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
  },
  enableBtn: {
    backgroundColor: "rgba(34,197,94,0.1)",
    color: "#22c55e",
    border: "1px solid rgba(34,197,94,0.2)",
    padding: "0.4rem 0.8rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.75rem",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
  },
  loading: {
    color: "#94a3b8",
    textAlign: "center",
    marginTop: "4rem",
  },
  detailPage: {
    animation: "fadeIn 0.3s ease-out",
  },
  backBtn: {
    backgroundColor: "transparent",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "2rem",
    fontSize: "1rem",
    fontWeight: 600,
  },
  detailGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 350px",
    gap: "2rem",
  },
  detailCard: {
    backgroundColor: "#0a0a0a",
    border: "1px solid #1f1f1f",
    padding: "2rem",
    borderRadius: "16px",
  },
  cardTitle: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#f8fafc",
    marginBottom: "1.5rem",
    borderBottom: "1px solid #1f1f1f",
    paddingBottom: "1rem",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "1.5rem",
  },
  infoItem: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  infoLabel: {
    fontSize: "0.75rem",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  infoValue: {
    fontSize: "1rem",
    color: "#f8fafc",
    fontWeight: 500,
  },
  sideCol: {
    display: "flex",
    flexDirection: "column",
  },
  imageWrapper: {
    position: "relative",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #2a2a2a",
  },
  idImage: {
    width: "100%",
    height: "auto",
    display: "block",
  },
  externalLink: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    backgroundColor: "rgba(0,0,0,0.7)",
    color: "#fff",
    padding: "0.75rem",
    fontSize: "0.875rem",
    textDecoration: "none",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backdropFilter: "blur(4px)",
  },
};

