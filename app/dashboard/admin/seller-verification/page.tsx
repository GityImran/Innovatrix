"use client";

import React, { useEffect, useState } from "react";
import Table from "@/app/components/Table";
import { Eye, Check, X, ExternalLink, ArrowLeft } from "lucide-react";

type SellerRequest = {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
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
  status: "pending" | "approved" | "rejected";
  appliedAt: string;
};

export default function SellerVerification() {
  const [requests, setRequests] = useState<SellerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<SellerRequest | null>(null);

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
        if (selectedRequest?._id === id) {
          setSelectedRequest(prev => prev ? { ...prev, status } : null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { header: "Name", accessor: "fullName" as const },
    { header: "Email", accessor: "email" as const },
    { header: "College", accessor: "collegeName" as const },
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
      header: "Actions",
      accessor: (item: SellerRequest) => (
        <div style={s.actions}>
          <button onClick={() => setSelectedRequest(item)} style={s.viewBtn}>
            <Eye size={16} /> View Details
          </button>
        </div>
      ),
    },
  ];

  if (selectedRequest) {
    return (
      <div style={s.detailPage}>
        <button onClick={() => setSelectedRequest(null)} style={s.backBtn}>
          <ArrowLeft size={18} /> Back to List
        </button>

        <div style={s.detailGrid}>
          {/* Main Info */}
          <div style={s.detailCard}>
            <h2 style={s.cardTitle}>Application Details</h2>
            <div style={s.infoGrid}>
              <InfoItem label="Full Name" value={selectedRequest.fullName} />
              <InfoItem label="Email" value={selectedRequest.email} />
              <InfoItem label="Phone" value={selectedRequest.phoneNumber} />
              <InfoItem label="College" value={selectedRequest.collegeName} />
              <InfoItem label="Course" value={selectedRequest.course} />
              <InfoItem label="Department" value={selectedRequest.department || "N/A"} />
              <InfoItem label="Status" value={selectedRequest.studentStatus} />
              <InfoItem label="Batch" value={selectedRequest.yearBatch || "N/A"} />
              <InfoItem label="Roll No" value={selectedRequest.rollNumber || "N/A"} />
            </div>

            <h2 style={{ ...s.cardTitle, marginTop: "2rem" }}>Payment Information</h2>
            <div style={s.infoGrid}>
              <InfoItem label="Holder Name" value={selectedRequest.accountHolderName} />
              <InfoItem label="Account No" value={selectedRequest.accountNumber} />
              <InfoItem label="IFSC Code" value={selectedRequest.ifscCode} />
              <InfoItem label="UPI ID" value={selectedRequest.upiId} />
            </div>
          </div>

          {/* ID Photo & Actions */}
          <div style={s.sideCol}>
            <div style={s.detailCard}>
              <h2 style={s.cardTitle}>ID Verification</h2>
              <div style={s.imageWrapper}>
                <img src={selectedRequest.idCardPhotoUrl} style={s.idImage} alt="ID Card" />
                <a 
                  href={selectedRequest.idCardPhotoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={s.externalLink}
                >
                  <ExternalLink size={16} /> View Full Image
                </a>
              </div>
            </div>

            <div style={{ ...s.detailCard, marginTop: "1.5rem" }}>
              <h2 style={s.cardTitle}>Take Action</h2>
              <p style={s.statusInfo}>Current Status: <b>{selectedRequest.status.toUpperCase()}</b></p>
              <div style={s.actionGrid}>
                <button 
                  onClick={() => handleAction(selectedRequest._id, "approved")}
                  style={{ ...s.approveBtn, width: "100%", opacity: selectedRequest.status === "approved" ? 0.5 : 1 }}
                  disabled={selectedRequest.status === "approved"}
                >
                  <Check size={18} /> Approve Seller
                </button>
                <button 
                  onClick={() => handleAction(selectedRequest._id, "rejected")}
                  style={{ ...s.rejectBtn, width: "100%", opacity: selectedRequest.status === "rejected" ? 0.5 : 1 }}
                  disabled={selectedRequest.status === "rejected"}
                >
                  <X size={18} /> Reject Application
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.pageWrapper}>
      <h1 style={s.title}>Seller Verification</h1>
      {loading ? (
        <div style={s.loadingContainer}>
          <div style={s.spinner} />
          <p style={s.loadingText}>Loading requests...</p>
        </div>
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

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={s.infoItem}>
      <label style={s.infoLabel}>{label}</label>
      <div style={s.infoValue}>{value}</div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  pageWrapper: {
    minHeight: "100vh",
    backgroundColor: "#000",
    backgroundImage: "radial-gradient(circle at top right, #f59e0b10, transparent 40%), radial-gradient(circle at bottom left, #22c55e10, transparent 40%)",
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
  badge: {
    padding: "0.25rem 0.6rem",
    borderRadius: "9999px",
    fontSize: "0.75rem",
    fontWeight: 600,
    textTransform: "capitalize",
    border: "1px solid transparent",
  },
  actions: {
    display: "flex",
    gap: "0.5rem",
  },
  viewBtn: {
    backgroundColor: "rgba(245,158,11,0.05)",
    color: "#f59e0b",
    border: "1px solid rgba(245,158,11,0.2)",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    transition: "all 0.2s ease",
  },
  detailPage: {
    animation: "fadeIn 0.3s ease-out",
    minHeight: "100vh",
    backgroundColor: "#000",
    backgroundImage: "radial-gradient(circle at top right, #f59e0b10, transparent 40%), radial-gradient(circle at bottom left, #22c55e10, transparent 40%)",
    padding: "2rem",
    fontFamily: "'Inter', system-ui, sans-serif",
    color: "#f8fafc",
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
    transition: "color 0.2s",
  },
  detailGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 350px",
    gap: "2rem",
  },
  detailCard: {
    background: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "2rem",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
  },
  cardTitle: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#f8fafc",
    marginBottom: "1.5rem",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
    paddingBottom: "1rem",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "1.5rem",
  },
  infoItem: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    padding: "1rem",
    borderRadius: "10px",
    border: "1px solid rgba(255, 255, 255, 0.03)",
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
  actionGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  statusInfo: {
    color: "#94a3b8",
    fontSize: "0.875rem",
    marginBottom: "1.5rem",
    padding: "0.75rem",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: "8px",
    textAlign: "center",
  },
  approveBtn: {
    backgroundColor: "rgba(34,197,94,0.1)",
    color: "#22c55e",
    border: "1px solid rgba(34,197,94,0.2)",
    padding: "0.75rem",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    transition: "all 0.2s ease",
  },
  rejectBtn: {
    backgroundColor: "rgba(239,68,68,0.1)",
    color: "#ef4444",
    border: "1px solid rgba(239,68,68,0.2)",
    padding: "0.75rem",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    transition: "all 0.2s ease",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "4rem",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid rgba(245, 158, 11, 0.1)",
    borderTop: "3px solid #f59e0b",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    marginTop: "1.5rem",
    color: "#64748b",
    fontSize: "0.9rem",
    letterSpacing: "0.05em",
  },
};

// Add standard spin keyframes using a small hack or rely on existing global styles.
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes spin { 100% { transform: rotate(360deg); } }
  `;
  document.head.appendChild(style);
}

