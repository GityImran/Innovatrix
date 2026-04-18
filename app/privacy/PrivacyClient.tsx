"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Info, Database, Share2, Lock, History, UserCheck } from 'lucide-react';

export default function PrivacyClient() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <>
      {/* Introduction */}
      <motion.section 
        className="glassCard"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <ShieldCheck color="#22c55e" size={24} />
          <h2 style={{ fontSize: '1.75rem', margin: 0 }}>🔐 Introduction</h2>
        </div>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.7', color: '#e2e8f0' }}>
          Your privacy is important to us. This policy explains how Circular Campus Exchange collects, uses, and protects your information.
        </p>
      </motion.section>

      {/* Information We Collect */}
      <motion.section 
        className="glassCard"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <Database color="#22c55e" size={24} />
          <h2 style={{ fontSize: '1.75rem', margin: 0 }}>📥 Information We Collect</h2>
        </div>
        
        <div style={{ display: 'grid', gap: '2rem' }}>
          <SubSection 
            title="1. Personal Information" 
            items={["Name", "Email address", "Profile details"]} 
          />
          <SubSection 
            title="2. Usage Data" 
            items={["Listings created", "Item interactions (views, purchases)", "Activity timestamps"]} 
          />
          <SubSection 
            title="3. Device & Technical Data" 
            items={["Browser type", "IP address", "Device information"]} 
          />
        </div>
      </motion.section>

      {/* How We Use Your Data */}
      <motion.section 
        className="glassCard"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <Info color="#22c55e" size={24} />
          <h2 style={{ fontSize: '1.75rem', margin: 0 }}>⚙️ How We Use Your Data</h2>
        </div>
        <p style={{ marginBottom: '1.5rem' }}>We use your data to:</p>
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '0.75rem' }}>
          <li style={{ display: 'flex', gap: '0.75rem' }}><span style={{ color: '#22c55e' }}>✔</span> Operate and improve the platform</li>
          <li style={{ display: 'flex', gap: '0.75rem' }}><span style={{ color: '#22c55e' }}>✔</span> Enable buying/selling functionality</li>
          <li style={{ display: 'flex', gap: '0.75rem' }}><span style={{ color: '#22c55e' }}>✔</span> Generate sustainability insights (CO₂ saved, etc.)</li>
          <li style={{ display: 'flex', gap: '0.75rem' }}><span style={{ color: '#22c55e' }}>✔</span> Provide personalized suggestions (donate/recycle)</li>
        </ul>
      </motion.section>

      {/* Data Sharing */}
      <motion.section 
        className="glassCard"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <Share2 color="#22c55e" size={24} />
          <h2 style={{ fontSize: '1.75rem', margin: 0 }}>🔄 Data Sharing</h2>
        </div>
        <p style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#22c55e', marginBottom: '1rem' }}>
          We do not sell your personal data.
        </p>
        <p>We may share data:</p>
        <ul style={{ listStyle: 'none', padding: '1rem 0', display: 'grid', gap: '0.5rem' }}>
          <li>• With service providers (hosting, database)</li>
          <li>• If required by law</li>
        </ul>
      </motion.section>

      {/* Sustainability Analytics */}
      <motion.section 
        className="glassCard"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>🧠 Data for Sustainability Analytics</h2>
        <p style={{ color: '#94a3b8' }}>
          Your activity data (like listings and transactions) is used to calculate environmental metrics. 
          This data is processed in aggregate and does not expose personal identity publicly.
        </p>
      </motion.section>

      {/* Security & Retention */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <motion.section className="glassCard" variants={fadeInUp} initial="hidden" animate="visible">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <Lock color="#22c55e" size={20} />
            <h3>🔐 Data Security</h3>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
            We implement industry-standard security practices to protect your data from unauthorized access, misuse, or disclosure.
          </p>
        </motion.section>

        <motion.section className="glassCard" variants={fadeInUp} initial="hidden" animate="visible">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <History color="#22c55e" size={20} />
            <h3>⏳ Data Retention</h3>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
            We retain data as long as necessary for platform functionality, legal compliance, and analytics improvement.
          </p>
        </motion.section>
      </div>

      {/* Your Rights */}
      <motion.section 
        className="glassCard"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        style={{ marginTop: '2rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <UserCheck color="#22c55e" size={24} />
          <h2 style={{ fontSize: '1.75rem', margin: 0 }}>👤 Your Rights</h2>
        </div>
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          <li style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '0.5rem 1rem', borderRadius: '50px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>Access your data</li>
          <li style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '0.5rem 1rem', borderRadius: '50px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>Request corrections</li>
          <li style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '0.5rem 1rem', borderRadius: '50px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>Request account deletion</li>
        </ul>
      </motion.section>

      {/* Updates */}
      <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem', marginTop: '2rem' }}>
        📅 Policy last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </p>
    </>
  );
}

function SubSection({ title, items }: { title: string, items: string[] }) {
  return (
    <div style={{ paddingLeft: '1.5rem', borderLeft: '2px solid rgba(34, 197, 94, 0.3)' }}>
      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: '#f8fafc' }}>{title}</h3>
      <ul style={{ listStyle: 'none', padding: 0, color: '#94a3b8', fontSize: '1rem', display: 'grid', gap: '0.4rem' }}>
        {items.map((item, idx) => (
          <li key={idx}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}
