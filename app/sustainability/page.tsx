"use client";

import React, { useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight,
  TrendingUp,
  Wind,
  Recycle,
  Globe as GlobeIcon,
  AlertCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import styles from './Sustainability.module.css';
import { getProducts, Product } from '../../lib/productStore';
import { calculateStats, getSuggestions, SustainabilityStats } from '../../lib/sustainability';

// Animation variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

const generateMockHistory = () => {
  const data = [];
  const start = new Date(2026, 2, 21); // Mar 21

  let cumulativeCO2 = 0;
  for (let i = 0; i <= 30; i++) {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    cumulativeCO2 += Math.random() * 5 + 1;
    data.push({
      name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      co2: Math.floor(cumulativeCO2)
    });
  }
  return data;
};

export default function SustainabilityPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<SustainabilityStats | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const allProducts = getProducts();
    setProducts(allProducts);
    setStats(calculateStats(allProducts));
    setSuggestions(getSuggestions(allProducts));
  }, []);

  if (!isClient) return null;

  const pieData = [
    { name: 'Active', value: products.filter(p => p.status === 'active').length || 12 },
    { name: 'Donated', value: products.filter(p => p.expectedPrice === 0).length || 3 },
    { name: 'Reused', value: products.filter(p => p.status === 'sold').length || 5 },
    { name: 'Unsold', value: products.filter(p => p.status === 'draft').length || 2 },
  ];

  const lineData = generateMockHistory();

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>

        {/* Row 1: Title Section */}
        <div className={styles.heroText}>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 className={styles.heroTitleBig} variants={fadeInUp}>
              Sustainability
            </motion.h1>
            <motion.div className={styles.heroTitleSub} variants={fadeInUp}>
              Dashboard
            </motion.div>
          </motion.div>
        </div>

        {/* Row 2: 3-GRAPH ROW */}
        <motion.div
          className={styles.heroChartsRow}
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Chart 1: Line Chart */}
          <motion.div className={styles.inlineChart} variants={fadeInUp}>
            <div className={styles.chartLabel}>
              <Wind color="#10b981" size={20} /> CO₂ Avoidance Over Time
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f0f0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }}
                  itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="co2" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Chart 2: Pie Chart */}
          <motion.div className={styles.inlineChart} variants={fadeInUp}>
            <div className={styles.chartLabel}>
              <Recycle color="#f59e0b" size={20} /> Ecosystem Distribution
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={6}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f0f0f', border: 'none', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '16px', justifyContent: 'center' }}>
              {pieData.map((entry, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94a3b8' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: COLORS[i] }}></div>
                  {entry.name}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Chart 3: Campus Goal Progress */}
          <motion.div className={styles.inlineChart} variants={fadeInUp}>
            <div className={styles.chartLabel}>
              <GlobeIcon color="#22c55e" size={20} /> Campus Goal Progress
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              <div style={{ fontSize: '3rem', fontWeight: '900', color: '#22c55e', textShadow: '0 0 40px rgba(34, 197, 94, 0.2)' }}>Phase 1</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f8fafc', marginTop: '0.5rem' }}>{(stats?.circularityScore || 62).toFixed(0)}% Health</div>
              <div style={{ color: '#64748b', fontSize: '12px', textAlign: 'center', marginTop: '20px', maxWidth: '180px' }}>
                We are 59% of the way to our semester footprint goal!
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Row 3: Stat Column Row (Bottom of Hero) */}
        <motion.div
          className={styles.bottomStatsRow}
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div className={styles.statCard} variants={fadeInUp} whileHover={{ scale: 1.02 }}>
            <div className={styles.cardHeader}>
              <div className={styles.cardDot}></div>
              CO₂ Saved / Energy
            </div>
            <div className={styles.cardValue}>
              {(stats?.co2Saved || 2302.76).toFixed(2)}
            </div>
            <div style={{ color: '#22c55e', fontSize: '0.85rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <TrendingUp size={14} /> 3.65% <span style={{ color: '#64748b', marginLeft: '6px' }}>24hr change</span>
            </div>
          </motion.div>

          <motion.div className={styles.statCard} variants={fadeInUp} whileHover={{ scale: 1.02 }}>
            <div className={styles.cardHeader}>
              <div className={styles.cardDot}></div>
              Trees Preserved
            </div>
            <div className={styles.cardValue}>
              {stats?.treesSaved ? stats.treesSaved.toFixed(0) : '43k'}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem' }}>
              Equivalent impact
            </div>
          </motion.div>

          <motion.div className={styles.statCard} variants={fadeInUp} whileHover={{ scale: 1.02 }}>
            <div className={styles.cardHeader}>
              <div className={styles.cardDot}></div>
              Items Diverted
            </div>
            <div className={styles.cardValue}>
              {stats?.wasteDiverted || '20k'}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem' }}>
              Kept out of landfill
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Secondary Suggestions Area */}
      <section className={styles.dashboardContent}>
        <motion.h2 className={styles.sectionTitle} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
          <AlertCircle color="#f59e0b" size={24} /> Recommended Actions
        </motion.h2>

        <motion.div
          className={styles.suggestionsGrid}
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
        >
          {suggestions.length > 0 ? suggestions.map((s, idx) => (
            <motion.div key={idx} className={styles.suggestionCard} variants={fadeInUp}>
              <div className={styles.suggestionTitle}>{s.title}</div>
              <div className={styles.suggestionMessage}>{s.message}</div>
              <Link href="/seller">
                <button className={styles.suggestionAction}>
                  {s.action} <ArrowRight size={16} />
                </button>
              </Link>
            </motion.div>
          )) : (
            <>
              <motion.div className={styles.suggestionCard} variants={fadeInUp}>
                <div className={styles.suggestionTitle}>Donate textbooks</div>
                <div className={styles.suggestionMessage}>Your old sem books can help someone in need. Consider donating if they don't sell!</div>
                <Link href="/seller">
                  <button className={styles.suggestionAction}>Donate Now <ArrowRight size={16} /></button>
                </Link>
              </motion.div>
              <motion.div className={styles.suggestionCard} variants={fadeInUp}>
                <div className={styles.suggestionTitle}>Recycle E-Waste</div>
                <div className={styles.suggestionMessage}>Broken headphones or old adaptors? Don't bin them. Recycle at the campus hub.</div>
                <Link href="/seller">
                  <button className={styles.suggestionAction}>Find Hub <ArrowRight size={16} /></button>
                </Link>
              </motion.div>
              <motion.div className={styles.suggestionCard} variants={fadeInUp}>
                <div className={styles.suggestionTitle}>Speed up sales</div>
                <div className={styles.suggestionMessage}>Items with a 10% price drop after 7 days are 3x more likely to be reused.</div>
                <Link href="/seller">
                  <button className={styles.suggestionAction}>Drop Price <ArrowRight size={16} /></button>
                </Link>
              </motion.div>
            </>
          )}
        </motion.div>
      </section>
    </div>
  );
}
