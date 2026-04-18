"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, 
  Recycle, 
  LayoutDashboard, 
  HandHeart, 
  TrendingDown, 
  Wind, 
  Trees, 
  Trash2 
} from 'lucide-react';
import { SustainabilityStats } from '../../lib/sustainability';

interface AboutClientProps {
  stats: SustainabilityStats;
}

export default function AboutClient({ stats }: AboutClientProps) {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <>
      {/* Who We Are */}
      <motion.section 
        className="glassCard"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <Globe color="#22c55e" size={32} />
          <h2 style={{ fontSize: '2rem', margin: 0 }}>Who We Are</h2>
        </div>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.7', color: '#e2e8f0' }}>
          Circular Campus Exchange is a student-driven platform designed to transform how campus communities consume and dispose of everyday items. 
          Instead of letting usable products go to waste, we enable a circular system where items are reused, redistributed, and repurposed.
        </p>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.7', color: '#e2e8f0', marginTop: '1rem' }}>
          Our goal is to reduce unnecessary consumption while making sustainable choices simple, accessible, and measurable.
        </p>
      </motion.section>

      {/* Our Mission */}
      <motion.section 
        className="glassCard"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        style={{ borderLeft: '4px solid #22c55e' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <Recycle color="#22c55e" size={32} />
          <h2 style={{ fontSize: '2rem', margin: 0 }}>Our Mission</h2>
        </div>
        <p style={{ fontSize: '1.5rem', fontWeight: '500', lineHeight: '1.4', color: '#f8fafc' }}>
          "To build a closed-loop campus ecosystem where every item gets a second life and every action contributes to measurable environmental impact."
        </p>
      </motion.section>

      {/* What We Do */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        <ActionCard 
          icon={<Globe color="#22c55e" />} 
          title="Exchange" 
          desc="Enable students to buy, sell, and exchange items easily." 
        />
        <ActionCard 
          icon={<LayoutDashboard color="#22c55e" />} 
          title="Track Impact" 
          desc="Monitor CO₂ saved and waste reduced in real-time." 
        />
        <ActionCard 
          icon={<HandHeart color="#22c55e" />} 
          title="Data Insights" 
          desc="Provide data-driven insights on campus sustainability." 
        />
        <ActionCard 
          icon={<Recycle color="#22c55e" />} 
          title="Circular Loop" 
          desc="Encourage donation and recycling for unsold items." 
        />
      </div>

      {/* Impact So Far (Live Stats) */}
      <motion.section 
        className="glassCard"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
        <h2 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '3rem' }}>Impact So Far 📊</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '3rem' }}>
          <StatBox value={(stats.co2Saved || 2302).toFixed(0)} label="KG CO₂ Saved" icon={<Wind color="#10b981" />} />
          <StatBox value={(stats.wasteDiverted || 342).toString()} label="Items Diverted" icon={<Trash2 color="#3b82f6" />} />
          <StatBox value={(stats.treesSaved || 43).toFixed(1)} label="Trees Equivalent" icon={<Trees color="#22c55e" />} />
        </div>
      </motion.section>

      {/* Why It Matters */}
      <motion.section 
        className="glassCard"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <TrendingDown color="#ef4444" size={32} />
          <h2 style={{ fontSize: '2rem', margin: 0 }}>Why It Matters</h2>
        </div>
        <p style={{ fontSize: '1.1rem', color: '#94a3b8', marginBottom: '2rem' }}>
          Modern consumption patterns generate significant waste. By promoting reuse:
        </p>
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '1rem' }}>
          <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.2rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
            Reduce landfill pressure
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.2rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
            Lower carbon emissions
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.2rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
            Extend product lifecycles
          </li>
        </ul>
        <p style={{ fontSize: '1.2rem', marginTop: '2rem', color: '#22c55e', fontWeight: '600' }}>
          Circular Campus Exchange turns everyday transactions into climate-positive actions.
        </p>
      </motion.section>

      {/* Vision */}
      <motion.section 
        className="glassCard"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        style={{ textAlign: 'center', background: 'linear-gradient(rgba(34, 197, 94, 0.1), rgba(15, 23, 42, 0.6))' }}
      >
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Our Vision 🚀</h2>
        <p style={{ fontSize: '1.4rem', lineHeight: '1.6', color: '#e2e8f0' }}>
          A future where every campus operates as a self-sustaining circular economy powered by data, awareness, and responsible behavior.
        </p>
      </motion.section>
    </>
  );
}

function ActionCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <motion.div 
      className="glassCard" 
      style={{ padding: '2rem', marginBottom: 0, textAlign: 'center' }}
      whileHover={{ y: -10 }}
    >
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{title}</h3>
      <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{desc}</p>
    </motion.div>
  );
}

function StatBox({ value, label, icon }: { value: string, label: string, icon: React.ReactNode }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f8fafc', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
        {value}
      </div>
      <div style={{ fontSize: '0.9rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
        {icon} {label}
      </div>
    </div>
  );
}
