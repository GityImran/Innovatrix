"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  User, 
  GraduationCap, 
  CreditCard, 
  CheckCircle, 
  ChevronRight, 
  Upload,
  ArrowLeft,
  XCircle,
  Clock
} from "lucide-react";

type FormState = {
  fullName: string;
  email: string;
  phoneNumber: string;
  collegeName: string;
  course: "Engineering" | "Medical" | "BSc" | "BCA" | "BBA" | "Other" | "";
  department: string;
  studentStatus: "Current Student" | "Passout" | "";
  yearBatch: string;
  rollNumber: string;
  idCardPhotoUrl: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
};

const SECTIONS = [
  { id: 1, label: "Basic Details", icon: <User size={20} /> },
  { id: 2, label: "College Details", icon: <GraduationCap size={20} /> },
  { id: 3, label: "Payment Details", icon: <CreditCard size={20} /> },
];

export default function SellerRegistrationPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [activeSection, setActiveSection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"none" | "pending" | "approved" | "rejected" | "disabled" | "loading">("loading");
  const [formData, setFormData] = useState<FormState>({
    fullName: "",
    email: "",
    phoneNumber: "",
    collegeName: "",
    course: "",
    department: "",
    studentStatus: "",
    yearBatch: "",
    rollNumber: "",
    idCardPhotoUrl: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    upiId: "",
  });

  useEffect(() => {
    fetch("/api/seller/register")
      .then((res) => res.json())
      .then((data) => {
        if (data.status) setStatus(data.status);
        else setStatus("none");

        // Pre-fill name and email from session if status is none
        if (!data.status || data.status === "none") {
          if (session?.user) {
            setFormData((prev) => ({
              ...prev,
              fullName: session.user.name || "",
              email: session.user.email || "",
            }));
          }
        }
      })
      .catch(() => setStatus("none"));
  }, [session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });
      const data = await res.json();
      if (data.imageUrl) {
        setFormData((prev) => ({ ...prev, idCardPhotoUrl: data.imageUrl }));
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/seller/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus("pending");
      }
    } catch (err) {
      console.error("Submission failed", err);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") return <div style={s.center}>Loading...</div>;

  if (status === "approved") {
    const isVerified = (session?.user as any)?.isVerified;
    if (isVerified) {
      router.push("/seller");
      return null;
    }

    // If approved but session is not updated, show a button to refresh session
    return (
      <div style={s.statusContainer}>
        <div style={s.statusCard}>
          <CheckCircle size={64} color="#22c55e" style={{ marginBottom: "1.5rem" }} />
          <h1 style={s.statusTitle}>Congratulations!</h1>
          <p style={s.statusText}>
            Your application has been approved! You are now a verified seller. 
            Please click the button below to start listing your products.
          </p>
          <button 
            onClick={() => {
              // Try to update session and redirect
              update().then(() => {
                router.push("/seller");
                // Fallback: full reload if session update doesn't trigger middleware change
                setTimeout(() => window.location.reload(), 500);
              });
            }} 
            style={s.returnBtn}
          >
            Go to Seller Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div style={s.statusContainer}>
        <div style={s.statusCard}>
          <Clock size={64} color="#f59e0b" style={{ marginBottom: "1.5rem" }} />
          <h1 style={s.statusTitle}>Application Under Review</h1>
          <p style={s.statusText}>
            Thank you for applying! Our team is currently reviewing your details. 
            We will notify you once your account is verified.
          </p>
          <button onClick={() => router.push("/")} style={s.returnBtn}>
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (status === "rejected" || status === "disabled") {
    return (
      <div style={s.statusContainer}>
        <div style={s.statusCard}>
          <XCircle size={64} color="#ef4444" style={{ marginBottom: "1.5rem" }} />
          <h1 style={s.statusTitle}>
            {status === "rejected" ? "Application Rejected" : "Account Disabled"}
          </h1>
          <p style={s.statusText}>
            {status === "rejected" 
              ? "We're sorry, but your seller application was not approved at this time. Please contact support if you believe this was an error."
              : "Your seller account has been disabled by the administrator. Please contact support for further information."}
          </p>
          <button onClick={() => router.push("/")} style={s.returnBtn}>
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case 1:
        return (
          <div style={s.section}>
            <h2 style={s.sectionHeader}>Basic Details</h2>
            <div style={s.field}>
              <label style={s.label}>Full Name <span style={s.star}>*</span></label>
              <input 
                type="text" name="fullName" value={formData.fullName} 
                readOnly style={{ ...s.input, backgroundColor: "#0f0f0f", color: "#64748b", cursor: "not-allowed" }} 
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>Email <span style={s.star}>*</span></label>
              <input 
                type="email" name="email" value={formData.email} 
                readOnly style={{ ...s.input, backgroundColor: "#0f0f0f", color: "#64748b", cursor: "not-allowed" }} 
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>Phone Number <span style={s.star}>*</span></label>
              <input 
                type="tel" name="phoneNumber" value={formData.phoneNumber} 
                onChange={handleInputChange} style={s.input} placeholder="Enter phone number" 
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div style={s.section}>
            <h2 style={s.sectionHeader}>College Details</h2>
            <div style={s.field}>
              <label style={s.label}>College Name <span style={s.star}>*</span></label>
              <input 
                type="text" name="collegeName" value={formData.collegeName} 
                onChange={handleInputChange} style={s.input} placeholder="Enter college name" 
              />
            </div>
            <div style={s.row}>
              <div style={{ flex: 1 }}>
                <label style={s.label}>Course <span style={s.star}>*</span></label>
                <select 
                  name="course" value={formData.course} 
                  onChange={handleInputChange} style={s.input}
                >
                  <option value="">Select Course</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Medical">Medical</option>
                  <option value="BSc">BSc</option>
                  <option value="BCA">BCA</option>
                  <option value="BBA">BBA</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              {(formData.course === "Engineering" || formData.course === "Medical") && (
                <div style={{ flex: 1 }}>
                  <label style={s.label}>Department <span style={s.star}>*</span></label>
                  <input 
                    type="text" name="department" value={formData.department} 
                    onChange={handleInputChange} style={s.input} placeholder="Enter department" 
                  />
                </div>
              )}
            </div>
            <div style={s.row}>
              <div style={{ flex: 1 }}>
                <label style={s.label}>Status <span style={s.star}>*</span></label>
                <select 
                  name="studentStatus" value={formData.studentStatus} 
                  onChange={handleInputChange} style={s.input}
                >
                  <option value="">Select Status</option>
                  <option value="Current Student">Current Student</option>
                  <option value="Passout">Passout</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={s.label}>Year / Batch</label>
                <input 
                  type="text" name="yearBatch" value={formData.yearBatch} 
                  onChange={handleInputChange} style={s.input} placeholder="e.g. 2024" 
                />
              </div>
            </div>
            <div style={s.field}>
              <label style={s.label}>Roll Number</label>
              <input 
                type="text" name="rollNumber" value={formData.rollNumber} 
                onChange={handleInputChange} style={s.input} placeholder="Enter roll number" 
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>Upload College ID Card <span style={s.star}>*</span></label>
              <div style={s.uploadArea}>
                <input type="file" onChange={handlePhotoUpload} style={s.fileInput} id="id-upload" />
                <label htmlFor="id-upload" style={s.uploadLabel}>
                  {formData.idCardPhotoUrl ? (
                    <img src={formData.idCardPhotoUrl} style={s.previewImg} alt="ID Preview" />
                  ) : (
                    <>
                      <Upload size={24} />
                      <span>{loading ? "Uploading..." : "Click to upload ID photo"}</span>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div style={s.section}>
            <h2 style={s.sectionHeader}>Payment Details</h2>
            <div style={s.field}>
              <label style={s.label}>Account Holder Name <span style={s.star}>*</span></label>
              <input 
                type="text" name="accountHolderName" value={formData.accountHolderName} 
                onChange={handleInputChange} style={s.input} placeholder="Enter name as on passbook" 
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>Account Number <span style={s.star}>*</span></label>
              <input 
                type="text" name="accountNumber" value={formData.accountNumber} 
                onChange={handleInputChange} style={s.input} placeholder="Enter account number" 
              />
            </div>
            <div style={s.row}>
              <div style={{ flex: 1 }}>
                <label style={s.label}>IFSC Code <span style={s.star}>*</span></label>
                <input 
                  type="text" name="ifscCode" value={formData.ifscCode} 
                  onChange={handleInputChange} style={s.input} placeholder="IFSC" 
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={s.label}>UPI ID <span style={s.star}>*</span></label>
                <input 
                  type="text" name="upiId" value={formData.upiId} 
                  onChange={handleInputChange} style={s.input} placeholder="e.g. user@upi" 
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={s.page}>
      <div style={s.container}>
        {/* Sidebar */}
        <aside style={s.sidebar}>
          <div style={s.sidebarHeader}>
            <h1 style={s.sidebarTitle}>SELLER FORM</h1>
            <p style={s.sidebarSubtitle}>Join our marketplace</p>
          </div>
          <div style={s.steps}>
            {SECTIONS.map((section) => (
              <div 
                key={section.id} 
                style={{
                  ...s.step,
                  ...(activeSection === section.id ? s.stepActive : {})
                }}
              >
                <span style={s.stepIcon}>{section.icon}</span>
                <span style={s.stepLabel}>{section.label}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Form */}
        <main style={s.main}>
          <form onSubmit={handleSubmit} style={s.form}>
            {renderSection()}
            
            <div style={s.actions}>
              {activeSection > 1 && (
                <button 
                  type="button" 
                  onClick={() => setActiveSection(activeSection - 1)}
                  style={s.backBtn}
                >
                  <ArrowLeft size={18} /> Back
                </button>
              )}
              {activeSection < 3 ? (
                <button 
                  type="button" 
                  onClick={() => setActiveSection(activeSection + 1)}
                  style={s.nextBtn}
                >
                  Next <ChevronRight size={18} />
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={loading}
                  style={s.submitBtn}
                >
                  {loading ? "Submitting..." : "Submit Application"}
                </button>
              )}
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
  },
  container: {
    width: "100%",
    maxWidth: "1000px",
    display: "flex",
    backgroundColor: "#0a0a0a",
    borderRadius: "20px",
    border: "1px solid #1f1f1f",
    overflow: "hidden",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
  },
  sidebar: {
    width: "300px",
    backgroundColor: "#111",
    padding: "2.5rem",
    borderRight: "1px solid #1f1f1f",
  },
  sidebarHeader: {
    marginBottom: "3rem",
  },
  sidebarTitle: {
    fontSize: "1.5rem",
    fontWeight: 800,
    color: "#f8fafc",
    letterSpacing: "0.05em",
  },
  sidebarSubtitle: {
    color: "#64748b",
    fontSize: "0.875rem",
  },
  steps: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  step: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "1rem",
    borderRadius: "12px",
    color: "#475569",
    transition: "all 0.3s",
  },
  stepActive: {
    backgroundColor: "rgba(245,158,11,0.1)",
    color: "#f59e0b",
  },
  stepIcon: {
    flexShrink: 0,
  },
  stepLabel: {
    fontWeight: 600,
    fontSize: "0.95rem",
  },
  main: {
    flex: 1,
    padding: "3rem",
    display: "flex",
    flexDirection: "column",
  },
  form: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  section: {
    flex: 1,
    animation: "fadeIn 0.3s ease-out",
  },
  sectionHeader: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#f8fafc",
    marginBottom: "2rem",
  },
  field: {
    marginBottom: "1.5rem",
  },
  row: {
    display: "flex",
    gap: "1.5rem",
    marginBottom: "1.5rem",
  },
  label: {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "#94a3b8",
    marginBottom: "0.5rem",
  },
  star: {
    color: "#ef4444",
  },
  input: {
    width: "100%",
    backgroundColor: "#161616",
    border: "1px solid #2a2a2a",
    padding: "0.75rem 1rem",
    borderRadius: "10px",
    color: "#f8fafc",
    outline: "none",
    transition: "border-color 0.2s",
  },
  uploadArea: {
    height: "150px",
    border: "2px dashed #2a2a2a",
    borderRadius: "12px",
    overflow: "hidden",
  },
  fileInput: {
    display: "none",
  },
  uploadLabel: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    color: "#64748b",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  previewImg: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "1rem",
    marginTop: "2rem",
    paddingTop: "2rem",
    borderTop: "1px solid #1f1f1f",
  },
  nextBtn: {
    backgroundColor: "#f59e0b",
    color: "#000",
    padding: "0.75rem 2rem",
    borderRadius: "10px",
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  backBtn: {
    backgroundColor: "transparent",
    color: "#94a3b8",
    padding: "0.75rem 2rem",
    borderRadius: "10px",
    fontWeight: 700,
    border: "1px solid #2a2a2a",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  submitBtn: {
    backgroundColor: "#22c55e",
    color: "#fff",
    padding: "0.75rem 2rem",
    borderRadius: "10px",
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
  },
  statusContainer: {
    minHeight: "100vh",
    backgroundColor: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
  },
  statusCard: {
    maxWidth: "500px",
    width: "100%",
    backgroundColor: "#0a0a0a",
    border: "1px solid #1f1f1f",
    padding: "4rem 2rem",
    borderRadius: "24px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  statusTitle: {
    fontSize: "1.75rem",
    fontWeight: 800,
    color: "#f8fafc",
    marginBottom: "1rem",
  },
  statusText: {
    color: "#94a3b8",
    lineHeight: "1.6",
    marginBottom: "2.5rem",
  },
  returnBtn: {
    backgroundColor: "#f59e0b",
    color: "#000",
    padding: "0.875rem 2.5rem",
    borderRadius: "12px",
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  center: {
    minHeight: "100vh",
    backgroundColor: "#000",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }
};
