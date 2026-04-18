import React from "react";
import Header from "@/app/components/Header/Header";
import CategoriesNav from "@/app/components/CategoriesNav/CategoriesNav";
import NewRequestForm from "./NewRequestForm";

export default function NewRequestPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#080808', color: '#e2e8f0' }}>
      <Header />
      <CategoriesNav />

      <main style={{ flex: 1, maxWidth: '800px', margin: '0 auto', padding: '48px 24px', width: '100%' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 8px 0', background: 'linear-gradient(135deg, #fff 60%, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            📢 Post a Request
          </h1>
          <p style={{ margin: 0, fontSize: '16px', color: '#64748b' }}>
            Tell the community what you need
          </p>
        </div>

        <NewRequestForm />
      </main>
    </div>
  );
}
